import asyncio
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URI, DB_NAME

async def main():
    client = AsyncIOMotorClient(MONGODB_URI, tlsCAFile=certifi.where())
    db = client[DB_NAME]
    tenants = await db.tenants.find().to_list(None)
    print(f"Total Tenants: {len(tenants)}")
    for t in tenants:
        print(f"- {t.get('full_name')} (ID: {t.get('tenant_id')})")
    client.close()

if __name__ == "__main__":
    asyncio.run(main())
