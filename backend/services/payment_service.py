from datetime import datetime
from database import get_db
from models import generate_id
import calendar


async def generate_monthly_payments():
    """
    Generate RentPayment records for all active tenants for the current month.
    Uses each tenant's individual rent_due_day.
    Skips if a payment record already exists for this tenant+month.
    """
    db = get_db()
    now = datetime.utcnow()
    current_month = now.strftime("%Y-%m")
    year = now.year
    month = now.month

    active_tenants = await db.tenants.find({"is_active": True}).to_list(500)
    count = 0

    for tenant in active_tenants:
        tenant_id = tenant["tenant_id"]

        # Check if payment already exists for this month
        existing = await db.payments.find_one({
            "tenant_id": tenant_id,
            "month_year": current_month
        })

        if existing:
            continue

        # Compute due date using tenant's rent_due_day
        rent_due_day = tenant.get("rent_due_day", 5)
        # Clamp to valid day for this month
        max_day = calendar.monthrange(year, month)[1]
        due_day = min(rent_due_day, max_day)
        due_date = f"{year}-{month:02d}-{due_day:02d}"

        payment_doc = {
            "payment_id": generate_id(),
            "tenant_id": tenant_id,
            "month_year": current_month,
            "due_date": due_date,
            "amount_due": tenant.get("monthly_rent_amount", 0),
            "amount_paid": 0.0,
            "payment_date": None,
            "payment_mode": None,
            "status": "unpaid",
            "reminders_sent": []
        }

        await db.payments.insert_one(payment_doc)
        count += 1

    print(f"[OK] Generated {count} payment records for {current_month}")
    return count
