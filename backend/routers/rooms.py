from fastapi import APIRouter, HTTPException
from database import get_db

router = APIRouter(prefix="/api/rooms", tags=["rooms"])


@router.get("")
async def get_all_rooms():
    """Get all rooms with occupancy info."""
    db = get_db()
    rooms = await db.rooms.find().to_list(100)

    for room in rooms:
        room.pop("_id", None)
        room["occupant_count"] = len(room.get("occupant_ids", []))
        room["is_occupied"] = room["occupant_count"] > 0

    return rooms


@router.get("/floor-plan")
async def get_floor_plan():
    """Get rooms grouped by floor for floor plan rendering."""
    db = get_db()
    rooms = await db.rooms.find().to_list(100)

    ground = []
    first = []

    for room in rooms:
        room.pop("_id", None)
        room["occupant_count"] = len(room.get("occupant_ids", []))
        room["is_occupied"] = room["occupant_count"] > 0

        if room["floor"] == "ground":
            ground.append(room)
        else:
            first.append(room)

    # Sort by room_number (numeric sort for numbered rooms, Office last)
    def sort_key(r):
        try:
            return (0, int(r["room_number"]))
        except ValueError:
            return (1, 0)  # Office goes last

    ground.sort(key=sort_key)
    first.sort(key=sort_key)

    return {"ground": ground, "first": first}


@router.get("/{room_id}")
async def get_room(room_id: str):
    """Get a single room with its tenant details."""
    db = get_db()
    room = await db.rooms.find_one({"room_id": room_id})

    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    room.pop("_id", None)

    # Fetch tenant summaries for this room
    tenants = []
    if room.get("occupant_ids"):
        cursor = db.tenants.find({
            "tenant_id": {"$in": room["occupant_ids"]},
            "is_active": True
        })
        async for tenant in cursor:
            tenant.pop("_id", None)

            # Get current month payment status
            from datetime import datetime
            current_month = datetime.utcnow().strftime("%Y-%m")
            payment = await db.payments.find_one({
                "tenant_id": tenant["tenant_id"],
                "month_year": current_month
            })

            tenant["current_rent_status"] = payment["status"] if payment else "no_record"
            tenants.append(tenant)

    room["tenants"] = tenants
    room["occupant_count"] = len(tenants)
    room["is_occupied"] = len(tenants) > 0

    return room
