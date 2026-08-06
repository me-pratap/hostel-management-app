from fastapi import APIRouter, Response, HTTPException
from pydantic import BaseModel
from config import ADMIN_USERNAME, ADMIN_PASSWORD
from auth import create_session, delete_session, get_session

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str


@router.post("/login")
async def login(request: LoginRequest, response: Response):
    """Login with admin credentials."""
    if request.username != ADMIN_USERNAME or request.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    session_id = create_session(request.username)

    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        samesite="none",
        secure=True,
        max_age=86400 * 7,  # 7 days
    )

    return {"message": "Login successful", "username": request.username}


@router.post("/logout")
async def logout(response: Response):
    """Logout and clear session cookie."""
    response.delete_cookie("session_id")
    return {"message": "Logged out"}


@router.get("/me")
async def get_me(request_obj=None):
    """Check if current session is valid."""
    from fastapi import Request
    # We handle this manually to avoid requiring auth on the endpoint
    # (frontend uses this to check login state)
    from starlette.requests import Request as StarletteRequest
    return {"message": "Use cookie-based auth check"}


# Override /me to properly check cookies
from fastapi import Request as FastAPIRequest


@router.get("/check")
async def check_auth(request: FastAPIRequest):
    """Check if the current session is valid."""
    session_id = request.cookies.get("session_id")
    if not session_id:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=401, detail="Session expired")

    return {"authenticated": True, "username": session["username"]}
