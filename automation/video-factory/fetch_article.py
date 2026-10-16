"""Prepare a work folder from a Modonty article: its text, its own images, the client's logo.

    python fetch_article.py <article-url>

Writes into the current folder: article.txt · img/1.webp, 2.webp, … · assets/client-logo.png ·
article.json (title, client, image list) — everything make.py and the script writer need.
"""
import html, json, os, re, sys, urllib.parse, urllib.request
from PIL import Image

url = sys.argv[1]
q = lambda u: urllib.parse.quote(urllib.parse.unquote(u), safe=":/%?=&")
req = urllib.request.Request(q(url), headers={"User-Agent": "Mozilla/5.0"})
h = urllib.request.urlopen(req, timeout=60).read().decode("utf-8")
os.makedirs("img", exist_ok=True); os.makedirs("assets", exist_ok=True)

# text: from the <h1> on, paragraphs + headings + list items
seg = re.sub(r"<(script|style)[^>]*>.*?</\1>", "", h[h.find("<h1"):], flags=re.S)
paras = [html.unescape(re.sub(r"<[^>]+>", "", p)).strip()
         for p in re.findall(r"<(?:p|h[1-4]|li)[^>]*>(.*?)</(?:p|h[1-4]|li)>", seg, re.S)]
open("article.txt", "w", encoding="utf-8").write("\n".join(p for p in paras if len(p) > 2))
title = paras[0] if paras else ""

# client = the folder of the og:image under modonty-clients/post/<client>/
og = re.search(r'<meta property="og:image" content="([^"]+)"', h).group(1)
client_dir = urllib.parse.unquote(og).split("/post/")[1].split("/")[0]

# the article's own images: every CDN image in that client folder that appears in this article body
# the hero sits before the <h1>; related articles start at «اقرأ أيضاً» — take everything before it
body = h[:h.find("اقرأ أيضاً") if "اقرأ أيضاً" in h else len(h)]
cands = {html.unescape(u).rstrip("\\") for u in re.findall(r'https://modonty-clients\.b-cdn\.net/post/[^"\s\\)]+', body)}
cands = [u for u in cands if urllib.parse.unquote(u).split("/post/")[1].startswith(client_dir + "/")]
best = {}
for u in cands:  # one file per image: prefer the plain file, then 16x9, then 1x1
    base = re.sub(r"__(16x9|1x1|4x3)(?=\.\w+$)", "", urllib.parse.unquote(u))
    rank = 0 if "__" not in u else 1 if "16x9" in u else 2 if "1x1" in u else 3
    if base not in best or rank < best[base][0]:
        best[base] = (rank, u)
imgs = []
for i, (_, u) in enumerate(sorted(best.values()), 1):
    p = f"img/{i}.webp"
    urllib.request.urlretrieve(q(u), p)
    imgs.append({"file": p, "size": Image.open(p).size, "name": urllib.parse.unquote(u).rsplit("/", 1)[-1][:90]})

# client logo: the JSON-LD logo that is not Modonty's own
logos = [html.unescape(u) for u in re.findall(r'https://modonty-clients\.b-cdn\.net/logo/[^"\s\\)]+', h)]
if logos:
    urllib.request.urlretrieve(q(logos[0].rstrip("\\")), "assets/client-logo.src")
    Image.open("assets/client-logo.src").convert("RGBA").save("assets/client-logo.png")
    os.remove("assets/client-logo.src")

json.dump({"url": url, "title": title, "client_dir": client_dir, "images": imgs, "client_logo": bool(logos)},
          open("article.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(json.dumps({"title": title, "images": len(imgs), "client_logo": bool(logos)}, ensure_ascii=False))
