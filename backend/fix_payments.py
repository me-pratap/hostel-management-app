import asyncio
from database import get_db, connect_db, close_db
from datetime import datetime
import calendar
from dotenv import load_dotenv

load_dotenv()

async def fix_payments():
    await connect_db()
    db = get_db()
    
    now = datetime.utcnow()
    current_month = now.strftime("%Y-%m")
    year = now.year
    month = now.month
    
    # Get all active unpaid/partial payments for this month
    payments = await db.payments.find({
        "month_year": current_month,
        "status": {"$in": ["unpaid", "partial"]}
    }).to_list(1000)
    
    count = 0
    for p in payments:
        tenant_id = p["tenant_id"]
        tenant = await db.tenants.find_one({"tenant_id": tenant_id})
        
        if not tenant:
            continue
            
        rent_due_day = tenant.get("rent_due_day", 5)
        monthly_rent_amount = tenant.get("monthly_rent_amount", 0)
        
        max_day = calendar.monthrange(year, month)[1]
        due_day = min(rent_due_day, max_day)
        expected_due_date = f"{year}-{month:02d}-{due_day:02d}"
        
        if p["due_date"] != expected_due_date or p["amount_due"] != monthly_rent_amount:
            await db.payments.update_one(
                {"payment_id": p["payment_id"]},
                {"$set": {
                    "due_date": expected_due_date,
                    "amount_due": monthly_rent_amount
                }}
            )
            count += 1
            print(f"Fixed payment record for tenant {tenant['full_name']}")
            
    print(f"Fixed {count} records.")
    await close_db()

if __name__ == "__main__":
    asyncio.run(fix_payments())
