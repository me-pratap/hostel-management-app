import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URI, DB_NAME

async def main():
    client = None
    try:
        print(f"Connecting to MongoDB URI: {MONGODB_URI.split('@')[-1] if '@' in MONGODB_URI else MONGODB_URI}")
        client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=5000)
        await client.admin.command("ping")
        print("Database connection test successful!")
    except Exception as e:
        print(f"Database connection failed: {e}")
    finally:
        if client:
            client.close()
            print("Client closed.")

if __name__ == "__main__":
    asyncio.run(main())
