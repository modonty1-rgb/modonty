"""M12 YouTube publish: approved items from the admin queue → YouTube, in the agreed order.

    python publish_youtube.py --admin http://localhost:3001                 # upload private only (safe default)
    python publish_youtube.py --admin http://localhost:3001 --go-public     # full flow: private → re-check → public → PATCH
    python publish_youtube.py --job <jobId>                                 # limit to one VideoJob

Order agreed with the MODONTY session (16 Oct 2026):
  1 upload PRIVATE  2 re-read GET /api/videos/queue?state=approved  3 still there → set public, then PATCH published
  4 gone → keep private, log locally.   On 409 not-approved read `status` (published = done; anything else = do not publish).
privacyStatus is ALWAYS sent explicitly — the API defaults to public when it is omitted.
Every upload declares containsSyntheticMedia=true (synthetic voice) and selfDeclaredMadeForKids=false.
State: publish_state.json (jobId:asset → YouTube id) so an item is never uploaded twice.
"""
import argparse, json, os, sys, tempfile, urllib.error, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import ingest                     # env() helper + admin call()
import youtube_auth               # OAuth client + refresh token in ~/.modonty-video

STATE = os.path.join(os.getcwd(), "publish_state.json")
YT = "https://www.googleapis.com"


def load_state():
    return json.load(open(STATE, encoding="utf-8")) if os.path.exists(STATE) else {}


def save_state(s):
    json.dump(s, open(STATE, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


def yt(method, url, token, body=None, data=None, ctype="application/json"):
    req = urllib.request.Request(url, method=method,
                                 data=data if data is not None else (json.dumps(body, ensure_ascii=False).encode() if body is not None else None),
                                 headers={"Authorization": "Bearer " + token, "Content-Type": ctype})
    try:
        with urllib.request.urlopen(req, timeout=900) as r:
            return r.status, r.headers, (json.loads(r.read() or b"{}") if "json" in (r.headers.get("Content-Type") or "") else {})
    except urllib.error.HTTPError as e:
        return e.code, e.headers, json.loads(e.read() or b"{}")


def status_part(privacy):
    # videos.update DELETES any status property left out (official docs) — that is how embeddable went false and
    # publicStatsViewable went false on the first video. Always send the full set.
    return {"privacyStatus": privacy, "selfDeclaredMadeForKids": False, "containsSyntheticMedia": True,
            "embeddable": True, "publicStatsViewable": True, "license": "youtube"}


def upload(token, path, copy):
    meta = {"snippet": {"title": copy["title"][:100], "description": copy["description"][:5000], "categoryId": "27",
                        "defaultLanguage": "ar", "defaultAudioLanguage": "ar", "tags": copy.get("tags", [])},
            "status": status_part("private"),
            # the client's logo is in every frame and the client pays Modonty: YouTube's paid-promotion disclosure
            "paidProductPlacementDetails": {"hasPaidProductPlacement": True}}
    st, h, res = yt("POST", f"{YT}/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status,paidProductPlacementDetails",
                    token, body=meta, ctype="application/json; charset=UTF-8")
    if st != 200: raise RuntimeError(f"videos.insert init {st}: {res}")
    st, h, res = yt("PUT", h["Location"], token, data=open(path, "rb").read(), ctype="video/mp4")
    if st not in (200, 201): raise RuntimeError(f"videos.insert upload {st}: {res}")
    return res["id"]


def download(url, suffix):
    fd, p = tempfile.mkstemp(suffix=suffix); os.close(fd)
    urllib.request.urlretrieve(url, p)
    return p


def approved(admin, secret, job=None):
    req = urllib.request.Request(admin + "/api/videos/queue?state=approved", headers={"x-radar-secret": secret})
    with urllib.request.urlopen(req, timeout=60) as r:
        items = json.loads(r.read()).get("items", [])
    return [i for i in items if i.get("platform") == "youtube" and (not job or i.get("jobId") == job)]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--admin", default="http://localhost:3001")
    ap.add_argument("--job")
    ap.add_argument("--go-public", action="store_true")
    a = ap.parse_args()
    secret = ingest.env("RADAR_INGEST_SECRET")
    token = youtube_auth.access_token()
    state = load_state()

    for it in approved(a.admin, secret, a.job):
        k = f"{it['jobId']}:{it['asset']}"
        try:
            vid = state.get(k, {}).get("videoId")
            if not vid:
                f = download(it["file"], ".mp4")
                vid = upload(token, f, it["copy"]["youtube"] if "youtube" in it["copy"] else it["copy"])
                os.remove(f)
                if it.get("thumbnail"):
                    t = download(it["thumbnail"], ".png")
                    st_t, _, r_t = yt("POST", f"{YT}/upload/youtube/v3/thumbnails/set?videoId={vid}", token, data=open(t, "rb").read(), ctype="image/png")
                    os.remove(t)
                    if st_t != 200:   # 403 = channel not phone-verified (custom thumbnails disabled) — video still goes out
                        print("WARN thumbnail", st_t, str(r_t)[:160])
                if it.get("srt"):
                    s = download(it["srt"], ".srt")
                    boundary = "vfboundary"
                    meta = json.dumps({"snippet": {"videoId": vid, "language": "ar", "name": "العربية"}}, ensure_ascii=False)
                    body = (f"--{boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n{meta}\r\n"
                            f"--{boundary}\r\nContent-Type: application/x-subrip\r\n\r\n").encode() + open(s, "rb").read() + f"\r\n--{boundary}--".encode()
                    st_c, _, r_c = yt("POST", f"{YT}/upload/youtube/v3/captions?uploadType=multipart&part=snippet", token, data=body,
                                      ctype=f"multipart/related; boundary={boundary}")
                    os.remove(s)
                    if st_c != 200: print("WARN captions", st_c, str(r_c)[:160])
                state[k] = {"videoId": vid, "privacy": "private"}; save_state(state)
                print("uploaded private", k, vid)
            if not a.go_public:
                print("kept private (no --go-public)", k, vid); continue
            # step 2: still approved?
            if not any(f"{i['jobId']}:{i['asset']}" == k for i in approved(a.admin, secret, it["jobId"])):
                print("no longer approved → stays private", k, vid); continue
            st, _, res = yt("PUT", f"{YT}/youtube/v3/videos?part=status", token, body={"id": vid, "status": status_part("public")})
            if st != 200: raise RuntimeError(f"videos.update public {st}: {res}")
            state[k]["privacy"] = "public"; save_state(state)
            url = f"https://youtu.be/{vid}"
            st, res = ingest.call("PATCH", f"{a.admin}/api/videos/{it['jobId']}/platform",
                                  {"asset": it["asset"], "platform": "youtube", "status": "published", "externalId": vid, "url": url, "error": None}, secret)
            if st == 409:
                print("409", res.get("status"), "→", "already published" if res.get("status") == "published" else "no longer approved", k)
            else:
                print("published", k, url, st)
        except Exception as e:
            ingest.call("PATCH", f"{a.admin}/api/videos/{it['jobId']}/platform",
                        {"asset": it["asset"], "platform": "youtube", "status": "failed", "error": str(e)[:300]}, secret)
            print("failed", k, str(e)[:200])


if __name__ == "__main__":
    main()
