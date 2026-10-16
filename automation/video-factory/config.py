"""Paths, tools and secrets for the factory — one place, the same code on Khalid's laptop (Windows) and on
the Contabo VPS (Linux). Decision D22 (Khalid, 16 Oct 2026): «عدّل الدنيا كلها عشان نطلع بطلعة وحدة».

Secrets come from the environment first, then from the first env file that has them:
  VF_ENV_FILE · ./.env (the VPS: /opt/video-factory/.env, chmod 600) · the MODONTY repo's env files.
Nothing here prints a secret.
"""
import glob, os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))


def _find_repo():
    """MODONTY_REPO, else the first parent that holds the repo's .env.shared. Work folders are copies of this
    folder that may live outside the repo (experiment.py), so they get MODONTY_REPO from their parent run."""
    if os.environ.get("MODONTY_REPO"):
        return os.environ["MODONTY_REPO"]
    d = HERE
    while True:
        if os.path.exists(os.path.join(d, ".env.shared")) and os.path.isdir(os.path.join(d, "automation")):
            return d
        parent = os.path.dirname(d)
        if parent == d:
            return None  # the VPS copy: only ./.env and the environment are used
        d = parent


REPO = _find_repo()

ENV_FILES = [p for p in (
    os.environ.get("VF_ENV_FILE"),
    os.path.join(HERE, ".env"),
    *((os.path.join(REPO, ".env.shared"),
       os.path.join(REPO, "admin", ".env.local"),
       os.path.join(REPO, "admin", ".env"),
       os.path.join(REPO, "console", ".env.local")) if REPO else ()),
) if p]


def env(name, required=True):
    """`name` from the environment, else from the first env file that sets it (commented lines ignored)."""
    if os.environ.get(name):
        return os.environ[name]
    for path in ENV_FILES:
        if os.path.exists(path):
            m = re.search(rf'^\s*{re.escape(name)}\s*=\s*"?([^"\r\n]*)', open(path, encoding="utf-8").read(), re.M)
            if m and m.group(1).strip():
                return m.group(1).strip()
    if required:
        sys.exit(f"missing {name} — set it in the environment or in {os.path.join(HERE, '.env')}")
    return None


def chrome_bin():
    """CHROME_BIN, else Chrome/Chromium on PATH (Linux), else the standard Windows install."""
    if os.environ.get("CHROME_BIN"):
        return os.environ["CHROME_BIN"]
    for name in ("google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "chrome"):
        found = shutil.which(name)
        if found:
            return found
    for pattern in (r"C:\Program Files\Google\Chrome\Application\chrome.exe",
                    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
                    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe")):
        for hit in glob.glob(pattern):
            return hit
    sys.exit("Chrome not found — install google-chrome or set CHROME_BIN")


def chrome_needs_no_sandbox():
    """Chrome refuses to start as root without --no-sandbox; the VPS runs the factory as root (H1)."""
    return hasattr(os, "geteuid") and os.geteuid() == 0
