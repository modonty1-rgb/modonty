"""Gemini TTS experiments: list Arabic voices, design a Saudi voice, synthesise samples.
GEMINI_API_KEY comes from config.env (environment → ./.env on the VPS → the repo's env files); never printed."""
import base64, json, os, re, sys, urllib.parse, urllib.request, urllib.error

from config import env

KEY = env("GEMINI_API_KEY")
BASE = "https://generativelanguage.googleapis.com/v1beta"

# The approved Modonty narrator (voice_kq9fd6jmhzqc, 16 Oct 2026). If the stored voice ever expires,
# recreate it with:  python gemini_voice.py recreate   and put the new id in make.py VOICE_ID.
DESIGN_PROMPT = ("A 30-year-old Saudi man from Riyadh who hosts a popular Saudi YouTube channel. He speaks natural "
                 "white Saudi Arabic in the Najdi accent, not Modern Standard Arabic and not Egyptian. Warm, confident, "
                 "friendly and energetic, like explaining something useful to a close friend. Clean studio voiceover quality.")


def call(method, path, body=None, params=None):
    url = BASE + path + ("?" + urllib.parse.urlencode(params, doseq=True) if params else "")
    req = urllib.request.Request(url, method=method, data=json.dumps(body).encode() if body else None,
                                 headers={"x-goog-api-key": KEY, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            return r.status, r.read()
    except urllib.error.HTTPError as e:
        return e.code, e.read()
    except (TimeoutError, urllib.error.URLError, ConnectionError) as e:  # retried by the caller
        return 0, str(e).encode()


def save_audio(raw, out):
    """Find base64 audio anywhere in the JSON response and write it as WAV."""
    d = json.loads(raw)
    found = []
    def walk(x):
        if isinstance(x, dict):
            for k, v in x.items():
                if isinstance(v, str) and len(v) > 1000 and k in ("data", "audio", "inline_data", "bytes", "sample_audio", "audio_data"):
                    found.append(v)
                else:
                    walk(v)
        elif isinstance(x, list):
            for v in x: walk(v)
    walk(d)
    if not found:
        return False
    b = base64.b64decode(found[0])
    if b[:4] != b"RIFF":  # raw PCM 24k mono 16-bit -> wrap in WAV
        import wave
        with wave.open(out, "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(b)
    else:
        open(out, "wb").write(b)
    return True


def strip(raw, n=900):
    s = raw.decode("utf-8", "replace")
    return re.sub(r'"[A-Za-z0-9+/=]{400,}"', '"<b64>"', s)[:n]


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "list":
        for p in ({"language_code": "ar-SA"}, {"language_code": "ar"}, {"search": "Saudi"}, {"search": "Arabic"}, {"search": "Gulf"}):
            st, raw = call("GET", "/voices", params={**p, "page_size": 50})
            print(p, st, strip(raw, 1500)); print()
    elif cmd == "recreate":
        st, raw = call("POST", "/voices", body={"store": True, "voice": {"type": "prompted",
                       "display_name": "Modonty Saudi Narrator", "prompted": {"input": DESIGN_PROMPT}}})
        print(st, json.loads(raw).get("id") if st == 200 else strip(raw))
    elif cmd == "design":
        desc = sys.argv[2]
        st, raw = call("POST", "/voices", body=json.loads(sys.argv[3]) if len(sys.argv) > 3 else {"type": "prompted", "description": desc})
        print(st, strip(raw, 1500))
        if st == 200: print("saved:", save_audio(raw, sys.argv[4] if len(sys.argv) > 4 else "voices/design-preview.wav"))
    elif cmd == "say":
        voice, style, text, out = sys.argv[2], sys.argv[3], sys.argv[4], sys.argv[5]
        model = os.environ.get("TTS_MODEL", "gemini-3.8-flash-tts")
        content = {"type": "text", "text": text}
        if style:
            content["annotations"] = [{"type": "speech_metadata", "style": style}]
        body = {"model": model, "input": [{"type": "user_input", "content": [content]}],
                "response_format": {"type": "audio"}, "generation_config": {"speech_config": [{"voice": voice}]}}
        st, raw = call("POST", "/interactions", body=body)
        ok = st == 200 and save_audio(raw, out)
        print(st, "saved" if ok else strip(raw))
