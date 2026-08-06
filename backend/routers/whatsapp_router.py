from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from dateutil.relativedelta import relativedelta
from database import get_db
from services.whatsapp import send_reminder

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])


class RentDueRequest(BaseModel):
    tenant_id: str


class PaymentReceivedRequest(BaseModel):
    tenant_id: str
    payment_id: str


@router.post("/rent-due")
async def send_rent_due_message(data: RentDueRequest):
    """Send a WhatsApp rent due reminder to a tenant."""
    db = get_db()

    tenant = await db.tenants.find_one({"tenant_id": data.tenant_id})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    phone = tenant.get("contact_number", "")
    if not phone:
        raise HTTPException(status_code=400, detail="Tenant has no contact number")

    if not phone.startswith("91"):
        phone = "91" + phone

    name = tenant["full_name"]
    amount = int(tenant["monthly_rent_amount"])

    message = (
        f"Hi {name}, this is a reminder that your monthly rent of ₹{amount} is due. "
        f"Please pay at your earliest convenience. Thank you!"
    )

    sent = await send_reminder(phone, message)

    return {
        "sent": sent,
        "phone": phone,
        "message": message
    }


@router.post("/payment-received")
async def send_payment_received_message(data: PaymentReceivedRequest):
    """Send a WhatsApp payment confirmation to a tenant with coverage period."""
    db = get_db()

    tenant = await db.tenants.find_one({"tenant_id": data.tenant_id})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    payment = await db.payments.find_one({"payment_id": data.payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    phone = tenant.get("contact_number", "")
    if not phone:
        raise HTTPException(status_code=400, detail="Tenant has no contact number")

    if not phone.startswith("91"):
        phone = "91" + phone

    name = tenant["full_name"]
    amount = int(payment.get("amount_paid", payment["amount_due"]))
    rent_due_day = tenant.get("rent_due_day", 5)

    # Calculate coverage period: rent_due_day of payment month → rent_due_day-1 of next month
    try:
        month_year = payment["month_year"]  # "YYYY-MM"
        year, month = map(int, month_year.split("-"))
        from_date = datetime(year, month, rent_due_day)
        to_date = from_date + relativedelta(months=1) - relativedelta(days=1)
        from_str = from_date.strftime("%d %b %Y")
        to_str = to_date.strftime("%d %b %Y")
    except (ValueError, KeyError):
        from_str = "N/A"
        to_str = "N/A"

    message = (
        f"Hi {name}, your rent of ₹{amount} has been received. "
        f"This covers the period {from_str} to {to_str}. Thank you!"
    )

    sent = await send_reminder(phone, message)

    return {
        "sent": sent,
        "phone": phone,
        "message": message,
        "coverage_from": from_str,
        "coverage_to": to_str
    }
