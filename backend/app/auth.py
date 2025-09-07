import os
import time
import json
import hashlib
import hmac
import base64
import bcrypt
from typing import Optional


JWT_SECRET = os.getenv("JWT_SECRET", "devsecret_change_me")
JWT_ALG = "HS256"
JWT_EXP_SECONDS = 60 * 60 * 24


def hash_password(password: str) -> str:
    """Hash password using bcrypt for secure storage."""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, password_hash: str) -> bool:
    """Verify password against bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))
    except Exception:
        return False


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode().rstrip("=")


def _b64urldecode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_jwt(sub: str, extra: Optional[dict] = None) -> str:
    header = {"alg": JWT_ALG, "typ": "JWT"}
    payload = {"sub": sub, "exp": int(time.time()) + JWT_EXP_SECONDS}
    if extra:
        payload.update(extra)
    signing_input = f"{_b64url(json.dumps(header).encode())}.{_b64url(json.dumps(payload).encode())}"
    sig = hmac.new(JWT_SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
    return f"{signing_input}.{_b64url(sig)}"


def verify_jwt(token: str) -> Optional[dict]:
    try:
        header_b64, payload_b64, sig_b64 = token.split(".")
        signing_input = f"{header_b64}.{payload_b64}"
        expected_sig = hmac.new(JWT_SECRET.encode(), signing_input.encode(), hashlib.sha256).digest()
        if not hmac.compare_digest(_b64url(expected_sig), sig_b64):
            return None
        payload = json.loads(_b64urldecode(payload_b64))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None

