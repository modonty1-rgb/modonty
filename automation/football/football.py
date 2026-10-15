"""
Football feed — صفحة «الكورة» في مدونتي من مصدرين مجانيين، على سيرفر الرادار (Contabo) لا على مدونتي.

خالد (١٥ أكتوبر ٢٠٢٦): «ليه ما تسحب على الرادار تعمل اوتوميشن هناك ومن هناك ترسل عشان ما نأثر على مدونتي؟»
— صفحة هدّافي الموقع الرسمي انقطعت (Read timed out) في القياس نفسه؛ على مدونتي كانت ستبطئ الصفحة.

المصدران (مقيسان ١٥ أكتوبر ٢٠٢٦، عامّان بلا مفتاح، بالعربي):
- الموقع الرسمي لدوري روشن (api-sdp.spl.com.sa · بيانات Opta): المباريات · النتيجة الرسمية · الترتيب
  · الشعارات · إحصائيات اللاعبين. لا يعطي الدقيقة الحيّة ولا التأجيل.
- 365Scores (webws.365scores.com): الدقيقة الحيّة · التأجيل · رقم الجولة · قائمة الهدّافين — للمطابقة.

القاعدة (خالد: «أي نتيجة نقارنها قبل ما ننشرها»): النتيجة النهائية تُعرض حين يتّفق المصدران؛ إن اختلفا
أو لم يؤكّدها أحدهما بعد تُعرض «بانتظار التأكيد» بلا أرقام. الهدّافون لا يُعرضون إلا متطابقين.

يُشغَّل كل دقيقة (cron + flock) ويقرّر بنفسه ما يحتاج تحديثاً، ثم يرسل الصفحة جاهزةً إلى
الأدمن (`/api/football/ingest`) الذي يكتبها صفّاً واحداً في `feed_snapshots` — ومدونتي تقرأ الصفّ فقط.
"""
from __future__ import annotations

import collections
import datetime as dt
import hashlib
import json
import os
import re
import sys
import time

import requests

HERE = os.path.dirname(os.path.abspath(__file__))
STATE_FILE = os.path.join(HERE, "state.json")


def load_env(path: str) -> dict[str, str]:
    """Active lines only — a commented `# KEY=` line is never read as a value."""
    env: dict[str, str] = {}
    if not os.path.exists(path):
        return env
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip().strip('"')
    return env


# نفس سرّ الرادار ونفس عنوان الأدمن — لا سرّ ثانٍ يُدار
ENV = {**load_env(os.environ.get("FOOTBALL_ENV", os.path.join(HERE, "..", "content-radar", ".env"))),
       **load_env(os.path.join(HERE, ".env")), **os.environ}
ADMIN_URL = ENV.get("RADAR_ADMIN_URL", "").rstrip("/")
SECRET = ENV.get("RADAR_INGEST_SECRET", "")

SPL = "https://api-sdp.spl.com.sa/v1/spl/football"
SPL_MEDIA = "https://media-sdp.spl.com.sa/"
SPL_COMPETITION = "spl::Football_Competition::47d9987fd5044e0dba6c6c1df7d6cfa8"
S365 = "https://webws.365scores.com/web"
S365_LEAGUE = 649
S365_Q = {"appTypeId": 5, "langId": 27, "timezoneName": "Asia/Riyadh", "userCountryId": 122}
UA_SPL = {"User-Agent": "Mozilla/5.0 (ModontyFootball/1.0; +https://www.modonty.com)"}
UA_365 = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
          "Referer": "https://www.365scores.com/"}

RIYADH = dt.timezone(dt.timedelta(hours=3))
MIN = 60


def log(*a: object) -> None:
    print(f"[{dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')}]", *a, flush=True)


def get(url: str, params: dict, headers: dict, timeout: int = 40, tries: int = 3) -> dict:
    for i in range(tries):
        try:
            r = requests.get(url, params=params, headers=headers, timeout=timeout)
            r.raise_for_status()
            return r.json()
        except (requests.RequestException, ValueError) as e:
            if i == tries - 1:
                raise
            log(f"retry {url.split('/')[-1]}: {e}")
            time.sleep(3 * (i + 1))
    raise RuntimeError("unreachable")


def club_key(name: str) -> str:
    """«الأهلي» و«الاهلي» و«أهلي» مفتاحٌ واحد بين المصدرين."""
    t = re.sub(r"[ًٌٍَُِّْـ]", "", name or "")
    t = re.sub(r"[إأآ]", "ا", t).replace("ة", "ه").replace("ى", "ي")
    t = re.sub(r"^ال", "", t.strip())
    return re.sub(r"\s+", "", t)


def riyadh_day(iso: str) -> str:
    return dt.datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(RIYADH).strftime("%Y-%m-%d")


# ─── الموقع الرسمي ────────────────────────────────────────────────────────────────

def spl_season() -> dict:
    q = requests.utils.quote
    seasons = get(f"{SPL}/competitions/{q(SPL_COMPETITION, safe='')}/seasons", {"locale": "ar-SA"}, UA_SPL)["seasons"]
    season = sorted(seasons, key=lambda s: s["seasonName"], reverse=True)[0]
    sid = q(season["seasonId"], safe="")
    matches = get(f"{SPL}/seasons/{sid}/matches", {"locale": "ar-SA", "matchDayId": ""}, UA_SPL, timeout=60)["matches"]
    teams = get(f"{SPL}/seasons/{sid}/standings", {"locale": "ar-SA"}, UA_SPL)["teams"]

    def stat(t: dict, k: str) -> int:
        return int(next((s["statsValue"] for s in t["stats"] if s["statsId"] == k), 0) or 0)

    crests: dict[str, str] = {}
    for t in teams + [x for m in matches for x in (m["home"], m["away"])]:
        logo = (t.get("imagery") or {}).get("teamLogo")
        if logo:
            crests.setdefault(t["shortName"], SPL_MEDIA + logo)
    table = []
    for t in teams:
        q_label = (t.get("qualification") or {}).get("qualificationLabel") or ""
        table.append({
            "position": stat(t, "rank"), "team": t["shortName"], "played": stat(t, "matches-played"),
            "won": stat(t, "win"), "drawn": stat(t, "draw"), "lost": stat(t, "lose"),
            "goalsFor": stat(t, "goals-for"), "goalsAgainst": stat(t, "goals-against"),
            "goalDifference": stat(t, "goal-difference"), "points": stat(t, "points"),
            "zone": "asia" if q_label.startswith("AFC ") else "drop" if q_label.startswith("Relegation") else None,
        })
    if len(table) < 10:
        raise RuntimeError(f"spl standings looks wrong: {len(table)}")
    return {
        "seasonId": season["seasonId"],
        "seasonName": season["seasonName"],
        "table": sorted(table, key=lambda r: r["position"]),
        "crests": crests,
        "matches": [{
            "id": m["matchId"], "kickoff": m["matchDateUtc"], "finished": m["status"] == "FINISHED",
            "venue": m.get("stadiumName"),
            "home": {"name": m["home"]["shortName"], "goals": m.get("homeScorePush") if m["status"] == "FINISHED" else None},
            "away": {"name": m["away"]["shortName"], "goals": m.get("awayScorePush") if m["status"] == "FINISHED" else None},
        } for m in matches],
    }


def spl_scorers(season_id: str) -> list[dict]:
    """إحصائيات اللاعبين ٢١ صفحة غير مرتّبة (مقيس) — تُجمع كلها ويُرتَّب بالأهداف. صفحةٌ تفشل = لا قائمة."""
    sid = requests.utils.quote(season_id, safe="")
    first = get(f"{SPL}/seasons/{sid}/stats/players", {"locale": "ar-SA", "page": 1}, UA_SPL, timeout=90)
    players = list(first["players"])
    for n in range(2, int(first["pagination"]["totalPages"]) + 1):
        players += get(f"{SPL}/seasons/{sid}/stats/players", {"locale": "ar-SA", "page": n}, UA_SPL, timeout=90)["players"]
    goals = lambda p: int(next((s["statsValue"] for s in p["stats"] if s["statsId"] == "goals"), 0) or 0)
    ranked = sorted((p for p in players if goals(p) > 0), key=goals, reverse=True)[:10]
    return [{"player": p.get("displayName") or p.get("shortName"), "short": p.get("shortName") or "",
             "club": (p.get("team") or {}).get("shortName") or "", "goals": goals(p)} for p in ranked]


# ─── 365Scores ───────────────────────────────────────────────────────────────────

def s365_state(g: dict) -> str:
    text = f"{g.get('statusText', '')} {g.get('shortStatusText', '')}"
    if re.search(r"تأجل|ألغي|الغي|أوقفت|ملغ", text):
        return "off"
    if g.get("statusGroup") == 3:
        return "live"
    if g.get("statusGroup") == 4:
        return "finished" if (g["homeCompetitor"].get("score", -1) or 0) >= 0 else "off"
    return "upcoming"


def s365_day(day: str) -> list[dict]:
    d = "/".join(reversed(day.split("-")))
    games = get(f"{S365}/games/", {**S365_Q, "competitions": S365_LEAGUE, "startDate": d, "endDate": d}, UA_365).get("games", [])
    out = []
    for g in games:
        state = s365_state(g)
        sc = lambda c: (None if c.get("score") is None or c["score"] < 0 else int(c["score"]))
        text = f"{g.get('statusText', '')} {g.get('shortStatusText', '')}"
        out.append({
            "kickoff": dt.datetime.fromisoformat(g["startTime"]).astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z"),
            "state": state,
            "minute": int(g["gameTime"]) if state == "live" and (g.get("gameTime") or 0) > 0 else None,
            "halfTime": state == "live" and bool(re.search(r"استراحة|بين الشوطين", text)),
            "round": g.get("roundNum"),
            "home": {"name": g["homeCompetitor"]["name"], "goals": sc(g["homeCompetitor"])},
            "away": {"name": g["awayCompetitor"]["name"], "goals": sc(g["awayCompetitor"])},
        })
    return out


def s365_scorers() -> list[dict]:
    d = get(f"{S365}/stats/", {**S365_Q, "competitions": S365_LEAGUE}, UA_365)
    goals = next((s for s in d["stats"]["athletesStats"] if s["id"] == 1), {"rows": []})
    comps = {c["id"]: c["name"] for c in d.get("competitors", [])}
    out = []
    for r in goals["rows"]:
        e = r["entity"]
        # typeId 1 = الأهداف · 10 = ضربات الجزاء (مقيس: توني ١١ · ٤ جزاء)
        value = next((float(s["value"]) for s in r.get("stats", []) if s.get("typeId") == 1 and s.get("value") not in (None, "")), None)
        out.append({"name": e.get("name") or "", "short": e.get("shortName") or "", "club": comps.get(e.get("competitorId"), ""),
                    "goals": int(value) if value is not None else None})
    return out


# ─── بطولات أخرى (آسيا · الخليج · الكأس · السوبر · المنتخب) ─────────────────────────────────
# خالد (١٥ أكتوبر ٢٠٢٦): «ما بيغطي كل الأحداث الكروية اللي في السعودية». 365Scores يعطي مباريات أنديتنا
# في كل البطولات بأرقام الأندية (مقيس: النخبة · آسيا ٢ · أبطال الخليج)، والكأس والسوبر بأرقام بطولتيهما.
# مصدرٌ واحد — الرسمي لا يغطّيها — فالبطاقة تقول ذلك للقارئ.
NATIONAL_TEAM = 5087           # المنتخب السعودي الأوّل
OTHER_COMPETITIONS = (5501, 6164)  # كأس الملك · كأس السوبر السعودي


def s365_club_ids() -> list[int]:
    st = get(f"{S365}/standings/", {**S365_Q, "competitions": S365_LEAGUE}, UA_365)
    return [r["competitor"]["id"] for r in st["standings"][0]["rows"]]


def s365_game(g: dict, competition: str) -> dict:
    state = s365_state(g)
    text = f"{g.get('statusText', '')} {g.get('shortStatusText', '')}"
    sc = lambda c: (None if c.get("score") is None or c["score"] < 0 else int(c["score"]))
    half = state == "live" and bool(re.search(r"استراحة|بين الشوطين", text))
    return {
        "id": f"365:{g['id']}", "competition": competition,
        "kickoff": dt.datetime.fromisoformat(g["startTime"]).astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "state": state, "status": {"live": "HT" if half else "LIVE", "finished": "FT", "off": "PST"}.get(state, "NS"),
        "minute": int(g["gameTime"]) if state == "live" and (g.get("gameTime") or 0) > 0 else None,
        "round": None, "venue": None,
        "home": {"name": g["homeCompetitor"]["name"], "goals": sc(g["homeCompetitor"]) if state in ("live", "finished") else None},
        "away": {"name": g["awayCompetitor"]["name"], "goals": sc(g["awayCompetitor"]) if state in ("live", "finished") else None},
    }


def s365_others(club_ids: list[int]) -> list[dict]:
    """نتائج آخر ٧ أيام والقادمة خلال ١٤ يوماً — خارج دوري روشن (له بطاقته)."""
    found: dict[int, dict] = {}
    queries = [{"competitors": ",".join(str(i) for i in [*club_ids, NATIONAL_TEAM])}] + [{"competitions": c} for c in OTHER_COMPETITIONS]
    for path in ("/games/fixtures/", "/games/results/"):
        for q in queries:
            r = get(f"{S365}{path}", {**S365_Q, **q}, UA_365)
            names = {c["id"]: c["name"] for c in r.get("competitions", [])}
            for g in r.get("games", []):
                if g.get("competitionId") != S365_LEAGUE:
                    found[g["id"]] = s365_game(g, (names.get(g.get("competitionId")) or "").strip())
    now = time.time()
    keep = []
    for m in found.values():
        k = dt.datetime.fromisoformat(m["kickoff"].replace("Z", "+00:00")).timestamp()
        if now - 7 * 86400 <= k <= now + 14 * 86400:
            keep.append(m)
    return sorted(keep, key=lambda m: m["kickoff"])


def group_others(matches: list[dict]) -> list[dict]:
    """بطولةً بطولة، بترتيب أقرب مباراة فيها؛ أربعون مباراة سقفاً."""
    groups: dict[str, list[dict]] = {}
    for m in matches[:40]:
        groups.setdefault(m["competition"] or "بطولة", []).append({k: v for k, v in m.items() if k != "competition"})
    return [{"competition": name, "matches": ms} for name, ms in groups.items()]


# ─── الدمج والمطابقة ─────────────────────────────────────────────────────────────

def pair(spl_m: dict, games: list[dict]) -> dict | None:
    h, a = club_key(spl_m["home"]["name"]), club_key(spl_m["away"]["name"])
    for g in games:
        if club_key(g["home"]["name"]) == h and club_key(g["away"]["name"]) == a:
            return g
    return None


def merge_day(day: str, spl_matches: list[dict], games: list[dict] | None) -> dict:
    """يوم المباريات بعد المطابقة. `games=None` = 365 غير متاح — النهائي يبقى «بانتظار التأكيد»."""
    out, used = [], set()
    for m in (x for x in spl_matches if riyadh_day(x["kickoff"]) == day):
        g = pair(m, games or [])
        if g is not None:
            used.add(id(g))
        base = {"id": m["id"], "kickoff": m["kickoff"], "venue": m["venue"], "round": None, "minute": None,
                "home": {"name": m["home"]["name"], "goals": None}, "away": {"name": m["away"]["name"], "goals": None}}
        if g and g.get("round"):
            base["round"] = f"الجولة {g['round']}"
        if g and g["state"] == "live":
            # الحيّ من مصدرٍ واحد بطبيعته — الرسمي لا يبثّه؛ يُعرض «مباشر» ولا يُحفظ نتيجةً نهائية
            base.update(state="live", status="HT" if g["halfTime"] else "LIVE", minute=g["minute"],
                        home={**base["home"], "goals": g["home"]["goals"]}, away={**base["away"], "goals": g["away"]["goals"]})
        elif g and g["state"] == "off":
            base.update(state="off", status="PST")
        elif m["finished"] or (g and g["state"] == "finished"):
            agree = (m["finished"] and g is not None and g["state"] == "finished"
                     and g["home"]["goals"] == m["home"]["goals"] and g["away"]["goals"] == m["away"]["goals"])
            if agree:
                base.update(state="finished", status="FT", home=m["home"], away=m["away"])
            else:
                base.update(state="unconfirmed", status="UNC")
                log(f"unconfirmed {day} {m['home']['name']}-{m['away']['name']}: spl={m['home']['goals']}-{m['away']['goals']} "
                    f"365={'-' if not g else (str(g['home']['goals']) + '-' + str(g['away']['goals']) + ' ' + g['state'])}")
        else:
            base.update(state="upcoming", status="NS")
        out.append(base)
    # مباراة أجّلتها 365 ونقلها الرسمي ليومٍ آخر (الأهلي–النصر ١٥ أكتوبر) — التأجيل نفسه خبرٌ للقارئ
    for g in games or []:
        if id(g) not in used and g["state"] == "off":
            out.append({"id": f"365:{g['kickoff']}:{club_key(g['home']['name'])}", "kickoff": g["kickoff"], "venue": None,
                        "round": f"الجولة {g['round']}" if g.get("round") else None, "minute": None, "state": "off", "status": "PST",
                        "home": {"name": g["home"]["name"], "goals": None}, "away": {"name": g["away"]["name"], "goals": None}})
    out.sort(key=lambda x: x["kickoff"])
    return {"date": day, "matches": out, "known": True}


def verify_scorers(spl: list[dict], s365: list[dict]) -> bool:
    """
    المطابقة بالنادي والأهداف لا بالإملاء — المصدران يكتبان الاسم نفسه بحرفين («ريتيغي» · «ريتيجي»،
    «بيرغواين» · «بيرجوين»، مقيس ١٥ أكتوبر ٢٠٢٦). كل من بلغ أهداف الخامس في الرسمي: عدد اللاعبين لكل
    (نادٍ، أهداف) يجب أن يتساوى في المصدرين — وإلا لا قائمة.
    """
    if len(spl) < 5 or not s365:
        return False
    floor = spl[4]["goals"]
    count = lambda rows: collections.Counter((club_key(r["club"]), r["goals"]) for r in rows if (r["goals"] or 0) >= floor)
    a, b = count(spl), count(s365)
    if a != b:
        log(f"scorer mismatch (>= {floor} goals): spl {dict(a)} · 365 {dict(b)}")
        return False
    return True


# ─── التشغيل ─────────────────────────────────────────────────────────────────────

def load_state() -> dict:
    try:
        return json.load(open(STATE_FILE, encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def save_state(s: dict) -> None:
    tmp = STATE_FILE + ".tmp"
    json.dump(s, open(tmp, "w", encoding="utf-8"), ensure_ascii=False)
    os.replace(tmp, STATE_FILE)


def stale(state: dict, key: str, max_age: int) -> bool:
    return time.time() - state.get(f"{key}_at", 0) >= max_age


def main() -> int:
    if not ADMIN_URL or not SECRET:
        log("RADAR_ADMIN_URL / RADAR_INGEST_SECRET missing")
        return 1
    st = load_state()
    now = dt.datetime.now(RIYADH)
    days = [(now + dt.timedelta(days=d)).strftime("%Y-%m-%d") for d in (-1, 0, 1)]
    t = time.time()

    # «وقت مباراة»: ربع ساعة قبل بدايتها إلى ثلاث ساعات بعدها — التحديث فيه كل دقيقة/خمس
    kicks = [dt.datetime.fromisoformat(m["kickoff"].replace("Z", "+00:00")).timestamp()
             for m in (st.get("spl") or {}).get("matches", [])]
    window = any(k - 15 * MIN <= t <= k + 180 * MIN for k in kicks)

    errors = []
    if stale(st, "spl", 4 * MIN if window else 60 * MIN):
        try:
            st["spl"], st["spl_at"] = spl_season(), t
        except Exception as e:  # يبقى آخر نسخة سليمة
            errors.append(f"spl: {e}")
    for day in days:
        key = f"d365_{day}"
        max_age = MIN if (window and day == days[1]) else (15 * MIN if day >= days[1] else 6 * 3600)
        if stale(st, key, max_age):
            try:
                st[key], st[f"{key}_at"] = s365_day(day), t
            except Exception as e:
                errors.append(f"365 {day}: {e}")
    for old in [k for k in st if k.startswith("d365_") and not any(d in k for d in days)]:
        st.pop(old, None)
    other_kicks = [dt.datetime.fromisoformat(m["kickoff"].replace("Z", "+00:00")).timestamp() for m in st.get("others") or []]
    other_window = any(k - 15 * MIN <= t <= k + 180 * MIN for k in other_kicks)
    if stale(st, "others", MIN if other_window else 30 * MIN):
        try:
            if stale(st, "club_ids", 24 * 3600) or not st.get("club_ids"):
                st["club_ids"], st["club_ids_at"] = s365_club_ids(), t
            st["others"], st["others_at"] = s365_others(st["club_ids"]), t
        except Exception as e:
            errors.append(f"others: {e}")
    if st.get("spl") and stale(st, "scorers", 6 * 3600):
        try:
            spl_list, s365_list = spl_scorers(st["spl"]["seasonId"]), s365_scorers()
            st["scorers"] = {"list": spl_list, "verified": verify_scorers(spl_list, s365_list)}
            st["scorers_at"] = t
        except Exception as e:
            errors.append(f"scorers: {e}")

    if not st.get("spl"):
        save_state(st)
        log("no official data yet", errors)
        return 1

    spl = st["spl"]
    page_days = {}
    for name, day in zip(("yesterday", "today", "tomorrow"), days):
        page_days[name] = merge_day(day, spl["matches"], st.get(f"d365_{day}"))
    scorers = st.get("scorers") or {}
    stamps = [st.get("spl_at", 0)] + [st.get(f"d365_{d}_at", 0) for d in days if st.get(f"d365_{d}_at")]
    payload = {
        "version": 1,
        "seasonName": spl["seasonName"],
        "days": page_days,
        "table": {
            "rows": spl["table"],
            "scorers": [{"rank": i + 1, "player": p["player"], "club": p["club"], "goals": p["goals"]}
                        for i, p in enumerate(scorers.get("list", []))] if scorers.get("verified") else [],
            "clubNames": {},
        },
        "crests": spl["crests"],
        "others": group_others(st.get("others") or []),
        "updatedAt": dt.datetime.fromtimestamp(min(stamps), dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "checks": {
            "unconfirmed": sum(1 for d in page_days.values() for m in d["matches"] if m["state"] == "unconfirmed"),
            "scorersVerified": bool(scorers.get("verified")),
            "errors": errors[:5],
        },
    }

    digest = hashlib.sha1(json.dumps({k: v for k, v in payload.items() if k != "updatedAt"}, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
    # يُرسَل إن تغيّر شيء، أو كل ١٠ دقائق ليبقى «آخر تحديث» صادقاً
    if digest != st.get("pushed_digest") or stale(st, "pushed", 10 * MIN):
        try:
            r = requests.post(f"{ADMIN_URL}/api/football/ingest", json=payload, headers={"x-radar-secret": SECRET}, timeout=30)
            r.raise_for_status()
            st["pushed_digest"], st["pushed_at"] = digest, t
            log(f"pushed · today {len(page_days['today']['matches'])} · unconfirmed {payload['checks']['unconfirmed']} · "
                f"scorers {'✓' if payload['checks']['scorersVerified'] else '✗'} · window {window} · errors {len(errors)}")
        except Exception as e:
            errors.append(f"push: {e}")
            log("push failed", e)
    save_state(st)
    for e in errors:
        log("ERROR", e)
    return 0


if __name__ == "__main__":
    sys.exit(main())
