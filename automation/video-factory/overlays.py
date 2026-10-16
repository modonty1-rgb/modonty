"""Render one transparent overlay PNG per beat from overlay.html with headless Chrome."""
import json, os, pathlib, subprocess, urllib.parse
from PIL import Image

from config import chrome_bin, chrome_needs_no_sandbox

CHROME = chrome_bin()
HERE = os.path.dirname(os.path.abspath(__file__))
SIZES = {"long": (1920, 1080), "short": (1080, 1920), "thumb": (1280, 720)}


def render(params, out):
    w, h = SIZES[params["mode"]]
    # as_uri() gives file:///C:/… on Windows and file:///opt/… on Linux (a hand-built "file:///" + path doubled the slash there)
    url = pathlib.Path(HERE, "overlay.html").as_uri() + "#" + urllib.parse.quote(json.dumps(params, ensure_ascii=False))
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
                    *(["--no-sandbox"] if chrome_needs_no_sandbox() else []),
                    "--default-background-color=00000000", f"--user-data-dir={os.path.join(HERE, 'build', 'chrome')}",
                    "--allow-file-access-from-files", "--virtual-time-budget=2500", f"--window-size={w},{h}",
                    f"--screenshot={os.path.abspath(out)}", url],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    im = Image.open(out)
    if im.size != (w, h):
        im.crop((0, 0, w, h)).save(out)
    return out


if __name__ == "__main__":
    s = json.load(open("script.json", encoding="utf-8"))
    b = s["long"][1]["beats"][2]
    render({"mode": "long", "client": s["client"], **b}, "build/test_long.png")
    render({"mode": "long", "client": s["client"], "n": 3, "series": "رقم يصدمك", "title": "دراسة كبيرة", "kind": "chapter"}, "build/test_ch.png")
    print(Image.open("build/test_long.png").size, Image.open("build/test_long.png").mode)
