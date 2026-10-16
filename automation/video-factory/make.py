"""Modonty video factory (sample): article script -> regular video + Shorts cut from it.

    python make.py            # everything
    python make.py long       # regular video + thumbnail only
    python make.py shorts     # Shorts only (needs the voice cache from a previous run)
"""
import hashlib, json, os, re, subprocess, sys
from PIL import Image, ImageDraw
from overlays import render as render_overlay
import gemini_voice

S = json.load(open("script.json", encoding="utf-8"))
VOICE_ID = "voice_kq9fd6jmhzqc"       # Gemini designed voice: Saudi Najdi narrator (approved 16 Oct 2026)
FPS, X = 30, 0.3                      # frame rate, transition length
GAP, CH_GAP = 0.28, 0.5               # silence after a beat / after a chapter card
OPAQUE = {"chapter", "quiz", "number", "end"}
CAPTIONED = {"hook", "img", "reveal", "list", "cta"}
PUNCT = "،.:؟…!,?"
os.makedirs("build/voice-gemini", exist_ok=True)


def ff(*args):
    r = subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *args])
    if r.returncode:
        raise SystemExit("ffmpeg failed")


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout)


# ---------- voice ----------
def speech_spans(path):
    """Speech intervals between silences (Gemini TTS gives no word timings, so captions align to pauses)."""
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "silencedetect=noise=-38dB:d=0.16", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", log)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", log)]
    total, spans, t = dur(path), [], 0.0
    for s, e in zip(starts, ends + [None] * (len(starts) - len(ends))):
        if s - t > 0.12: spans.append([t, s])
        t = e if e is not None else total
    if total - t > 0.12: spans.append([t, total])
    return spans


def align(text, path):
    """Word timings: phrases (split on punctuation) mapped to speech spans, words spread by length inside."""
    toks = text.split()
    phrases, cur = [], []
    for tk in toks:
        cur.append(tk)
        if tk[-1] in PUNCT: phrases.append(cur); cur = []
    if cur: phrases.append(cur)
    spans = speech_spans(path)
    if len(spans) != len(phrases):  # fall back: one span from first to last speech, split by length
        a, b = (spans[0][0], spans[-1][1]) if spans else (0.0, dur(path))
        L = sum(len("".join(p)) for p in phrases)
        spans, t = [], a
        for p in phrases:
            d = (b - a) * len("".join(p)) / L
            spans.append([t, t + d]); t += d
    words = []
    for p, (a, b) in zip(phrases, spans):
        L = sum(len(w) + 1 for w in p); t = a
        for w in p:
            d = (b - a) * (len(w) + 1) / L
            words.append({"t": round(t, 3), "d": round(d * 0.92, 3), "w": w.strip(PUNCT)})
            t += d
    return words


import time
# Gemini TTS on the modonty project (Tier 1, read in AI Studio 16 Oct 2026): 10 requests/min, 100 requests/day.
# So beats are voiced in GROUPS (one request per ~6 sentences) and split back on the pauses between them.
MIN_GAP_S, GROUP_MAX_TEXTS, GROUP_MAX_WORDS = 6.5, 6, 110
_last_call = [0.0]
STATS = {"tts_requests": 0, "tts_429": 0, "group_fallbacks": 0}


def beat_path(text):
    return f"build/voice-gemini/{hashlib.md5((VOICE_ID + text).encode()).hexdigest()[:12]}.wav"


def tts(text, out):
    for attempt in range(8):
        wait = MIN_GAP_S - (time.time() - _last_call[0])
        if wait > 0: time.sleep(wait)
        if attempt: time.sleep(min(90, 15 * attempt))   # back off on 429 / timeouts
        _last_call[0] = time.time()
        STATS["tts_requests"] += 1
        st, raw = gemini_voice.call("POST", "/interactions", body={
            "model": "gemini-3.8-flash-tts",
            "input": [{"type": "user_input", "content": [{"type": "text", "text": text}]}],
            "response_format": {"type": "audio"},
            "generation_config": {"speech_config": [{"voice": VOICE_ID}]}})
        if st == 429: STATS["tts_429"] += 1
        if st == 200 and gemini_voice.save_audio(raw, out): return
    raise SystemExit(f"Gemini TTS failed ({st}) for: {text[:40]}")


def split_group(texts, wav):
    """Cut one group recording into len(texts) pieces at the longest pauses; None if the cut looks wrong."""
    n, total = len(texts), dur(wav)
    log = subprocess.run(["ffmpeg", "-hide_banner", "-i", wav, "-af", "silencedetect=noise=-38dB:d=0.2", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    raw = [(float(a), float(b)) for a, b in zip(re.findall(r"silence_start: ([\d.]+)", log), re.findall(r"silence_end: ([\d.]+)", log))]
    sil = []
    for s in raw:                                                          # merge pauses split by a breath
        if sil and s[0] - sil[-1][1] < 0.12: sil[-1] = (sil[-1][0], s[1])
        else: sil.append(s)
    sil = [s for s in sil if s[0] > 0.3 and s[1] < total - 0.3 and s[1] - s[0] >= 0.2]   # inner pauses only
    if len(sil) < n - 1: return None
    # each cut = the pause nearest to where the text says the sentence should end (longer pauses win ties)
    chars = [len(t) for t in texts]
    cuts, used, acc = [], set(), 0
    for i in range(n - 1):
        acc += chars[i]
        expect = total * acc / sum(chars)
        j = min((k for k in range(len(sil)) if k not in used and (not cuts or (sil[k][0] + sil[k][1]) / 2 > cuts[-1])),
                key=lambda k: abs((sil[k][0] + sil[k][1]) / 2 - expect) - 0.8 * (sil[k][1] - sil[k][0]), default=None)
        if j is None: return None
        used.add(j); cuts.append((sil[j][0] + sil[j][1]) / 2)
    edges = [0.0] + cuts + [total]
    for i in range(n):                                                     # each piece's share of time vs share of text
        share_t, share_c = (edges[i + 1] - edges[i]) / total, chars[i] / sum(chars)
        if not 0.45 <= share_t / share_c <= 2.0: return None
    return edges


def prevoice(texts):
    """Voice every uncached text, ~6 per request, and cache each one as its own beat file."""
    t0 = time.time()
    try:
        _prevoice(texts)
    finally:
        STATS["voice_seconds"] = round(STATS.get("voice_seconds", 0) + time.time() - t0, 1)


def _prevoice(texts):
    todo = [t for t in dict.fromkeys(texts) if t and not os.path.exists(beat_path(t))]
    groups, cur = [], []
    for t in todo:
        if cur and (len(cur) >= GROUP_MAX_TEXTS or sum(len(x.split()) for x in cur) + len(t.split()) > GROUP_MAX_WORDS):
            groups.append(cur); cur = []
        cur.append(t)
    if cur: groups.append(cur)
    for g in groups:
        if len(g) == 1:
            tts(g[0], beat_path(g[0])); continue
        gw = f"build/voice-gemini/group_{hashlib.md5('|'.join(g).encode()).hexdigest()[:10]}.wav"
        if not os.path.exists(gw): tts("\n\n".join(g), gw)
        edges = split_group(g, gw)
        if edges is None:                                                  # unreliable cut → one request per beat
            STATS["group_fallbacks"] += 1
            for t in g: tts(t, beat_path(t))
            continue
        for i, t in enumerate(g):
            # trim only the edges (reverse trick for the tail) — never the pauses inside a sentence
            edge_trim = "silenceremove=start_periods=1:start_threshold=-45dB"
            ff("-i", gw, "-af", f"atrim={edges[i]:.3f}:{edges[i + 1]:.3f},asetpts=PTS-STARTPTS,"
               f"{edge_trim},areverse,{edge_trim},areverse", beat_path(t))


def voice(text):
    p = beat_path(text)
    if not os.path.exists(p):
        tts(text, p)
    if not os.path.exists(p + ".json"):
        json.dump(align(text, p), open(p + ".json", "w", encoding="utf-8"), ensure_ascii=False)
    return p, json.load(open(p + ".json", encoding="utf-8"))


def sting():
    p = "build/sting.wav"
    if not os.path.exists(p):
        e = ("0.32*sin(2*PI*659.25*t)*exp(-5*t)"
             "+0.30*sin(2*PI*987.77*t)*exp(-4*(t-0.16))*gte(t,0.16)"
             "+0.18*sin(2*PI*1318.5*t)*exp(-3.2*(t-0.32))*gte(t,0.32)")
        ff("-f", "lavfi", "-i", f"aevalsrc='{e}':s=48000:d=1.4", "-af", "aecho=0.6:0.5:60|120:0.25|0.15,afade=t=out:st=1.0:d=0.4", p)
    return p


# ---------- timelines ----------
def timeline_long():
    beats = []
    for ch in S["long"]:
        for b in ch["beats"]:
            beats.append({**b, "n": ch["n"], "series": ch["series"], "title": ch["title"]})
    return finish(beats)


def timeline_short(sh):
    ch = S["long"][sh["chapter"]]
    beats = [{**sh["hook"], "tag": sh["series"]}]
    for i in sh["beats"]:
        b = dict(ch["beats"][i]); b["tag"] = sh["series"]
        beats.append(b)
    beats.append({**sh["cta"], "tag": sh["series"]})
    beats.append({"kind": "end", "img": sh["cta"]["img"], "text": "", "hold": 1.6})
    return finish(beats)


def finish(beats):
    prevoice([b["text"] for b in beats if b.get("text")])
    t = 0.0
    for b in beats:
        if b.get("text"):
            b["audio"], words = voice(b["text"])
            a = dur(b["audio"])
        else:
            b["audio"], words, a = None, [], 0.0
        gap = CH_GAP if b["kind"] == "chapter" else GAP
        b["start"], b["dur"] = round(t, 3), round(a + gap + b.get("hold", 0), 3)
        b["words"] = [{**w, "t": t + w["t"]} for w in words]
        t += b["dur"]
    return {"beats": beats, "total": round(t, 3)}


# ---------- pictures ----------
def mask(w, h, r):
    p = f"build/mask_{w}x{h}.png"
    if not os.path.exists(p):
        m = Image.new("L", (w, h), 0)
        ImageDraw.Draw(m).rounded_rectangle([0, 0, w - 1, h - 1], r, fill=255)
        m.save(p)
    return p


def scene(b, i, mode, last, tag):
    W, H = (1920, 1080) if mode == "long" else (1080, 1920)
    L = b["dur"] + (0 if last else X)
    ov = render_overlay({"mode": mode, "client": S["client"], **{k: v for k, v in b.items() if k not in ("words", "audio")}},
                        f"build/{tag}_ov_{i:02d}.png")
    out = f"build/{tag}_sc_{i:02d}.mp4"
    k = b["kind"]
    if k in OPAQUE and k != "end":
        fc = f"color=c=0x0E065A:s={W}x{H}:r={FPS}:d={L}[bg];[bg][1:v]overlay=0:0,format=yuv420p[v]"
        ff("-f", "lavfi", "-i", "nullsrc", "-loop", "1", "-t", str(L), "-i", ov, "-filter_complex", fc,
           "-map", "[v]", "-t", str(L), "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", out)
        return out
    src = f"img/{b.get('img', 1)}.webp"
    iw, ih = Image.open(src).size
    bg = (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=28:4,"
          f"eq=brightness=-0.34:saturation=0.7[bg]")
    if k == "end":
        fc = bg + f";[bg][1:v]overlay=0:0,format=yuv420p[v]"
        ff("-loop", "1", "-t", str(L), "-i", src, "-loop", "1", "-t", str(L), "-i", ov, "-filter_complex", fc,
           "-map", "[v]", "-t", str(L), "-r", str(FPS), "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", out)
        return out
    if mode == "long":
        cw = 1040 if iw > ih else 620
        cx, cy, r = 616, 560, 32
    else:
        cw = 1000 if iw > ih else 860
        cx, cy, r = 540, 820, 36
    ch = round(cw * ih / iw / 2) * 2
    m = mask(cw, ch, r)
    fc = (bg + f";[0:v]scale=w='{cw}*(1+0.06*t/{L})':h=-2:eval=frame,crop={cw}:{ch},format=rgba[fg0];"
          f"[2:v]format=gray[m];[fg0][m]alphamerge[fg];"
          f"[bg][fg]overlay=x={cx}-w/2:y={cy}-h/2[c];[c][1:v]overlay=0:0,format=yuv420p[v]")
    ff("-loop", "1", "-t", str(L), "-i", src, "-loop", "1", "-t", str(L), "-i", ov, "-loop", "1", "-t", str(L), "-i", m,
       "-filter_complex", fc, "-map", "[v]", "-t", str(L), "-r", str(FPS), "-c:v", "libx264", "-crf", "18",
       "-preset", "veryfast", out)
    return out


JOIN_CHUNK = 6   # clips per xfade graph: one 33-input graph needed >3 GB and was OOM-killed on the VPS (16 Oct 2026)


def _xfade(clips, durs, kinds, out):
    """xfade a list of clips; durs[i] = slot length of clip i (each clip but the last is X longer than its slot)."""
    if len(clips) == 1:
        ff("-i", clips[0], "-c", "copy", out); return
    ins, fc, prev, acc = [], [], "0:v", 0.0
    for c in clips: ins += ["-i", c]
    for i in range(1, len(clips)):
        acc += durs[i - 1]
        tr = "wipeleft" if kinds[i] in ("chapter", "end") else "fade"
        fc.append(f"[{prev}][{i}:v]xfade=transition={tr}:duration={X}:offset={acc:.3f}[x{i}]")
        prev = f"x{i}"
    ff(*ins, "-filter_complex", ";".join(fc), "-map", f"[{prev}]", "-c:v", "libx264", "-crf", "18", "-preset", "veryfast", out)


def join(clips, tl, out):
    """Join scene clips in chunks of JOIN_CHUNK, then join the chunks — same timing, bounded memory."""
    durs = [b["dur"] for b in tl["beats"]]
    kinds = [b["kind"] for b in tl["beats"]]
    if len(clips) <= JOIN_CHUNK:
        _xfade(clips, durs, kinds, out); return
    parts, pdurs, pkinds = [], [], []
    for s in range(0, len(clips), JOIN_CHUNK):
        e = min(s + JOIN_CHUNK, len(clips))
        p = out.replace(".mp4", f"_part{s // JOIN_CHUNK:02d}.mp4")
        _xfade(clips[s:e], durs[s:e], kinds[s:e], p)
        parts.append(p); pdurs.append(sum(durs[s:e])); pkinds.append(kinds[s])
    _xfade(parts, pdurs, pkinds, out)


def audio(tl, out):
    ins, fc, n = [], [], 0
    for b in tl["beats"]:
        if b["audio"]:
            ins += ["-i", b["audio"]]
            fc.append(f"[{n}:a]aresample=48000,aformat=channel_layouts=mono,apad,atrim=0:{b['dur']}[a{n}]")
        else:
            ins += ["-f", "lavfi", "-t", str(b["dur"]), "-i", "anullsrc=r=48000:cl=mono"]
            fc.append(f"[{n}:a]atrim=0:{b['dur']}[a{n}]")
        n += 1
    end = tl["beats"][-1]
    st_at = int((end["start"] + max(0.2, end["dur"] - (end.get("hold", 0) + 0.6))) * 1000)
    ins += ["-i", sting()]
    fc.append("".join(f"[a{i}]" for i in range(n)) + f"concat=n={n}:v=0:a=1[voice]")
    fc.append(f"[{n}:a]aformat=channel_layouts=mono,adelay={st_at}|{st_at},volume=0.9[st]")
    fc.append("[voice][st]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7[a]")
    ff(*ins, "-filter_complex", ";".join(fc), "-map", "[a]", "-ar", "48000", "-c:a", "pcm_s16le", out)


# ---------- captions ----------
def ts(t):
    return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"


def captions(tl, mode, out):
    W, H = (1920, 1080) if mode == "long" else (1080, 1920)
    size, y, maxw = (50, 1000, 5) if mode == "long" else (80, 1420, 3)
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,Tajawal ExtraBold,{size},&H00FFFFFF,&H00FFFFFF,&H005A060E,&H80000000,0,0,0,0,100,100,0,0,1,{5 if mode == 'long' else 7},2,5,80,80,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev, srt, n = [], [], 0
    for b in tl["beats"]:
        if b["kind"] not in CAPTIONED or not b["words"]:
            continue
        words, toks = b["words"], b["text"].split()
        stops = [t[-1] in "،.:؟…!" for t in toks] if len(toks) == len(words) else [False] * len(words)
        chunks, cur = [], []
        for j, w in enumerate(words):
            cur.append(w)
            gap = (words[j + 1]["t"] - (w["t"] + w["d"])) if j + 1 < len(words) else 9
            if len(cur) == maxw or gap > 0.3 or stops[j]:
                chunks.append(cur); cur = []
        if cur: chunks.append(cur)
        end_b = b["start"] + b["dur"]
        for k, c in enumerate(chunks):
            a = c[0]["t"]
            z = chunks[k + 1][0]["t"] if k + 1 < len(chunks) else min(end_b, c[-1]["t"] + c[-1]["d"] + 0.4)
            txt = " ".join(x["w"] for x in c)  # plain line: no mid-line overrides in Arabic
            ev.append(f"Dialogue: 1,{ts(a)},{ts(z)},Cap,,0,0,0,,{{\\pos({W // 2},{y})\\fscx94\\fscy94\\t(0,110,\\fscx100\\fscy100)}}{txt}")
            n += 1
            srt.append(f"{n}\n{ts(a).replace('.', ',')}0 --> {ts(z).replace('.', ',')}0\n{txt}\n")
    open(out, "w", encoding="utf-8-sig").write(head + "\n".join(ev) + "\n")
    if mode == "long":
        open(out.replace(".ass", ".srt"), "w", encoding="utf-8").write("\n".join(srt))


def final(video, wav, ass, total, mode, out):
    W = 1920 if mode == "long" else 1080
    fc = (f"color=c=0x00D8D8:s={W}x8:r={FPS}[bar];[0:v][bar]overlay=x='W-W*t/{total}':y=0:shortest=1,"
          f"ass={ass}:fontsdir=fonts[v]")
    ff("-i", video, "-i", wav, "-filter_complex", fc, "-map", "[v]", "-map", "1:a", "-c:v", "libx264", "-crf", "20",
       "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart",
       "-shortest", out)


def build(tl, mode, tag, out):
    json.dump(tl, open(f"build/{tag}_timeline.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    n = len(tl["beats"])
    clips = [scene(b, i, mode, i == n - 1, tag) for i, b in enumerate(tl["beats"])]
    join(clips, tl, f"build/{tag}_video.mp4")
    audio(tl, f"build/{tag}_audio.wav")
    captions(tl, mode, f"build/{tag}_captions.ass")
    final(f"build/{tag}_video.mp4", f"build/{tag}_audio.wav", f"build/{tag}_captions.ass", tl["total"], mode, out)
    print(out, tl["total"], "s")


def thumbnail():
    ov = render_overlay({"mode": "thumb", "kind": "thumb", "words": S["thumb_words"]}, "build/thumb_ov.png")
    fc = ("[0:v]scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,eq=brightness=-0.05[bg];"
          "[bg][1:v]overlay=0:0")
    # the article's hook image if it has one, else its first image — never a hard-coded file
    hook_img = next((b.get("img") for ch in S["long"] for b in ch["beats"] if b.get("kind") == "hook" and b.get("img")), 1)
    src = f"img/{hook_img}.webp" if os.path.exists(f"img/{hook_img}.webp") else "img/1.webp"
    ff("-i", src, "-i", ov, "-filter_complex", fc, "-frames:v", "1", "out/thumbnail.png")


if __name__ == "__main__":
    os.makedirs("out", exist_ok=True)
    what = sys.argv[1] if len(sys.argv) > 1 else "all"
    if what in ("all", "long"):
        build(timeline_long(), "long", "long", "out/modonty-video.mp4")
        thumbnail()
    if what in ("all", "shorts"):
        for sh in S["shorts"]:
            build(timeline_short(sh), "short", sh["name"], f"out/{sh['name']}.mp4")
    json.dump(STATS, open("build/voice_stats.json", "w"), indent=1)
    print("voice", STATS)
