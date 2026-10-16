"""One-time YouTube authorization for the video factory (installed-app loopback flow with PKCE).

    python youtube_auth.py           # opens Google consent in the browser; the channel owner clicks Allow
    python youtube_auth.py --check   # refreshes the token and prints the channel name (no secrets)

Client:  ~/.modonty-video/youtube_oauth_client.json   (Desktop OAuth client «modonty-video-factory», project modonty)
Token:   ~/.modonty-video/youtube_token.json          (refresh token; chmod 600; never printed)
On the VPS put the same two files in /opt/video-factory/secrets/ (or set YT_CLIENT_ID/SECRET/REFRESH_TOKEN).
"""
import base64, hashlib, http.server, json, os, secrets, sys, urllib.parse, urllib.request, webbrowser

DIR = os.path.expanduser("~/.modonty-video")
CLIENT = json.load(open(os.path.join(DIR, "youtube_oauth_client.json")))["installed"]
TOKEN = os.path.join(DIR, "youtube_token.json")
SCOPES = ["https://www.googleapis.com/auth/youtube.upload",      # videos.insert, thumbnails.set
          "https://www.googleapis.com/auth/youtube.force-ssl"]   # videos.update, captions.insert


def post(url, data):
    req = urllib.request.Request(url, data=urllib.parse.urlencode(data).encode(), method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read())


def access_token():
    t = json.load(open(TOKEN))
    r = post(CLIENT["token_uri"], {"client_id": CLIENT["client_id"], "client_secret": CLIENT["client_secret"],
                                   "refresh_token": t["refresh_token"], "grant_type": "refresh_token"})
    return r["access_token"]


def check():
    req = urllib.request.Request("https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true",
                                 headers={"Authorization": "Bearer " + access_token()})
    d = json.loads(urllib.request.urlopen(req, timeout=60).read())
    for c in d.get("items", []):
        print("channel:", c["id"], "|", c["snippet"]["title"], "| subscribers:", c["statistics"].get("subscriberCount"))


def authorize():
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(hashlib.sha256(verifier.encode()).digest()).rstrip(b"=").decode()
    state = secrets.token_urlsafe(16)
    box = {}

    class H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
            box.update({k: v[0] for k, v in q.items()})
            self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.end_headers()
            ok = "code" in q and q.get("state", [""])[0] == state
            self.wfile.write(("<h2 style='font-family:sans-serif'>" + ("تم الربط، تقدر تقفل الصفحة" if ok else "ما تم الربط")
                              + "</h2>").encode())
        def log_message(self, *a): pass

    srv = http.server.HTTPServer(("127.0.0.1", 0), H)
    redirect = f"http://127.0.0.1:{srv.server_port}"
    url = CLIENT["auth_uri"] + "?" + urllib.parse.urlencode({
        "client_id": CLIENT["client_id"], "redirect_uri": redirect, "response_type": "code", "scope": " ".join(SCOPES),
        "access_type": "offline", "prompt": "consent", "state": state,
        "code_challenge": challenge, "code_challenge_method": "S256"})
    print("Opening Google consent… if no browser opens, open this URL:\n" + url, flush=True)
    webbrowser.open(url)
    srv.timeout = 600
    while "code" not in box and "error" not in box:
        srv.handle_request()
    if box.get("state") != state or "code" not in box:
        sys.exit(f"authorization failed: {box.get('error', 'state mismatch')}")
    tok = post(CLIENT["token_uri"], {"client_id": CLIENT["client_id"], "client_secret": CLIENT["client_secret"],
                                     "code": box["code"], "code_verifier": verifier, "grant_type": "authorization_code",
                                     "redirect_uri": redirect})
    if "refresh_token" not in tok:
        sys.exit("no refresh token returned")
    json.dump({"refresh_token": tok["refresh_token"], "scope": tok.get("scope")}, open(TOKEN, "w"))
    os.chmod(TOKEN, 0o600)
    print("saved token (scopes:", tok.get("scope"), ")")
    check()


if __name__ == "__main__":
    check() if "--check" in sys.argv else authorize()
