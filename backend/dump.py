import asyncio
import motor.motor_asyncio
import certifi
from config import MONGODB_URI, DB_NAME

async def main():
    client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]
    tenants = await db.tenants.find().to_list(None)
    for t in tenants:
        print(f"{t['full_name']} -> {t.get('contact_number')}")

if __name__ == "__main__":
    asyncio.run(main())
