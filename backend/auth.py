import uuid
import hashlib
import time
from fastapi import Request, Response, HTTPException


# In-memory session store
sessions = {}


def generate_session_id():
    """Generate a unique session ID."""
    raw = f"{uuid.uuid4()}-{time.time()}"
    return hashlib.sha256(raw.encode()).hexdigest()


def create_session(username: str) -> str:
    """Create a new session and return the session ID."""
    session_id = generate_session_id()
    sessions[session_id] = {
        "username": username,
        "created_at": time.time()
    }
    return session_id


def get_session(session_id: str):
    """Get session data by session ID."""
    return sessions.get(session_id)


def delete_session(session_id: str):
    """Delete a session."""
    sessions.pop(session_id, None)


async def get_current_user(request: Request):
    """Dependency: extract and validate the session from cookies."""
    session_id = request.cookies.get("session_id")
    if not session_id:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            session_id = auth_header.split(" ")[1]

    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    return session["username"]
