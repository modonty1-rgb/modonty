"""M2 + M3: write script.json from the fetched article with the Claude API, then validate it.

Claude API, not the Max subscription (decision D21, Khalid 16 Oct 2026: «أنا أبغى أستخدم الاي بي اي، التوكن اللي
عندي هذا ما أقدر أستغني عنه»). Key: ANTHROPIC_API_KEY via config.env. Model: SCRIPT_MODEL (default below).

    python write_script.py            # needs article.txt + article.json from fetch_article.py

Every factual beat must carry "source": a sentence copied from article.txt. The validator rejects the
script when a source is not found in the article, and Claude gets one retry with the errors.
Writes: script.json · script.check.json · usage.json (time, tokens, API-equivalent cost).
"""
import difflib, json, os, re, sys, time, urllib.error, urllib.request

from config import env

HERE = os.path.dirname(os.path.abspath(__file__))
# rules: env override → skill/ next to the code (repo layout automation/video-factory/skill) → the Claude skill
SKILL = os.environ.get("MODONTY_SKILL_DIR") or next(
    (p for p in (os.path.join(HERE, "skill"), os.path.expanduser("~/.claude/skills/modonty-video"))
     if os.path.exists(os.path.join(p, "long.md"))), os.path.expanduser("~/.claude/skills/modonty-video"))
MODEL = os.environ.get("SCRIPT_MODEL", "claude-opus-5-5")
API_URL = "https://api.anthropic.com/v1/messages"
# One script measured 16.5k output tokens (H9) — room for the retry with errors, cut off below this.
MAX_TOKENS = int(os.environ.get("SCRIPT_MAX_TOKENS", "32000"))
RETRY_STATUS = {429, 500, 502, 503, 529}
FACTUAL = {"img", "reveal", "list", "number", "quiz"}
KINDS = FACTUAL | {"hook", "chapter", "cta", "end"}
WPS = 2.2  # spoken words per second for the approved Gemini voice, incl. pauses (sample: ~330 words → 158 s)


def norm(s):
    s = re.sub(r"[ً-ْـ]", "", s)                      # tashkeel, tatweel
    s = re.sub("[إأآ]", "ا", s).replace("ى", "ي").replace("ة", "ه")
    s = re.sub(r"[^\w\s]", " ", s)
    return re.sub(r"\s+", " ", s).strip()


def found(src, art_n):
    n = norm(src)
    if len(n) < 12:
        return False
    if n in art_n:
        return True
    # allow a source trimmed or lightly punctuated differently: best window similarity ≥ 0.9
    words, aw = n.split(), art_n.split()
    k = len(words)
    best = 0.0
    for i in range(0, max(1, len(aw) - k + 1)):
        r = difflib.SequenceMatcher(None, n, " ".join(aw[i:i + k])).ratio()
        if r > best:
            best = r
            if best >= 0.9: return True
    return False


def validate(s, art, n_img):
    errs, art_n = [], norm(art)
    if not isinstance(s.get("long"), list) or not s["long"]:
        return ["long: missing chapters"]
    for ci, ch in enumerate(s["long"]):
        if ch.get("n") != ci: errs.append(f"long[{ci}].n must equal its index {ci}")
        for bi, b in enumerate(ch.get("beats", [])):
            where = f"long[{ci}].beats[{bi}]"
            k = b.get("kind")
            if k not in KINDS: errs.append(f"{where}: unknown kind {k}")
            if k in FACTUAL:
                if not b.get("source"): errs.append(f"{where}: factual beat without source")
                elif not found(b["source"], art_n): errs.append(f"{where}: source not found in article: «{b['source'][:70]}»")
            if "img" in b and not (isinstance(b["img"], int) and 1 <= b["img"] <= n_img):
                errs.append(f"{where}: img {b.get('img')} not in 1..{n_img}")
            if k in ("img", "reveal", "list", "hook", "cta", "end") and "img" not in b:
                errs.append(f"{where}: kind {k} needs img")
            need = {"reveal": ["answer", "key"], "list": ["count", "key"], "number": ["number", "sub"], "quiz": ["claim"],
                    "img": ["key"], "hook": ["key"]}.get(k, [])
            errs += [f"{where}: missing {f}" for f in need if not b.get(f)]
            if k != "end" and not b.get("text"): errs.append(f"{where}: missing spoken text")
    words = sum(len(b.get("text", "").split()) for ch in s["long"] for b in ch["beats"])
    if words / WPS < 120: errs.append(f"long video too short: ~{words / WPS:.0f}s (min 120s)")
    if words / WPS > 360: errs.append(f"long video too long: ~{words / WPS:.0f}s (max 360s)")
    for si, sh in enumerate(s.get("shorts", [])):
        where = f"shorts[{si}]"
        c = sh.get("chapter")
        if not isinstance(c, int) or not 0 <= c < len(s["long"]):
            errs.append(f"{where}: bad chapter"); continue
        beats = s["long"][c]["beats"]
        for i in sh.get("beats", []):
            if not 0 <= i < len(beats) or beats[i].get("kind") in ("chapter", "end"):
                errs.append(f"{where}: beat {i} is not a content beat of chapter {c}")
        if not sh.get("hook", {}).get("text") or not sh.get("cta", {}).get("text"):
            errs.append(f"{where}: needs hook.text and cta.text")
        w = len(sh.get("hook", {}).get("text", "").split()) + len(sh.get("cta", {}).get("text", "").split()) + \
            sum(len(beats[i].get("text", "").split()) for i in sh.get("beats", []) if 0 <= i < len(beats))
        if not 25 <= w / WPS + 1.6 <= 45: errs.append(f"{where}: ~{w / WPS + 1.6:.0f}s, needs 25-40s")
    if len(s.get("shorts", [])) != 3: errs.append("need exactly 3 shorts")
    return errs


def prompt(art, meta, example, extra=""):
    rules = open(os.path.join(SKILL, "long.md"), encoding="utf-8").read() + "\n\n" + \
        open(os.path.join(SKILL, "formats.md"), encoding="utf-8").read()
    voice_rules = json.load(open(os.path.join(SKILL, "brand.json"), encoding="utf-8"))["audio"]["script_for_voice"]
    imgs = "\n".join(f"  img {i + 1}: {m['size'][0]}x{m['size'][1]} — {m['name']}" for i, m in enumerate(meta["images"]))
    return f"""You write the video script for Modonty's YouTube channel. Output ONLY one JSON object, no prose, no code fence.

TASK: turn the article below into ONE regular video (chapters) and EXACTLY 3 Shorts cut from it, following the rules.

HARD RULES
- Spoken text ("text") is Saudi dialect (white Najdi), natural, like a well-read Saudi friend. Not Fusha, not Egyptian.
  {voice_rules}
- Use ONLY facts in the article. No outside medical facts, numbers or advice. If the article does not support a chapter shape, skip that chapter.
- Every beat of kind img/reveal/list/number/quiz MUST have "source": a sentence or clause COPIED EXACTLY from the article text (Arabic, same words). The validator rejects any source not found verbatim.
- On-screen "key" lines: max 5 words, the idea not the sentence. "tag" = the series name of the chapter.
- Chapter order and kinds as in the rules. Chapter n must equal its index. First chapter n=0 is the hook chapter (series "", no chapter card). Last chapter is one "end" beat (img, text = closing line pointing to the article on Modonty + subscribe, "hold": 4.0).
- Every chapter except n=0 and the last starts with ONE "chapter" beat whose text is a short spoken lead-in (e.g. «طيب، ليش يصير كذا؟»).
- Total spoken words for the regular video: 300-620 (about 2.5-4.5 minutes at {WPS} words/second). Short sentences.
- Images available (use only these numbers in "img"):
{imgs}
  If there is only one or two images, use more opaque beats (chapter, quiz, number) so the picture keeps changing.
- 3 Shorts: each one series chapter of the regular video. "chapter" = chapter index, "beats" = 2-4 indices of content beats in that chapter,
  "hook" = NEW opening line (not the chapter's first line) with "kind":"hook","img","key","text", "cta" = {{"kind":"cta","img","key":"الفيديو الكامل","text":"..."}} saying the full video is in the link below.
  Each Short must land at 25-40 seconds spoken.
- Beat fields by kind: hook{{img,key,text}} · img{{img,tag,key,text,source}} · reveal{{img,tag,answer,key,text,source}} · list{{img,tag,count,key,text,source}} (count = Arabic-Indic digit ١ ٢ ٣) ·
  chapter{{text}} · quiz{{claim,text,source}} · number{{number,sub,text,source}} · cta{{img,key,text}} · end{{img,text,hold}}.
- Top level: article_url, client (full client name), client_short, voice ("ar-SA"), title (YouTube title with the series idea, ≤ 60 chars), thumb_words (≤ 3 words), tags (6-10 YouTube search phrases a Saudi viewer would actually type for this topic, Arabic, no #, total ≤ 400 chars), long, shorts.

SHAPE EXAMPLE (another article — copy the structure, not the content):
{example}

CHANNEL RULES (Modonty video skill):
{rules}

ARTICLE URL: {meta['url']}
CLIENT FOLDER: {meta['client_dir']}
ARTICLE TEXT:
{art}
{extra}"""


def stream_once(p, key):
    """One streamed POST /v1/messages (anthropic-version 2023-06-01). Streaming, because a ~16k-token answer
    is a long request and a silent non-streamed connection can be dropped on the way."""
    body = {"model": MODEL, "max_tokens": MAX_TOKENS, "stream": True, "messages": [{"role": "user", "content": p}]}
    req = urllib.request.Request(API_URL, method="POST", data=json.dumps(body).encode("utf-8"),
                                 headers={"content-type": "application/json", "anthropic-version": "2023-06-01", "x-api-key": key})
    text, usage, stop = [], {}, None
    with urllib.request.urlopen(req, timeout=900) as r:
        for raw in r:
            line = raw.decode("utf-8").rstrip("\r\n")
            if not line.startswith("data: "):
                continue
            d = json.loads(line[6:])
            kind = d.get("type")
            if kind == "message_start":
                usage.update(d["message"].get("usage", {}))
            elif kind == "content_block_delta" and d["delta"].get("type") == "text_delta":
                text.append(d["delta"]["text"])
            elif kind == "message_delta":
                usage.update(d.get("usage", {}))
                stop = d.get("delta", {}).get("stop_reason")
            elif kind == "error":
                raise RuntimeError(d.get("error", {}).get("message", "stream error"))
    return "".join(text), usage, stop


def ask(p):
    key = env("ANTHROPIC_API_KEY")
    t0 = time.time()
    for attempt in range(4):
        try:
            txt, u, stop = stream_once(p, key)
            break
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:300]
            if e.code in RETRY_STATUS and attempt < 3:
                time.sleep(20 * (attempt + 1))
                continue
            sys.exit(f"Claude API {e.code}: {detail}")
        except (urllib.error.URLError, TimeoutError, ConnectionError, RuntimeError) as e:
            if attempt < 3:
                time.sleep(20 * (attempt + 1))
                continue
            sys.exit(f"Claude API unreachable: {e}")
    m = re.search(r"\{.*\}", txt, re.S)
    # Same keys as the Max version, so ingest.py reads usage.json unchanged. Billed per token now; the dollar
    # figure is not computed here (no price table in code) — read it from the Anthropic console.
    usage = {"seconds": round(time.time() - t0, 1), "model": MODEL, "input_tokens": u.get("input_tokens", 0),
             "cache_read": u.get("cache_read_input_tokens", 0), "cache_write": u.get("cache_creation_input_tokens", 0),
             "output_tokens": u.get("output_tokens", 0), "api_equivalent_usd": None, "is_error": stop == "max_tokens",
             "stop_reason": stop}
    try:
        parsed = json.loads(m.group(0)) if m else None
    except json.JSONDecodeError:
        parsed = None  # the retry tells Claude its output was not JSON
    return parsed, usage, txt


def main():
    art = open("article.txt", encoding="utf-8").read()
    meta = json.load(open("article.json", encoding="utf-8"))
    example = open(os.path.join(HERE, "example-script.json"), encoding="utf-8").read()
    runs, extra, s, errs = [], "", None, ["not run"]
    for attempt in range(2):
        s, usage, raw = ask(prompt(art, meta, example, extra))
        runs.append(usage)
        errs = ["output is not JSON"] if s is None else validate(s, art, len(meta["images"]))
        if not errs:
            break
        extra = "\n\nYOUR PREVIOUS OUTPUT WAS REJECTED. Fix every error and output the full JSON again:\n- " + "\n- ".join(errs) + \
                "\n\nPREVIOUS OUTPUT:\n" + (json.dumps(s, ensure_ascii=False) if s else raw[:4000])
    if s:
        s.setdefault("voice", "ar-SA")
        json.dump(s, open("script.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"ok": not errs, "errors": errs, "attempts": len(runs)}, open("script.check.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump({"claude": runs}, open("usage.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(json.dumps({"ok": not errs, "attempts": len(runs), "errors": errs[:5], "seconds": sum(r["seconds"] for r in runs)}, ensure_ascii=False))
    sys.exit(0 if not errs else 2)


if __name__ == "__main__":
    main()
