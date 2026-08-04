from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from database import connect_db, close_db
from config import UPLOAD_DIR
from routers import auth_router, rooms, tenants, payments, reminders


scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown lifecycle."""
    await connect_db()

    # Schedule monthly payment generation (1st of each month at midnight)
    from services.payment_service import generate_monthly_payments
    scheduler.add_job(
        generate_monthly_payments,
        "cron",
        day=1,
        hour=0,
        minute=5,
        id="monthly_payment_gen",
        replace_existing=True
    )

    # Schedule daily reminder check (every day at 9 AM)
    from services.reminder_service import run_daily_reminders
    scheduler.add_job(
        run_daily_reminders,
        "cron",
        hour=9,
        minute=0,
        id="daily_reminders",
        replace_existing=True
    )

    scheduler.start()
    print("[OK] Hostel Management API is running")
    print("[OK] Scheduler started (monthly payments + daily reminders)")
    yield
    scheduler.shutdown()
    await close_db()


app = FastAPI(
    title="Hostel Tenant Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(auth_router.router)
app.include_router(rooms.router)
app.include_router(tenants.router)
app.include_router(payments.router)
app.include_router(reminders.router)


@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "Hostel Management API is running"}


@app.get("/api/dashboard")
async def dashboard():
    """Dashboard summary endpoint."""
    from database import get_db
    db = get_db()

    total_rooms = await db.rooms.count_documents({"room_type": "rent"})
    occupied_rooms = await db.rooms.count_documents({
        "room_type": "rent",
        "occupant_ids": {"$ne": []}
    })
    vacant_rooms = total_rooms - occupied_rooms
    active_tenants = await db.tenants.count_documents({"is_active": True})

    return {
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_rooms,
        "vacant_rooms": vacant_rooms,
        "active_tenants": active_tenants,
    }
