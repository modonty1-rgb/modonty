"""Video factory orchestrator — runs on the VPS inside the vf-factory container (phase 0).

    python factory.py --watch                 # new articles from the feed → queue (hourly)
    python factory.py --work                  # one queued article → fetch · script · render · package · qa · [ingest] (every 15 min)
    python factory.py --publish               # approved YouTube items → YouTube (every 5 min, only if PUBLISH_ENABLED=1)
    python factory.py --status                # table of jobs
    python factory.py --add <article-url>     # queue one article by hand (backfill)
    python factory.py --retry <id> [--from fetch|script|render|package|ingest]
    python factory.py --skip <id>             # never process this article

Switches in .env (all default OFF, so a fresh install only produces files and stops):
  INGEST_ENABLED=1    send finished videos to the admin (RADAR_ADMIN_URL) — off until the admin side is in production
  PUBLISH_ENABLED=1   run the YouTube publisher on approved items
  TELEGRAM_ENABLED=1  send alerts (code ready, no destination chosen yet — Khalid, separate session)
  WATCH_BACKFILL=1    on the first --watch, queue the feed's existing articles too (default: only articles published after install)
  MAX_PER_DAY=6       articles started per day (Gemini TTS Tier 1 = 100 requests/day ≈ 10 per article)
Data lives in VF_DATA (default /data in the container = /opt/video-factory on the host).
"""
import argparse, datetime as dt, hashlib, json, os, re, shutil, sqlite3, subprocess, sys, time, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import config

DATA = os.environ.get("VF_DATA", "/data")
WORK = os.path.join(DATA, "work")
DB = os.path.join(DATA, "factory.sqlite")
FEED = os.environ.get("FEED_URL", "https://www.modonty.com/feed.xml")
STEPS = ["fetch", "script", "render", "package", "qa", "ingest"]
on = lambda name: os.environ.get(name, "0") == "1"


def db():
    os.makedirs(WORK, exist_ok=True)
    c = sqlite3.connect(DB)
    c.execute("""create table if not exists jobs(
        id text primary key, url text unique, status text, step text, attempts integer default 0,
        error text, step_seconds text, admin_id text, created_at text, updated_at text)""")
    c.execute("create table if not exists meta(k text primary key, v text)")
    return c


def now():
    return dt.datetime.now(dt.timezone.utc).replace(tzinfo=None).isoformat(timespec="seconds")


def job_id(url):
    slug = urllib.parse.unquote(url.rstrip("/").rsplit("/", 1)[-1])
    return hashlib.sha1(slug.encode()).hexdigest()[:12]      # same folder name ingest.py uses on Bunny


def add(c, url, status="queued"):
    jid = job_id(url)
    c.execute("insert or ignore into jobs(id,url,status,step,created_at,updated_at) values(?,?,?,?,?,?)",
              (jid, url, status, "fetch", now(), now()))
    c.commit()
    return jid


def watch(c):
    xml = urllib.request.urlopen(urllib.request.Request(FEED, headers={"User-Agent": "modonty-video-factory"}), timeout=60).read().decode()
    links = re.findall(r"<link>(https://www\.modonty\.com/articles/[^<]+)</link>", xml)
    first = c.execute("select v from meta where k='watched'").fetchone() is None
    status = "queued" if (not first or on("WATCH_BACKFILL")) else "skipped"   # first run: remember, don't flood
    new = [u for u in links if add(c, u, status) and c.total_changes]
    c.execute("insert or replace into meta values('watched', ?)", (now(),)); c.commit()
    print(f"watch: {len(links)} in feed, first_run={first}, status_for_new={status}")


def run(cmd, cwd, timeout):
    t0 = time.time()
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=timeout,
                       env={**os.environ, "PYTHONIOENCODING": "utf-8"})
    return r.returncode, round(time.time() - t0, 1), (r.stdout + r.stderr)[-1500:]


def qa(wd):
    """Mandatory automatic gate (checklist): files exist, durations in range."""
    fails = []
    def d(p):
        out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p],
                             capture_output=True, text=True).stdout.strip()
        return float(out or 0)
    long = os.path.join(wd, "out", "modonty-video.mp4")
    if not os.path.exists(long): fails.append("long video missing")
    elif not 120 <= d(long) <= 360: fails.append(f"long {d(long):.0f}s outside 120-360")
    shorts = [f for f in os.listdir(os.path.join(wd, "out")) if f.startswith("short-")] if os.path.isdir(os.path.join(wd, "out")) else []
    if len(shorts) != 3: fails.append(f"{len(shorts)} shorts (need 3)")
    for s in shorts:
        x = d(os.path.join(wd, "out", s))
        if not 20 <= x <= 45: fails.append(f"{s} {x:.0f}s outside 20-45")
    if not os.path.exists(os.path.join(wd, "out", "thumbnail.png")): fails.append("thumbnail missing")
    json.dump({"passed": not fails, "failures": fails}, open(os.path.join(wd, "qa.json"), "w"), indent=1)
    return fails


def alert(text):
    if not on("TELEGRAM_ENABLED"):
        print("telegram off:", text[:120]); return
    tok, chat = config.env("TELEGRAM_BOT_TOKEN"), config.env("TELEGRAM_VIDEO_CHAT_ID")
    data = json.dumps({"chat_id": chat, "text": text, "disable_web_page_preview": True}).encode()
    urllib.request.urlopen(urllib.request.Request(f"https://api.telegram.org/bot{tok}/sendMessage", data=data,
                                                  headers={"Content-Type": "application/json"}), timeout=30)


def work(c, only=None, start_from=None):
    missing = [k for k in ("ANTHROPIC_API_KEY", "GEMINI_API_KEY") if not config.env(k, required=False)]
    if missing:   # e.g. the factory's own Claude key not created yet (D23): wait, do not burn retries
        print("waiting for keys:", ", ".join(missing)); return
    today = dt.date.today().isoformat()
    started = c.execute("select count(*) from jobs where substr(created_at,1,10)=? and status not in ('queued','skipped')", (today,)).fetchone()[0]
    if not only and started >= int(os.environ.get("MAX_PER_DAY", "6")):
        print("daily cap reached"); return
    row = c.execute("select id,url,step,attempts,step_seconds from jobs where status='queued' and (? is null or id=?) "
                    "order by created_at limit 1", (only, only)).fetchone()
    if not row:
        print("nothing queued"); return
    jid, url, step, attempts, steps_json = row
    wd = os.path.join(WORK, jid)
    shutil.copytree(HERE, wd, dirs_exist_ok=True, ignore=shutil.ignore_patterns("__pycache__", "factory.py", "Dockerfile*", "*.md"))
    times = json.loads(steps_json or "{}")
    c.execute("update jobs set status='running', updated_at=? where id=?", (now(), jid)); c.commit()
    plan = {
        "fetch":   ([sys.executable, "fetch_article.py", url], 300),
        "script":  ([sys.executable, "write_script.py"], 1200),
        "render":  ([sys.executable, "make.py", "all"], 5400),
        "package": ([sys.executable, "package.py"], 120),
        "ingest":  ([sys.executable, "ingest.py", "--admin", config.env("RADAR_ADMIN_URL", required=False) or "",
                     "--prefix", os.environ.get("BUNNY_PREFIX", "video-factory"), "--revision", "1"], 1800),
    }
    for s in STEPS[STEPS.index(start_from or step):]:
        c.execute("update jobs set step=?, updated_at=? where id=?", (s, now(), jid)); c.commit()
        if s == "qa":
            fails = qa(wd)
            if fails:
                return fail(c, jid, url, s, attempts, "; ".join(fails), times)
            continue
        if s == "ingest" and not on("INGEST_ENABLED"):
            c.execute("update jobs set status='ready_local', step='ingest', step_seconds=?, updated_at=? where id=?",
                      (json.dumps(times), now(), jid)); c.commit()
            print("ready_local (INGEST_ENABLED=0):", jid, url); return
        code, secs, tail = run(plan[s][0], wd, plan[s][1])
        times[s] = secs
        if code != 0:
            return fail(c, jid, url, s, attempts, tail, times)
    res = json.load(open(os.path.join(wd, "ingest.result.json"), encoding="utf-8"))
    admin_id = (res.get("response") or {}).get("id")
    c.execute("update jobs set status='ingested', admin_id=?, step_seconds=?, attempts=0, updated_at=? where id=?",
              (admin_id, json.dumps(times), now(), jid)); c.commit()
    alert(f"فيديو جاهز للمراجعة: {(res.get('response') or {}).get('url', '')}")
    print("ingested", jid, admin_id)


def fail(c, jid, url, step, attempts, err, times):
    attempts += 1
    status = "queued" if attempts < 2 else "needs_attention"         # one retry, then a human
    c.execute("update jobs set status=?, step=?, attempts=?, error=?, step_seconds=?, updated_at=? where id=?",
              (status, step, attempts, err[-1500:], json.dumps(times), now(), jid)); c.commit()
    print(f"{jid} {step} failed (attempt {attempts}) → {status}\n{err[-400:]}")
    if status == "needs_attention":
        if on("INGEST_ENABLED"):
            subprocess.run([sys.executable, "ingest.py", "--admin", config.env("RADAR_ADMIN_URL"), "--attention",
                            "--step", step, "--message", err[-300:], "--attempts", str(attempts)], cwd=os.path.join(WORK, jid))
        alert(f"مصنع الفيديو: خطوة {step} فشلت مرتين — {url}")


def publish(c):
    if not on("PUBLISH_ENABLED"):
        print("publish off"); return
    pub = os.path.join(DATA, "publish"); os.makedirs(pub, exist_ok=True)
    code, secs, tail = run([sys.executable, os.path.join(HERE, "publish_youtube.py"), "--admin", config.env("RADAR_ADMIN_URL"),
                            "--go-public"], pub, 3600)
    print(tail)


def main():
    ap = argparse.ArgumentParser()
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--watch", action="store_true"); g.add_argument("--work", action="store_true")
    g.add_argument("--publish", action="store_true"); g.add_argument("--status", action="store_true")
    g.add_argument("--add"); g.add_argument("--retry"); g.add_argument("--skip")
    ap.add_argument("--from", dest="start_from", choices=STEPS)
    a = ap.parse_args()
    c = db()
    if a.watch: watch(c)
    elif a.work: work(c)
    elif a.publish: publish(c)
    elif a.add: print("queued", add(c, a.add))
    elif a.skip:
        c.execute("update jobs set status='skipped', updated_at=? where id=?", (now(), a.skip)); c.commit(); print("skipped", a.skip)
    elif a.retry:
        c.execute("update jobs set status='queued', attempts=0, step=coalesce(?, step), updated_at=? where id=?",
                  (a.start_from, now(), a.retry)); c.commit(); work(c, only=a.retry, start_from=a.start_from)
    else:
        for r in c.execute("select id,status,step,attempts,admin_id,updated_at,url from jobs order by created_at desc limit 40"):
            print(" | ".join(str(x) for x in r[:6]), "|", urllib.parse.unquote(r[6])[-60:])


if __name__ == "__main__":
    main()
