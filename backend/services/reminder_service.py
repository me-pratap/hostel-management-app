from datetime import datetime, timedelta
from database import get_db
from services.whatsapp import send_reminder


REMINDER_MESSAGES = {
    "due_date": "Hi {name}, this is a friendly reminder that your monthly rent of Rs.{amount} is due today ({due_date}). Please make the payment at your earliest convenience. Thank you!",
    "day_1": "Hi {name}, your monthly rent of Rs.{amount} was due yesterday ({due_date}). Kindly clear the payment as soon as possible. Thank you!",
    "day_5": "Hi {name}, your rent payment of Rs.{amount} is now 5 days overdue (due date: {due_date}). This is a final reminder. Please settle the amount immediately to avoid any inconvenience. Thank you.",
}


async def run_daily_reminders():
    """
    Daily reminder job -- runs once per day (scheduled by APScheduler).

    For each unpaid/partial RentPayment for the current month:
    - due_date day: send polite reminder
    - due_date + 1 day: send "was due yesterday" reminder
    - due_date + 5 days: send firm final notice
    - After day+5: no more automated reminders (surfaced as "overdue" in dashboard)
    """
    db = get_db()
    if db is None:
        print("[WARN] Database not connected, skipping reminders")
        return

    current_month = datetime.utcnow().strftime("%Y-%m")
    today = datetime.utcnow().date()

    # Find all unpaid/partial payments for this month
    payments = await db.payments.find({
        "month_year": current_month,
        "status": {"$in": ["unpaid", "partial"]}
    }).to_list(500)

    reminders_sent_count = 0

    for payment in payments:
        try:
            due_date = datetime.strptime(payment["due_date"], "%Y-%m-%d").date()
        except (ValueError, KeyError):
            continue

        days_since_due = (today - due_date).days
        sent_types = [r["type"] for r in payment.get("reminders_sent", [])]

        # Determine which reminder to send
        reminder_type = None
        if days_since_due == 0 and "due_date" not in sent_types:
            reminder_type = "due_date"
        elif days_since_due == 1 and "day_1" not in sent_types:
            reminder_type = "day_1"
        elif days_since_due == 5 and "day_5" not in sent_types:
            reminder_type = "day_5"

        if not reminder_type:
            continue

        # Get tenant info
        tenant = await db.tenants.find_one({"tenant_id": payment["tenant_id"]})
        if not tenant or not tenant.get("contact_number"):
            continue

        # Format message
        message = REMINDER_MESSAGES[reminder_type].format(
            name=tenant["full_name"],
            amount=int(payment["amount_due"]),
            due_date=payment["due_date"]
        )

        # Send reminder
        phone = tenant["contact_number"]
        if not phone.startswith("91"):
            phone = "91" + phone

        await send_reminder(phone, message)

        # Log reminder in the payment record
        await db.payments.update_one(
            {"payment_id": payment["payment_id"]},
            {"$push": {
                "reminders_sent": {
                    "type": reminder_type,
                    "sent_at": datetime.utcnow().isoformat()
                }
            }}
        )

        reminders_sent_count += 1
        print(f"[REMINDER] Sent '{reminder_type}' reminder to {tenant['full_name']}")

    print(f"[OK] Daily reminder run complete: {reminders_sent_count} reminders sent")
