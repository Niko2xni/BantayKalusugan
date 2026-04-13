import math
import os
import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import HTTPException, Request


class SlidingWindowRateLimiter:
    def __init__(self):
        self._events = defaultdict(deque)
        self._lock = Lock()

    def check(self, key: str, limit: int, window_seconds: int) -> tuple[bool, float]:
        now = time.monotonic()
        cutoff = now - window_seconds

        with self._lock:
            bucket = self._events[key]
            while bucket and bucket[0] <= cutoff:
                bucket.popleft()

            if len(bucket) >= limit:
                retry_after = max(0.0, window_seconds - (now - bucket[0])) if bucket else float(window_seconds)
                return False, retry_after

            bucket.append(now)
            return True, 0.0

    def reset(self) -> None:
        with self._lock:
            self._events.clear()


_rate_limiter = SlidingWindowRateLimiter()


def reset_rate_limits() -> None:
    _rate_limiter.reset()


def _resolve_client_ip(request: Request) -> str:
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",", maxsplit=1)[0].strip()

    client = request.client
    if client and client.host:
        return client.host

    return "unknown"


def enforce_rate_limit(
    request: Request,
    *,
    scope: str,
    limit: int,
    window_seconds: int,
    identity: str | None = None,
) -> None:
    enabled = os.getenv("RATE_LIMIT_ENABLED", "true").strip().lower() not in {"0", "false", "off", "no"}
    if not enabled:
        return

    actor = identity or _resolve_client_ip(request)
    key = f"{scope}:{actor}"
    allowed, retry_after = _rate_limiter.check(key, limit=limit, window_seconds=window_seconds)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again shortly.",
            headers={"Retry-After": str(max(1, math.ceil(retry_after)))},
        )
