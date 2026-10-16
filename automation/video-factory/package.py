"""M8 package: platform copy for every asset, from script.json + the rendered timeline.

    python package.py          # writes copy.json (keys follow the admin contract: long, short-1, short-2, short-3)

YouTube chapters follow YouTube's rules (first 00:00, at least 3, each at least 10 s); TikTok and Instagram get a
caption + hashtags for manual posting. No emoji (Modonty brand rule).
"""
import json, re, urllib.parse

S = json.load(open("script.json", encoding="utf-8"))
A = json.load(open("article.json", encoding="utf-8"))
TL = json.load(open("build/long_timeline.json", encoding="utf-8"))
URL = A["url"]
SLUG = urllib.parse.unquote(URL.rstrip("/").rsplit("/", 1)[-1])
# The link people READ in a description: Arabic letters, not %D9%85%D8%A7… (Khalid 16 Oct 2026: «شكله جدا بشع»).
# Measured the same day on WOpMBP_JL98: YouTube shows «…/articles/ما-ه...» and the link still opens the full
# Arabic URL with its utm. Only the path is decoded — the query stays as it is.
READABLE_URL = urllib.parse.unquote(URL)


def tag(s):
    return "#" + re.sub(r"[^\w]", "", s.replace(" ", "_")).strip("_")


def utm(medium):
    return f"{READABLE_URL}?utm_source=youtube&utm_medium={medium}&utm_campaign=video-factory"


def mmss(t):
    t = int(t)
    return f"{t // 60:02d}:{t % 60:02d}" if t < 3600 else f"{t // 3600}:{t % 3600 // 60:02d}:{t % 60:02d}"


def chapters():
    marks = [(0.0, "المقدمة")]
    for ch in S["long"][1:-1]:                       # skip the hook chapter and the end card
        start = next((b["start"] for b in TL["beats"] if b.get("n") == ch["n"]), None)
        if start is None: continue
        if start - marks[-1][0] < 10: continue        # YouTube: every chapter at least 10 s
        marks.append((start, ch["series"] or ch["title"]))
    return "\n".join(f"{mmss(t)} {name}" for t, name in marks) if len(marks) >= 3 else ""


hashtags = [tag("مدونتي"), tag(S.get("client_short") or S["client"])]


def yt_tags(extra=()):
    """snippet.tags: title head, client, series names, Modonty — ≤ 500 chars total (YouTube limit)."""
    head = re.split(r"[:|؟?]", S["title"])[0].strip()
    # search phrases written by the script step come first; series names only as a fallback for older scripts
    base = S.get("tags") or [c["series"] for c in S["long"] if c.get("series")]
    cand = [*base, head, S.get("client_short") or S["client"], *extra, "مدونتي"]
    out, size = [], 0
    for t in dict.fromkeys(x.strip() for x in cand if x and x.strip()):
        if size + len(t) + 1 > 500: break
        out.append(t); size += len(t) + 1
    return out
hook = S["long"][0]["beats"][0]["text"]
intro = next((b["text"] for b in S["long"][0]["beats"] if b["kind"] == "img"), "")
chap = chapters()
copy = {"long": {"youtube": {
    "title": S["title"][:100],
    "description": "\n".join(x for x in [
        hook, intro, "",
        "المقالة كاملة على مدونتي: " + utm("video"), "",
        ("الفصول:\n" + chap) if chap else "", "",
        f"المعلومات من مقالة {S['client']} على مدونتي.",
        " ".join(hashtags)] if x is not None).strip(),
    "chapters": chap, "tags": yt_tags()}}}

for i, sh in enumerate(S["shorts"], 1):
    tags = hashtags + [tag(sh["series"])]
    h = sh["hook"]["text"]
    copy[f"short-{i}"] = {
        "file": f"out/{sh['name']}.mp4",
        "series": sh["series"],
        "youtube": {"title": f"{sh['hook']['key']} | {sh['series']}"[:100],
                    "description": f"{h}\n\nالفيديو الكامل من الرابط فوق العنوان.\nالمقالة: {utm('shorts')}\n\n{' '.join(tags)}",
                    "tags": yt_tags([sh["series"], "Shorts"])},
        "tiktok": {"caption": f"{h} التفاصيل كاملة في مدونتي.", "hashtags": [t[1:] for t in tags]},
        "instagram": {"caption": f"{h}\n\nالتفاصيل كاملة في مقالة {S.get('client_short') or S['client']} على مدونتي، الرابط في البايو.\n\n{' '.join(tags)}"},
    }

json.dump(copy, open("copy.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps({"assets": list(copy), "chapters": chap.count("\n") + 1 if chap else 0}, ensure_ascii=False))
