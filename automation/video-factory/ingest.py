"""M9 ingest: upload the outputs to Bunny Storage (zone modonty-reels-media) and register them in the admin.

    python ingest.py --admin http://localhost:3001 --prefix video-factory-dev --revision 1
    python ingest.py --attention --step render --message "…"   # report a step that failed twice

Contract: documents/video-factory/03-contract.md (header x-radar-secret = RADAR_INGEST_SECRET).
Secrets are read from env, else from MODONTY/.env.shared (BUNNY_REELS_*) and admin/.env.local (RADAR_INGEST_SECRET);
nothing secret is printed. Production writes only under the prefix given (decision D20: video-factory-dev/ for tests).
"""
import argparse, hashlib, json, os, re, subprocess, sys, urllib.error, urllib.parse, urllib.request

import config


def env(name, *files):
    """Kept for callers (publish_youtube.py). The file list is ignored: config.env searches the environment,
    ./.env on the VPS, then the repo's env files — same order on Windows and Linux (D22)."""
    return config.env(name)


def dur(p):
    return float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout or 0)


def call(method, url, body, secret):
    req = urllib.request.Request(url, method=method, data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
                                 headers={"Content-Type": "application/json", "x-radar-secret": secret})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b"{}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--admin", default="http://localhost:3001")
    ap.add_argument("--prefix", default="video-factory-dev")
    ap.add_argument("--revision", type=int, default=1)
    ap.add_argument("--attention", action="store_true")
    ap.add_argument("--step"); ap.add_argument("--message"); ap.add_argument("--attempts", type=int, default=2)
    a = ap.parse_args()

    secret = env("RADAR_INGEST_SECRET")
    art = json.load(open("article.json", encoding="utf-8"))
    url = art["url"]

    if a.attention:
        st, res = call("POST", a.admin + "/api/videos/attention",
                       {"articleUrl": url, "revision": a.revision, "step": a.step, "message": a.message, "attempts": a.attempts}, secret)
        print(st, res); sys.exit(0 if st == 200 else 1)

    zone = env("BUNNY_REELS_STORAGE_ZONE_NAME", ".env.shared")
    key = env("BUNNY_REELS_STORAGE_PASSWORD", ".env.shared")
    cdn = env("BUNNY_REELS_PULL_ZONE_HOSTNAME", ".env.shared")
    host = os.environ.get("BUNNY_STORAGE_HOSTNAME") or "storage.bunnycdn.com"

    S = json.load(open("script.json", encoding="utf-8"))
    copy = json.load(open("copy.json", encoding="utf-8"))
    slug = urllib.parse.unquote(url.rstrip("/").rsplit("/", 1)[-1])
    # ASCII folder: readable prefix of the slug is Arabic, so use a short stable hash of it
    folder = f"{a.prefix}/{hashlib.sha1(slug.encode()).hexdigest()[:12]}/rev-{a.revision}"

    def put(local, name, ctype):
        path = f"{folder}/{name}"
        req = urllib.request.Request(f"https://{host}/{zone}/{path}", method="PUT", data=open(local, "rb").read(),
                                     headers={"AccessKey": key, "Content-Type": ctype})
        with urllib.request.urlopen(req, timeout=600) as r:
            if r.status not in (200, 201): sys.exit(f"bunny upload failed {r.status} for {name}")
        return f"https://{cdn}/{path}"

    long_url = put("out/modonty-video.mp4", "long.mp4", "video/mp4")
    thumb = put("out/thumbnail.png", "thumbnail.png", "image/png")
    srt = put("build/long_captions.srt", "long.srt", "application/x-subrip")
    script_url = put("script.json", "script.json", "application/json")
    shorts, qa = [], []
    for k in sorted(x for x in copy if x.startswith("short-")):
        f = copy[k]["file"]
        d = dur(f)
        if not 20 <= d <= 45: qa.append(f"{k}: {d:.1f}s outside 20-45s")
        shorts.append({"key": k, "series": copy[k]["series"], "url": put(f, f"{k}.mp4", "video/mp4"), "seconds": round(d, 1)})
    long_s = dur("out/modonty-video.mp4")
    if not 120 <= long_s <= 360: qa.append(f"long: {long_s:.0f}s outside 120-360s")

    usage = json.load(open("usage.json", encoding="utf-8")) if os.path.exists("usage.json") else {"claude": []}
    vs = json.load(open("build/voice_stats.json")) if os.path.exists("build/voice_stats.json") else {}
    cl = usage.get("claude", [])
    # step times: experiment/factory run log (fetch, script, render incl. voice) + the voice share from make.py
    steps = {"fetch": 0, "script": 0, "voice": vs.get("voice_seconds", 0), "render": 0}
    log = os.path.join(os.path.dirname(os.getcwd()), "experiment.json")
    if os.path.exists(log):
        run = next((r for r in json.load(open(log, encoding="utf-8")) if r.get("url") == url), {})
        for k in ("fetch", "script", "render"):
            steps[k] = run.get(k, {}).get("seconds", steps[k])
    if not steps["script"]: steps["script"] = round(sum(r.get("seconds", 0) for r in cl), 1)
    if steps["render"] and steps["voice"]: steps["render"] = round(max(0, steps["render"] - steps["voice"]), 1)
    body = {
        "articleUrl": url, "revision": a.revision, "engineVersion": "2026-10-16", "voiceId": "voice_kq9fd6jmhzqc",
        "assets": {"long": {"url": long_url, "seconds": round(long_s, 1), "thumbnail": thumb, "srt": srt}, "shorts": shorts},
        "copy": {k: {p: v for p, v in c.items() if p in ("youtube", "tiktok", "instagram")} for k, c in copy.items()},
        "scriptUrl": script_url,
        "qa": {"passed": not qa, "failures": qa},
        "usage": {"claude": {"inputTokens": sum(r.get("input_tokens", 0) + r.get("cache_read", 0) + r.get("cache_write", 0) for r in cl),
                             "outputTokens": sum(r.get("output_tokens", 0) for r in cl),
                             "seconds": round(sum(r.get("seconds", 0) for r in cl), 1)},
                  "gemini": {"ttsRequests": vs.get("tts_requests", 0), "retries429": vs.get("tts_429", 0)},
                  "stepSeconds": steps},
    }
    st, res = call("POST", a.admin + "/api/videos/ingest", body, secret)
    json.dump({"status": st, "response": res, "folder": folder}, open("ingest.result.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(st, res)
    sys.exit(0 if st == 200 else 1)


if __name__ == "__main__":
    main()
