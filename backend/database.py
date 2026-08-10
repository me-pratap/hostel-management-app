import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URI, DB_NAME

client = None
db = None


async def connect_db():
    """Connect to MongoDB and verify the connection."""
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]
    # Verify connection
    await client.admin.command("ping")
    print(f"[OK] Connected to MongoDB: {DB_NAME}")

    # Create Indexes
    await db.tenants.create_index("tenant_id", unique=True)
    await db.tenants.create_index("room_id")
    await db.tenants.create_index("is_active")
    
    await db.rooms.create_index("room_id", unique=True)
    await db.rooms.create_index("room_number", unique=True)
    
    await db.payments.create_index("payment_id", unique=True)
    await db.payments.create_index("tenant_id")
    await db.payments.create_index("month_year")
    await db.payments.create_index([("tenant_id", 1), ("month_year", 1)], unique=True)
    
    print("[OK] MongoDB Indexes ensured")


async def close_db():
    """Close the MongoDB connection."""
    global client
    if client:
        client.close()
        print("[OK] MongoDB connection closed")


def get_db():
    """Return the database handle."""
    return db
