"""
Seed script: Populates the rooms collection with the hostel floor plan.
Run: python seed.py
"""
import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URI, DB_NAME
from models import generate_id


ROOMS = [
    # Ground Floor - Rentable rooms (1-8)
    {"room_id": generate_id(), "room_number": "1", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    {"room_id": generate_id(), "room_number": "2", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    {"room_id": generate_id(), "room_number": "3", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    {"room_id": generate_id(), "room_number": "4", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    {"room_id": generate_id(), "room_number": "5", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    {"room_id": generate_id(), "room_number": "6", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    {"room_id": generate_id(), "room_number": "7", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    {"room_id": generate_id(), "room_number": "8", "floor": "ground", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    # Ground Floor - Office
    {"room_id": generate_id(), "room_number": "Office", "floor": "ground", "room_type": "office", "capacity": 0, "occupant_ids": []},
    # First Floor - Rentable rooms (9-11)
    {"room_id": generate_id(), "room_number": "9", "floor": "first", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    {"room_id": generate_id(), "room_number": "10", "floor": "first", "room_type": "rent", "capacity": 3, "occupant_ids": []},
    {"room_id": generate_id(), "room_number": "11", "floor": "first", "room_type": "rent", "capacity": 3, "occupant_ids": []},
]


async def seed():
    client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]

    # Clear existing rooms
    await db.rooms.delete_many({})
    print("[OK] Cleared existing rooms")

    # Insert rooms
    result = await db.rooms.insert_many(ROOMS)
    print(f"[OK] Seeded {len(result.inserted_ids)} rooms:")

    # Print summary
    ground_rent = [r for r in ROOMS if r["floor"] == "ground" and r["room_type"] == "rent"]
    ground_office = [r for r in ROOMS if r["floor"] == "ground" and r["room_type"] == "office"]
    first_rent = [r for r in ROOMS if r["floor"] == "first" and r["room_type"] == "rent"]

    print(f"   Ground Floor: {len(ground_rent)} rentable rooms ({', '.join(r['room_number'] for r in ground_rent)}) + {len(ground_office)} office")
    print(f"   First Floor:  {len(first_rent)} rentable rooms ({', '.join(r['room_number'] for r in first_rent)})")

    client.close()
    print("[DONE] Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
