import os
import httpx
from fastapi import Header, HTTPException

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "")

def get_current_user_id(authorization: str = Header(None)) -> str:
    """
    FastAPI dependency to validate Supabase Auth JWT token and return user UUID.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization scheme. Use Bearer token."
        )
    
    token = authorization.split(" ")[1]
    
    url = f"{SUPABASE_URL}/auth/v1/user"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {token}"
    }
    
    try:
        with httpx.Client() as client:
            resp = client.get(url, headers=headers)
            if resp.status_code != 200:
                raise HTTPException(
                    status_code=401,
                    detail="Invalid or expired Supabase authentication token"
                )
            
            user_info = resp.json()
            user_id = user_info.get("id")
            if not user_id:
                raise HTTPException(
                    status_code=401,
                    detail="User ID not found in token metadata"
                )
            return user_id
            
    except httpx.RequestError as e:
        print(f"Auth server connection error: {e}")
        raise HTTPException(
            status_code=503,
            detail="Could not reach Supabase Auth server"
        )
    except HTTPException:
        raise
    except Exception as e:
        print(f"JWT validation error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed"
        )


def get_current_token(authorization: str = Header(None)) -> str:
    """
    FastAPI dependency to extract the raw Supabase JWT token from the Authorization header.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization scheme. Use Bearer token."
        )
    
    return authorization.split(" ")[1]
