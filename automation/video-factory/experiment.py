"""Phase B experiment: article URL → finished videos with NO human edit, timing every step.

    python experiment.py <out-root> <url> [<url> ...]

For each article: fresh work folder (engine copied in) → fetch → write_script (+ validation) → make.py all
→ voice check (Gemini transcribes the regular video's audio and it is compared with the script).
Writes <out-root>/experiment.json with per-step seconds, Claude usage, Gemini retries and results.
"""
import base64, difflib, json, os, re, shutil, subprocess, sys, time

import config

HERE = os.path.dirname(os.path.abspath(__file__))
# Work folders are copies that may sit outside the repo — hand them the repo's env files through MODONTY_REPO (D22).
if config.REPO:
    os.environ.setdefault("MODONTY_REPO", config.REPO)


def step(name, cmd, cwd, log):
    t0 = time.time()
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                       env={**os.environ, "PYTHONIOENCODING": "utf-8"})
    log[name] = {"seconds": round(time.time() - t0, 1), "exit": r.returncode, "tail": (r.stdout + r.stderr)[-600:]}
    return r.returncode == 0


def voice_check(work):
    sys.path.insert(0, work)
    import gemini_voice
    tl = json.load(open(os.path.join(work, "build", "long_timeline.json"), encoding="utf-8"))
    script_text = " ".join(b["text"] for b in tl["beats"] if b.get("text"))
    wav = os.path.join(work, "build", "long_audio.wav")
    mp3 = os.path.join(work, "build", "long_audio_check.mp3")
    subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", wav, "-ac", "1", "-b:a", "48k", mp3])
    body = {"contents": [{"parts": [{"inline_data": {"mime_type": "audio/mp3", "data": base64.b64encode(open(mp3, "rb").read()).decode()}},
                                    {"text": "Transcribe this Arabic audio exactly in Arabic script. Output only the transcript."}]}]}
    for attempt in range(6):
        if attempt: time.sleep(20 * attempt)
        st, raw = gemini_voice.call("POST", "/models/gemini-2.5-flash:generateContent", body=body)
        if st == 200: break
    if st != 200:
        return {"status": st}
    heard = "".join(p.get("text", "") for p in json.loads(raw)["candidates"][0]["content"]["parts"])
    n = lambda s: re.sub(r"\s+", " ", re.sub(r"[^\w\s]", " ", re.sub(r"[ً-ْ]", "", s))).strip().split()
    a, b = n(script_text), n(heard)
    ratio = difflib.SequenceMatcher(None, a, b).ratio()
    return {"word_match": round(ratio, 3), "script_words": len(a), "heard_words": len(b)}


def main():
    root, urls = sys.argv[1], sys.argv[2:]
    os.makedirs(root, exist_ok=True)
    results = []
    for i, url in enumerate(urls, 1):
        work = os.path.join(root, f"article-{i}")
        # resume: refresh engine code, keep data already produced (article, script, cached voice)
        shutil.copytree(HERE, work, ignore=shutil.ignore_patterns("__pycache__", "experiment.py"), dirs_exist_ok=True)
        log = {"url": url}
        t0 = time.time()
        have = lambda f: os.path.exists(os.path.join(work, f))
        ok = (have("article.json") or step("fetch", [sys.executable, "fetch_article.py", url], work, log))
        checked = have("script.check.json") and json.load(open(os.path.join(work, "script.check.json"), encoding="utf-8")).get("ok")
        ok = ok and (checked or step("script", [sys.executable, "write_script.py"], work, log))
        if os.path.exists(os.path.join(work, "script.json")):  # render even if validation failed, to show the result
            step("render", [sys.executable, "make.py", "all"], work, log)
            try: log["voice_check"] = voice_check(work)
            except Exception as e: log["voice_check"] = {"error": str(e)[:200]}
        log["total_seconds"] = round(time.time() - t0, 1)
        for f, key in (("script.check.json", "check"), ("usage.json", "usage"), ("article.json", "article"), ("build/voice_stats.json", "voice_stats")):
            p = os.path.join(work, f)
            if os.path.exists(p): log[key] = json.load(open(p, encoding="utf-8"))
        log["outputs"] = sorted(os.listdir(os.path.join(work, "out"))) if os.path.exists(os.path.join(work, "out")) else []
        log["gemini_voice_files"] = len([f for f in os.listdir(os.path.join(work, "build", "voice-gemini"))
                                         if f.endswith(".wav")]) if os.path.exists(os.path.join(work, "build", "voice-gemini")) else 0
        results.append(log)
        json.dump(results, open(os.path.join(root, "experiment.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        print(f"[{i}] {url[-50:]} total {log['total_seconds']}s outputs={log['outputs']}", flush=True)


if __name__ == "__main__":
    main()
