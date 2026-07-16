import os
import httpx
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1"

SUPABASE_KEY: str = (
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    or os.environ.get("SUPABASE_SERVICE_KEY")
    or os.environ.get("SUPABASE_KEY", "")
)

_headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}


def supabase_request(method: str, table: str, data: dict = None):
    url = f"{SUPABASE_REST_URL}/{table}"
    with httpx.Client() as client:
        resp = client.request(method, url, headers=_headers, json=data)
        resp.raise_for_status()
        return resp.json()
