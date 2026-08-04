from fastapi import APIRouter
from services.reminder_service import run_daily_reminders
from database import get_db

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.post("/trigger")
async def trigger_reminders():
    """Manually trigger the daily reminder check (for testing)."""
    await run_daily_reminders()
    return {"message": "Reminder check completed"}


@router.get("/log")
async def get_reminder_log(tenant_id: str):
    """Get all reminders sent for a tenant's payments."""
    db = get_db()

    payments = await db.payments.find(
        {"tenant_id": tenant_id}
    ).sort("month_year", -1).to_list(100)

    reminders = []
    for p in payments:
        for r in p.get("reminders_sent", []):
            reminders.append({
                "month_year": p["month_year"],
                "type": r["type"],
                "sent_at": r["sent_at"]
            })

    return reminders
