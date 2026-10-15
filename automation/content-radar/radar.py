"""
Modonty Content Radar — يرصد ما يبحث عنه السعودي في كل مجال، ويحفظ الفرص في «بنك الأفكار».

المصدر: «Modonty Viral Content Radar — التصور التنفيذي» (Google Doc) + قرارات خالد ١٥ أكتوبر ٢٠٢٦:
  - المجالات من قاعدة مدونتي (قطاعات · أقسام · صناعات) لا من الكود — مجالٌ يُضاف في الأدمن يُرصد تلقائياً.
  - مرّة في اليوم، والقيمة للموضوع «المستمرّ» (يظهر ٥ أيام فأكثر خلال ١٠) لا لموجة الساعة.
  - البيانات في قاعدة مدونتي عبر الأدمن، لا في قوقل. وبلا تيليجرام.
  - بعيداً عن السياسة والنزاعات والجرائم والحسّاس دينياً والفضائح.

  المجالات (GET /api/idea-bank/fields) ← لكل مجال: اقتراحات بحث قوقل السعودية + عناوين الأسبوع
  ← Claude يستخرج مواضيع بأسماء ثابتة ← POST /api/idea-bank/ingest (يعدّ أيام الظهور)

قواعد لا تُكسر: لا نشر تلقائي · الإشارة ليست حقيقة (نحفظ المصدر) · AI لا يلمس القاعدة.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import re
import sqlite3
import sys
import time
import urllib.parse
from concurrent.futures import ThreadPoolExecutor, as_completed

import feedparser
import requests

HERE = os.path.dirname(os.path.abspath(__file__))


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


ENV = {**load_env(os.path.join(HERE, ".env")), **os.environ}

ADMIN_URL = ENV.get("RADAR_ADMIN_URL", "").rstrip("/")  # https://admin.modonty.com
SECRET = ENV.get("RADAR_INGEST_SECRET", "")
DB_FILE = os.path.join(HERE, "radar.sqlite")
CLAUDE_MODEL = ENV.get("RADAR_CLAUDE_MODEL", "claude-haiku-4-5-20251001")
IDEAS_PER_FIELD = int(ENV.get("RADAR_IDEAS_PER_FIELD", "5"))
MIN_RELEVANCE = int(ENV.get("RADAR_MIN_RELEVANCE", "40"))
ONLY_FIELD = ENV.get("RADAR_ONLY_FIELD", "")  # "type:key" — تشغيلٌ لمجالٍ واحد («ابحث الآن»)
X_ENABLED = ENV.get("X_ENABLED", "0") == "1"  # X بالرصيد المدفوع — مطفأ حتى يُشحن الحساب

UA = {"User-Agent": "Mozilla/5.0 (ModontyContentRadar/2.0; +https://www.modonty.com)"}
# ثلاث صيغ × ست عبارات = ١٨ نداء اقتراحات للمجال — مصدرٌ غير رسمي، فلا نُثقل عليه.
MODIFIERS = ["", "أفضل", "كيف"]


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")


def log(*a: object) -> None:
    print(f"[{now_iso()}]", *a, flush=True)


def short_name(name: str) -> str:
    """«الإنشاء والتشييد والتعمير» ← «الإنشاء والتشييد» — الاسم الطويل لا يُقترح له شيء في البحث."""
    words = re.sub(r"[()«»]", " ", name).split()
    return " ".join(words[:2]) if len(words) > 2 else " ".join(words)


# ─── المجالات من الأدمن ──────────────────────────────────────────────────────────

def admin(method: str, path: str, **kw) -> dict:
    r = requests.request(method, f"{ADMIN_URL}{path}", headers={"x-radar-secret": SECRET}, timeout=60, **kw)
    r.raise_for_status()
    return r.json()


def get_fields() -> list[dict]:
    fields = admin("GET", "/api/idea-bank/fields")["fields"]
    fields.append({"type": "general", "key": "general", "name": "ترندات عامة"})
    if ONLY_FIELD:  # "type:key" لمجالٍ واحد، أو "type" لطبقةٍ كاملة (كل المنافسين مثلاً)
        t, _, k = ONLY_FIELD.partition(":")
        fields = [f for f in fields if f["type"] == t and (not k or f["key"] == k)]
    return fields


# ─── المصادر ─────────────────────────────────────────────────────────────────────

def suggestions(term: str) -> list[str]:
    """اقتراحات بحث قوقل للسعودية — ما يكتبه الناس فعلاً. ليست API رسمية: تُستعمل ولا يُعتمد عليها وحدها."""
    out: list[str] = []
    for m in MODIFIERS:
        q = f"{m} {term}".strip()
        try:
            r = requests.get("https://suggestqueries.google.com/complete/search",
                             params={"client": "firefox", "hl": "ar", "gl": "sa", "q": q}, headers=UA, timeout=20)
            out += [s for s in r.json()[1] if s != q]
        except Exception as e:  # مصدرٌ غير رسمي — فشله لا يوقف المجال
            log(f"suggest '{q}': {e}")
    return list(dict.fromkeys(out))[:30]


SEED_PROMPT = """أنت خبير سيو سعودي. المجال: «{field}».
اكتب {n} عبارات بحث قصيرة (١–٣ كلمات) يكتبها السعوديون فعلاً في قوقل عن هذا المجال الآن —
أسماء محدّدة (دوري، أندية، أجهزة، أنظمة، جهات، منتجات) لا كلمات عامة كاسم المجال نفسه.
بعيداً عن السياسة والنزاعات والجرائم والمسائل الدينية الخلافية والمشاهير.
أعد JSON فقط: {{"seeds":["..."]}}"""


def seeds_for(field_name: str) -> tuple[list[str], int, int]:
    """عبارات بحث محدّدة للمجال — «الكورة» وحدها أعطت اقتراحات عامة؛ «دوري روشن» تعطي ما يُبحث عنه."""
    body, tin, tout = claude_raw(SEED_PROMPT.format(field=field_name, n=6), "ابدأ", 400)
    m = re.search(r"\{.*\}", body, re.S)
    seeds = json.loads(m.group(0)).get("seeds", []) if m else []
    return [s.strip() for s in seeds if isinstance(s, str) and s.strip()][:6], tin, tout


RIYADH = dt.timezone(dt.timedelta(hours=3))


def entry_day(e) -> str | None:
    """يوم نشر الخبر بتوقيت الرياض — أساس «كم يوماً استمرّ» من أوّل تشغيل."""
    t = e.get("published_parsed")
    if not t:
        return None
    return dt.datetime(*t[:6], tzinfo=dt.timezone.utc).astimezone(RIYADH).strftime("%Y-%m-%d")


def week_headlines(term: str) -> list[dict]:
    q = urllib.parse.quote(f"{term} when:7d")
    feed = feedparser.parse(f"https://news.google.com/rss/search?q={q}&hl=ar&gl=SA&ceid=SA:ar", request_headers=UA)
    return [{"title": re.sub(r"\s+-\s+[^-]+$", "", e.get("title", "")), "url": e.get("link", ""),
             "source": (e.get("source") or {}).get("title", ""), "day": entry_day(e)} for e in feed.entries[:40]]


# نفس قائمة الكلمات العامة في الأدمن (`idea-bank/helpers/make-topic-matcher.ts`) — كلمةٌ في كل شيء لا تُميّز موضوعاً.
STOPWORDS = {
    "في", "من", "على", "عن", "الى", "الي", "مع", "او", "ما", "هو", "هي", "كيف", "افضل", "دليل", "شامل",
    "السعوديه", "السعودي", "سعودي", "سعوديه", "المملكه", "الجديد", "الجديده", "طريقه", "خطوات", "كل",
    "بين", "بعد", "قبل", "حسب", "لعام", "عام", "اهم", "جميع", "كامل", "الكامل", "اليوم", "الان",
}


def topic_words(topic: str) -> list[str]:
    return list(dict.fromkeys(w for w in norm_topic(topic).split()
                              if len(w) >= 3 and w not in STOPWORDS and not w.isdigit()))


def history_days(topic: str, heads: list[dict], window_days: int = 10) -> list[str]:
    """الأيام (خلال ١٠) التي نُشر فيها خبرٌ قريب من الموضوع — موضوعٌ منتشر منذ أسبوع يظهر بأيامه من
    أوّل رصد، لا «يوم ١» لأن الرادار رآه اليوم لأوّل مرّة (خالد ١٥ أكتوبر ٢٠٢٦)."""
    words = topic_words(topic)
    needed = min(2, len(words))
    if needed == 0:
        return []
    since = (dt.datetime.now(RIYADH) - dt.timedelta(days=window_days)).strftime("%Y-%m-%d")
    days = set()
    for h in heads:
        if not h.get("day") or h["day"] < since:
            continue
        t = f" {norm_topic(h['title'])} "
        hits = sum(1 for w in words if f" {w} " in t or f" ال{w.removeprefix('ال')} " in t or f" {w.removeprefix('ال')} " in t)
        if hits >= needed:
            days.add(h["day"])
    return sorted(days)


def general_signals() -> list[dict]:
    """ترندات عامة: قوقل ترندز للسعودية. يوتيوب شِيل (خالد ١٥ أكتوبر ٢٠٢٦): أكثره أغانٍ وترفيه، لا نيّة بحث."""
    out = []
    feed = feedparser.parse("https://trends.google.com/trending/rss?geo=SA", request_headers=UA)
    for e in feed.entries:
        out.append({"title": e.get("title", ""), "url": e.get("ht_news_item_url", ""),
                    "source": f"google_trends · {e.get('ht_approx_traffic', '?')}"})
    return out


# ─── Claude ──────────────────────────────────────────────────────────────────────

PROMPT = """أنت خبير محتوى وسيو لمنصّة «مدونتي» السعودية (خبرة ٥ سنوات). المجال: «{field}». تاريخ اليوم: {today}.
أمامك ما يبحث عنه السعوديون (اقتراحات البحث) وعناوين الأسبوع. استخرج حتى {n} مواضيع تستحق مقالاً مفيداً.
التزم بالمجال حرفياً: موضوعٌ من مجالٍ آخر (كالكورة في غير الرياضة) يُترك حتى لو ظهر في المدخلات.

قواعد قوقل للمحتوى المفيد: اكتب لما يفيد القارئ لا لأنه ترند، وأضف قيمة أصلية لا إعادة صياغة خبر.
افضّل ما يبحث عنه الناس لأسابيع وشهور (evergreen) على موجة يوم (trend).
ممنوع تماماً: السياسة · الأمن والدفاع والشؤون العسكرية · النزاعات والحروب · الجرائم · المسائل الدينية الخلافية · الفضائح والمشاهير.

لكل موضوع أعد:
- topic: اسم ثابت قصير (٢–٦ كلمات) بلا سنة ولا تاريخ ولا رقم حلقة — نفس الموضوع يأخذ نفس الاسم كل يوم.
  إن كان الموضوع هو نفسه أحدَ «known_topics» فانسخ اسمه حرفياً — لا اسماً قريباً منه.
  ولا تُخرج موضوعين متقاربين («حساب تمويل السيارات» و«تكلفة تمويل السيارات») — ادمجهما في واحد.
  وإن ذكرت سنةً في الزاوية فهي سنة اليوم أو القادمة، لا سنة مضت.
- intent: "evergreen" أو "trend"
- saudi_relevance (0-100) · opportunity_score (0-100)
- why_it_matters: جملة عربية · suggested_angle: عنوان مقال مقترح
- evidence: أقرب اقتراح بحث أو عنوان استندت إليه (نصّه كما هو)
لا تخترع حقائق. أعد JSON فقط: {{"items":[...]}}"""

# المنافس: عناوين نشرها هذا الأسبوع (أخبار قوقل site:) — نأخذ منها ما يبحث عنه السعودي ونكتبه أفضل،
# لا نسخ عناوينهم (خالد ١٥ أكتوبر ٢٠٢٦: «منافسين برضو مهمة»).
COMPETITOR_PROMPT = """أنت خبير محتوى وسيو لمنصّة «مدونتي» السعودية (خبرة ٥ سنوات). تاريخ اليوم: {today}.
أمامك عناوين نشرها منافسنا «{field}» هذا الأسبوع. استخرج حتى {n} مواضيع يبحث عنها السعوديون في قوقل
ونستطيع أن نكتب عنها مقالاً أوفى وأنفع — لا نسخاً لعنوانهم ولا إعادة صياغة خبرهم.
اترك الأخبار العابرة التي لا يبحث عنها أحد بعد يومين، وافضّل ما يُبحث عنه لأسابيع وشهور (evergreen).
الموضوع عبارة بحث محدّدة يكتبها الناس في قوقل، باسم منتج أو جهاز أو خدمة أو حالة بعينها:
«مواصفات ايفون 17 برو» لا «هواتف ذكية جديدة» · «طريقة تنظيف الموكيت بدون ماء» لا «العناية بالمنزل».
ممنوع موضوعٌ عامّ بحجم قسم («الذكاء الاصطناعي والتطبيقات» · «الاستثمار في الأسهم») — اتركه إن لم تجد اسماً محدّداً.
ممنوع تماماً: السياسة · الأمن والدفاع والشؤون العسكرية · النزاعات والحروب · الجرائم · المسائل الدينية الخلافية · الفضائح والمشاهير.

لكل موضوع أعد:
- topic: اسم ثابت قصير (٢–٦ كلمات) بلا سنة ولا تاريخ — إن كان أحدَ «known_topics» فانسخ اسمه حرفياً.
  ولا تُخرج موضوعين متقاربين — ادمجهما في واحد.
- intent: "evergreen" أو "trend"
- saudi_relevance (0-100) · opportunity_score (0-100)
- why_it_matters: جملة عربية · suggested_angle: عنوان مقال مقترح لمدونتي (أفضل من عنوانهم)
- evidence: عنوان المنافس الذي استندت إليه (نصّه كما هو)
لا تخترع حقائق. أعد JSON فقط: {{"items":[...]}}"""


def claude_raw(system: str, user: str, max_tokens: int) -> tuple[str, int, int]:
    key = ENV.get("ANTHROPIC_API_KEY")
    if not key:
        raise RuntimeError("ANTHROPIC_API_KEY missing")
    r = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
        json={"model": CLAUDE_MODEL, "max_tokens": max_tokens, "temperature": 0.2, "system": system,
              "messages": [{"role": "user", "content": user}]},
        timeout=180,
    )
    r.raise_for_status()
    body = r.json()
    text = "".join(c.get("text", "") for c in body.get("content", []) if c.get("type") == "text")
    u = body.get("usage", {})
    return text, u.get("input_tokens", 0), u.get("output_tokens", 0)


# حاجزٌ في الكود بعد النموذج لا تعليمةٌ وحدها — «أخبار الأمن والدفاع» مرّت من التعليمة في أوّل
# تشغيل كامل (١٥ أكتوبر ٢٠٢٦)، وخالد: «ابعدني عن السياسة، ابعدني عن الامور اللي فيها مشاكل».
BLOCKED = re.compile(
    r"سياس|انتخاب|حزب|برلمان|حكوم[ةي] (?:ال)?[اإ]سرائيل|غزة|فلسطين|إسرائيل|اسرائيل|إيران|ايران|حوثي|"
    r"حرب|حروب|عسكري|الأمن والدفاع|الامن والدفاع|الأمن الوطني|وزارة الدفاع|جيش|صاروخ|صواريخ|إرهاب|ارهاب|"
    r"اغتيال|جريمة|جرائم|قتل|مخدرات|فضيحة|طائفي|الشيعة|إلحاد"
)
# «الأمن» و«هجوم» وحدهما خارج القائمة عمداً: الأمن السيبراني والهجمات السيبرانية مواضيع تقنية مشروعة.


def blocked(*texts: str) -> bool:
    return any(BLOCKED.search(t or "") for t in texts)


def claude(field_name: str, payload: dict, prompt: str = PROMPT) -> tuple[list[dict], int, int]:
    today = dt.datetime.now(dt.timezone(dt.timedelta(hours=3))).strftime("%Y-%m-%d")
    text, tin, tout = claude_raw(prompt.format(field=field_name, n=IDEAS_PER_FIELD, today=today),
                                 json.dumps(payload, ensure_ascii=False), 4000)
    m = re.search(r"\{.*\}", text, re.S)
    items = json.loads(m.group(0)).get("items", []) if m else []
    return items, tin, tout


# ─── التشغيل ─────────────────────────────────────────────────────────────────────

def norm_topic(topic: str) -> str:
    t = re.sub(r"[^\w\s]", " ", topic.lower())
    t = re.sub(r"[ًٌٍَُِّْـ]", "", t)
    t = re.sub(r"[إأآ]", "ا", t).replace("ة", "ه").replace("ى", "ي")
    return " ".join(t.split())


def topic_key(topic: str) -> str:
    return hashlib.sha1(norm_topic(topic).encode()).hexdigest()[:16]


def pick_source(evidence: str, heads: list[dict], sugg: list[str], field_name: str) -> tuple[str, str, str]:
    """المصدر الأقرب لما استند إليه النموذج — رابط قابل للفتح دائماً."""
    for h in heads:
        if evidence and (evidence in h["title"] or h["title"] in evidence):
            return "google_news", h["title"], h["url"]
    s = evidence if evidence in sugg else (sugg[0] if sugg else field_name)
    return "google_suggest", f"بحث قوقل: {s}", "https://www.google.com/search?q=" + urllib.parse.quote(s) + "&gl=sa&hl=ar"


def run_field(f: dict) -> tuple[list[dict], int, int]:
    t0 = t1 = 0
    if f["type"] == "general":
        sigs = general_signals()
        payload = {"signals": sigs}
        heads = [{"title": s["title"], "url": s["url"]} for s in sigs]
        sugg: list[str] = []
    elif f["type"] == "competitor":  # المفتاح نطاق المنافس — جديده في الأسبوع من أخبار قوقل
        heads = week_headlines(f"site:{f['key']}")
        sugg = []
        payload = {"competitor_week_titles": list(dict.fromkeys(h["title"] for h in heads))[:40]}
    else:
        seeds, t0, t1 = seeds_for(f["name"])
        terms = seeds or [short_name(f["name"])]
        sugg = list(dict.fromkeys(s for t in terms for s in suggestions(t)))[:60]
        heads = [h for t in terms[:3] for h in week_headlines(t)][:90]
        payload = {"search_suggestions": sugg, "week_headlines": list(dict.fromkeys(h["title"] for h in heads))[:30]}
    if not any(payload.values()):
        return [], t0, t1
    try:  # أسماء ما عُرف من مواضيع هذا المجال — ليُعاد الاسم نفسه فيُعدّ اليوم لا يبدأ من الصفر
        payload["known_topics"] = admin("GET", "/api/idea-bank/topics",
                                        params={"field": f"{f['type']}:{f['key']}"}).get("topics", [])
    except Exception as e:
        log(f"known topics {f['name']}: {e}")
    items, tin, tout = claude(f["name"], payload, COMPETITOR_PROMPT if f["type"] == "competitor" else PROMPT)
    tin, tout = tin + t0, tout + t1
    out = []
    for it in items:
        topic = (it.get("topic") or "").strip()
        rel = int(it.get("saudi_relevance") or 0)
        if not topic or rel < MIN_RELEVANCE:
            continue
        if blocked(topic, it.get("suggested_angle") or "", it.get("why_it_matters") or ""):
            log(f"blocked: {topic}")
            continue
        platform, title, url = pick_source(it.get("evidence") or "", heads, sugg, f["name"])
        if f["type"] == "general":
            platform = "google_trends"
        elif f["type"] == "competitor":
            platform = "competitor"
        out.append({
            "key": topic_key(topic), "topic": topic[:500], "sourceTitle": title[:500], "sourceUrl": url[:2000],
            "sourcePlatform": platform, "market": "SA", "engagement": "", "crossSourceCount": 1,
            "sector": f["name"][:100], "saudiRelevance": max(0, min(100, rel)),
            "opportunityScore": max(0, min(100, int(it.get("opportunity_score") or 0))),
            "whyItMatters": (it.get("why_it_matters") or "")[:1000],
            "suggestedAngle": (it.get("suggested_angle") or "")[:1000],
            "fieldType": f["type"], "fieldKey": str(f["key"])[:100], "fieldName": f["name"][:200],
            "intent": "evergreen" if it.get("intent") == "evergreen" else "trend",
            "historyDays": history_days(topic, heads),
        })
    return out, tin, tout


WORKERS = int(ENV.get("RADAR_WORKERS", "4"))


def with_retry(fn, tries: int = 3):
    """انقطاع الاتصال يُعاد حتى ٣ مرّات بانتظارٍ متزايد — كان مجالٌ ينقطع يضيع يومه بصمت
    («معدات ومستلزمات» · ConnectionResetError في أوّل تشغيل كامل، ١٥ أكتوبر ٢٠٢٦)."""
    for i in range(tries):
        try:
            return fn()
        except (requests.RequestException, ConnectionError) as e:
            if i == tries - 1:
                raise
            log(f"retry {i + 1}/{tries - 1}: {e}")
            time.sleep(5 * (i + 1))


def report_scan(f: dict, ideas: int, error: str | None = None) -> None:
    """آخر رصد للمجال — تفرّق به الصفحة «لم يُرصد» عن «رُصد ولا جديد». فشلُه لا يُفشل المجال."""
    try:
        body = {"fieldType": f["type"], "fieldKey": str(f["key"]), "fieldName": f["name"][:200], "ideas": ideas}
        if error:
            body["error"] = error[:500]
        admin("POST", "/api/idea-bank/scans", json=body)
    except Exception as e:
        log(f"scan report {f['name']}: {e}")


def process_field(f: dict) -> tuple[int, int, int, int, int]:
    """مجالٌ كامل: رصد ← إدخال ← تسجيل الرصد. يُرجع (أفكار · جديدة · عائدة · توكنز داخل · خارج)."""
    try:
        items, a, b = with_retry(lambda: run_field(f))
        res = with_retry(lambda: admin("POST", "/api/idea-bank/ingest", json={"items": items})) if items else {}
        report_scan(f, len(items))
        log(f"{f['type']}:{f['name']} → {len(items)} ideas")
        return len(items), res.get("created", 0), res.get("seenAgain", 0), a, b
    except Exception as e:
        report_scan(f, 0, str(e))
        raise


def run_requests() -> int:
    """`--requests`: طلبات «ابحث الآن» من صفحة بنك الأفكار — كرون كل ٥ دقائق."""
    reqs = admin("GET", "/api/idea-bank/requests").get("requests", [])
    for q in reqs:
        f = {"type": q["fieldType"], "key": q["fieldKey"], "name": q["fieldName"]}
        try:
            n, created, _, a, b = process_field(f)
            admin("POST", "/api/idea-bank/requests", json={"id": q["id"], "status": "DONE", "created": created})
            log(f"request {f['type']}:{f['name']} → {n} ideas · created {created} · tokens {a}/{b}")
        except Exception as e:
            admin("POST", "/api/idea-bank/requests", json={"id": q["id"], "status": "FAILED", "error": str(e)[:500]})
            log(f"request {f['type']}:{f['name']} FAILED {e}")
    return 0


def main() -> int:
    if not ADMIN_URL or not SECRET:
        log("RADAR_ADMIN_URL / RADAR_INGEST_SECRET missing — nothing to do")
        return 1
    con = sqlite3.connect(DB_FILE)
    con.execute("""CREATE TABLE IF NOT EXISTS runs_v2 (at TEXT, fields INTEGER, ideas INTEGER, created INTEGER,
                   seen_again INTEGER, tokens_in INTEGER, tokens_out INTEGER, errors TEXT)""")
    errors: list[str] = []
    fields = get_fields()
    log(f"fields: {len(fields)}" + (f" (only {ONLY_FIELD})" if ONLY_FIELD else ""))
    ideas = created = seen = tin = tout = 0
    # ٤ مجالات معاً: التشغيل التتابعي أخذ ~٢٠ دقيقة لـ٢٩ مجالاً، والصفحة تبدو ناقصة طوال ذلك.
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {pool.submit(process_field, f): f for f in fields}
        for fut in as_completed(futures):
            f = futures[fut]
            try:
                n, c, s, a, b = fut.result()
                ideas, created, seen, tin, tout = ideas + n, created + c, seen + s, tin + a, tout + b
            except Exception as e:  # مجالٌ معطّل لا يوقف البقية — ومسجَّل في رصده
                errors.append(f"{f['name']}: {e}")
                log(f"{f['type']}:{f['name']} ERROR {e}")
    con.execute("INSERT INTO runs_v2 VALUES(?,?,?,?,?,?,?,?)",
                (now_iso(), len(fields), ideas, created, seen, tin, tout, " | ".join(errors)[:1000]))
    con.commit()
    log(f"done · fields {len(fields)} · ideas {ideas} · created {created} · seen again {seen} · "
        f"tokens {tin}/{tout} · errors {len(errors)}")
    return 1 if errors and not ideas else 0


if __name__ == "__main__":
    if "--requests" in sys.argv:
        if not ADMIN_URL or not SECRET:
            sys.exit(1)
        sys.exit(run_requests())
    sys.exit(main())
