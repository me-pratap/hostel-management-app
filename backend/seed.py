"""
Seed script: Populates the rooms, tenants, and payments collections with mock data.
Run: python seed.py
"""
import asyncio
import certifi
import random
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URI, DB_NAME
from models import generate_id, Gender, PoliceVerificationStatus, PaymentStatus

async def seed():
    client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]

    # Clear existing collections
    await db.rooms.delete_many({})
    await db.tenants.delete_many({})
    await db.payments.delete_many({})
    print("[OK] Cleared existing rooms, tenants, and payments")

    # Generate Rooms
    rooms_data = [
        {"room_id": generate_id(), "room_number": "1", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "2", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "3", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "4", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "5", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "6", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "7", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "8", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "Office", "floor": "ground", "room_type": "office", "capacity": 0, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "9", "floor": "first", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "10", "floor": "first", "room_type": "rent", "capacity": 3, "occupant_ids": []},
        {"room_id": generate_id(), "room_number": "11", "floor": "first", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    ]

    # Generate Tenants
    names = ["Aarav Patel", "Rohan Sharma", "Vikram Singh", "Aditya Kumar", "Karan Verma", "Arjun Gupta", "Rahul Desai"]
    tenants_data = []
    payments_data = []
    
    current_month_str = datetime.utcnow().strftime("%Y-%m")
    today_str = datetime.utcnow().strftime("%Y-%m-%d")

    for i, name in enumerate(names):
        tenant_id = generate_id()
        # Assign to random rentable room
        room = random.choice([r for r in rooms_data if r["room_type"] == "rent" and len(r["occupant_ids"]) < r["capacity"]])
        room["occupant_ids"].append(tenant_id)
        
        tenant = {
            "tenant_id": tenant_id,
            "full_name": name,
            "gender": Gender.MALE,
            "contact_number": f"987654321{i}",
            "emergency_contact_name": "Father",
            "emergency_contact_number": f"912345678{i}",
            "room_id": room["room_id"],
            "bed_slot_number": len(room["occupant_ids"]),
            "date_joined": (datetime.utcnow() - timedelta(days=random.randint(10, 100))).strftime("%Y-%m-%d"),
            "monthly_rent_amount": 6000.0,
            "rent_due_day": random.randint(1, 5),
            "police_verification_status": random.choice(list(PoliceVerificationStatus)),
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        tenants_data.append(tenant)

        # Generate Payment for current month
        payment_status = random.choice([PaymentStatus.PAID, PaymentStatus.UNPAID, PaymentStatus.PARTIAL])
        amount_paid = 6000.0 if payment_status == PaymentStatus.PAID else (3000.0 if payment_status == PaymentStatus.PARTIAL else 0.0)
        
        payment = {
            "payment_id": generate_id(),
            "tenant_id": tenant_id,
            "month_year": current_month_str,
            "due_date": f"{current_month_str}-{tenant['rent_due_day']:02d}",
            "amount_due": 6000.0,
            "amount_paid": amount_paid,
            "payment_date": today_str if payment_status in [PaymentStatus.PAID, PaymentStatus.PARTIAL] else None,
            "status": payment_status,
            "reminders_sent": []
        }
        payments_data.append(payment)

    # Insert Data
    await db.rooms.insert_many(rooms_data)
    if tenants_data:
        await db.tenants.insert_many(tenants_data)
    if payments_data:
        await db.payments.insert_many(payments_data)

    print(f"[OK] Seeded {len(rooms_data)} rooms")
    print(f"[OK] Seeded {len(tenants_data)} tenants")
    print(f"[OK] Seeded {len(payments_data)} payments")

    client.close()
    print("[DONE] Full database seed complete!")

if __name__ == "__main__":
    asyncio.run(seed())
