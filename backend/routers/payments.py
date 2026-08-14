from fastapi import APIRouter, HTTPException
from datetime import datetime
from database import get_db
from models import RecordPaymentRequest, PaymentStatus

router = APIRouter(prefix="/api/payments", tags=["payments"])


@router.get("")
async def get_payments(tenant_id: str = None, month_year: str = None):
    """Get payments with optional filters."""
    db = get_db()
    query = {}

    if tenant_id:
        query["tenant_id"] = tenant_id
    if month_year:
        query["month_year"] = month_year

    payments = await db.payments.find(query).sort("month_year", -1).to_list(500)
    for p in payments:
        p.pop("_id", None)

    return payments


@router.get("/current-month")
async def get_current_month_payments():
    """Get all payments for the current month with tenant info."""
    db = get_db()
    current_month = datetime.utcnow().strftime("%Y-%m")

    payments = await db.payments.find({"month_year": current_month}).to_list(500)

    result = []
    for p in payments:
        p.pop("_id", None)
        # Fetch tenant name
        tenant = await db.tenants.find_one({"tenant_id": p["tenant_id"]})
        if tenant:
            p["tenant_name"] = tenant["full_name"]
            p["room_id"] = tenant["room_id"]
            p["contact_number"] = tenant.get("contact_number", "")
            
            # Fetch room number
            room = await db.rooms.find_one({"room_id": tenant["room_id"]})
            if room:
                p["room_number"] = room.get("room_number", "Office")
        result.append(p)

    return result


@router.get("/summary")
async def get_payment_summary():
    """Get payment summary for dashboard."""
    db = get_db()
    current_month = datetime.utcnow().strftime("%Y-%m")

    payments = await db.payments.find({"month_year": current_month}).to_list(500)

    total_due = sum(p.get("amount_due", 0) for p in payments)
    total_collected = sum(p.get("amount_paid", 0) for p in payments)
    paid_count = sum(1 for p in payments if p.get("status") == "paid")
    unpaid_count = sum(1 for p in payments if p.get("status") == "unpaid")
    partial_count = sum(1 for p in payments if p.get("status") == "partial")

    # Find overdue tenants (unpaid and past due_date + 5 days)
    overdue_tenants = []
    today = datetime.utcnow().date()

    for p in payments:
        if p.get("status") != "paid":
            try:
                due = datetime.strptime(p["due_date"], "%Y-%m-%d").date()
                days_overdue = (today - due).days
                if days_overdue > 5:
                    tenant = await db.tenants.find_one({"tenant_id": p["tenant_id"]})
                    if tenant:
                        overdue_tenants.append({
                            "tenant_id": p["tenant_id"],
                            "tenant_name": tenant["full_name"],
                            "contact_number": tenant.get("contact_number", ""),
                            "room_id": tenant.get("room_id", ""),
                            "amount_due": p["amount_due"],
                            "amount_paid": p.get("amount_paid", 0),
                            "days_overdue": days_overdue
                        })
            except (ValueError, KeyError):
                pass

    return {
        "month": current_month,
        "total_due": total_due,
        "total_collected": total_collected,
        "total_pending": total_due - total_collected,
        "paid_count": paid_count,
        "unpaid_count": unpaid_count,
        "partial_count": partial_count,
        "overdue_tenants": overdue_tenants
    }


@router.post("/{payment_id}/record")
async def record_payment(payment_id: str, data: RecordPaymentRequest):
    """Record a payment (mark as paid/partial)."""
    db = get_db()

    payment = await db.payments.find_one({"payment_id": payment_id})
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    update = {
        "amount_paid": data.amount_paid,
        "payment_date": data.payment_date or datetime.utcnow().strftime("%Y-%m-%d"),
        "payment_mode": data.payment_mode,
    }

    # Auto-determine status if not provided
    if data.status:
        update["status"] = data.status
    else:
        if data.amount_paid >= payment["amount_due"]:
            update["status"] = "paid"
        elif data.amount_paid > 0:
            update["status"] = "partial"
        else:
            update["status"] = "unpaid"

    await db.payments.update_one(
        {"payment_id": payment_id},
        {"$set": update}
    )

    updated = await db.payments.find_one({"payment_id": payment_id})
    updated.pop("_id", None)


    return updated

@router.delete("/{payment_id}")
async def delete_payment(payment_id: str):
    """Delete a payment record manually."""
    db = get_db()
    
    result = await db.payments.delete_one({"payment_id": payment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payment record not found")
        
    return {"message": "Payment record deleted successfully"}


@router.post("/generate-monthly")
async def generate_monthly_payments():
    """Manually trigger monthly payment generation for all active tenants."""
    from services.payment_service import generate_monthly_payments as gen
    count = await gen()
    return {"message": f"Generated {count} payment records"}
