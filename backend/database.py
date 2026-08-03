from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URI, DB_NAME

client = None
db = None


async def connect_db():
    """Connect to MongoDB and verify the connection."""
    global client, db
    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]
    # Verify connection
    await client.admin.command("ping")
    print(f"✅ Connected to MongoDB: {DB_NAME}")


async def close_db():
    """Close the MongoDB connection."""
    global client
    if client:
        client.close()
        print("🔌 MongoDB connection closed")


def get_db():
    """Return the database handle."""
    return db
