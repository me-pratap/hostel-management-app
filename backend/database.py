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


async def close_db():
    """Close the MongoDB connection."""
    global client
    if client:
        client.close()
        print("[OK] MongoDB connection closed")


def get_db():
    """Return the database handle."""
    return db
