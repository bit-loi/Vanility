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


def supabase_request(method: str, table: str, data: dict = None, jwt_token: str = None):
    url = f"{SUPABASE_REST_URL}/{table}"
    headers = _headers.copy()
    if jwt_token:
        headers["Authorization"] = f"Bearer {jwt_token}"
    with httpx.Client() as client:
        resp = client.request(method, url, headers=headers, json=data)
        resp.raise_for_status()
        if resp.status_code == 204 or not resp.text.strip():
            return None
        return resp.json()
