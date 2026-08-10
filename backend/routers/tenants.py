from fastapi import APIRouter, HTTPException, UploadFile, File
from datetime import datetime
from database import get_db
from models import TenantCreate, TenantUpdate, generate_id
import os
import uuid
from config import UPLOAD_DIR

router = APIRouter(prefix="/api/tenants", tags=["tenants"])


@router.get("")
async def get_tenants(is_active: bool = None, room_id: str = None):
    """List tenants with optional filters."""
    db = get_db()
    query = {}

    if is_active is not None:
        query["is_active"] = is_active
    if room_id:
        query["room_id"] = room_id

    tenants = await db.tenants.find(query).to_list(500)
    for t in tenants:
        t.pop("_id", None)

    return tenants


@router.get("/{tenant_id}")
async def get_tenant(tenant_id: str):
    """Get a single tenant's full profile."""
    db = get_db()
    tenant = await db.tenants.find_one({"tenant_id": tenant_id})

    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    tenant.pop("_id", None)

    # Also fetch room info
    room = await db.rooms.find_one({"room_id": tenant["room_id"]})
    if room:
        room.pop("_id", None)
        tenant["room"] = room

    return tenant


@router.post("")
async def create_tenant(tenant_data: TenantCreate):
    """Create a new tenant and assign to room."""
    db = get_db()

    # Validate room exists and has capacity
    room = await db.rooms.find_one({"room_id": tenant_data.room_id})
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    if room["room_type"] == "office":
        raise HTTPException(status_code=400, detail="Cannot assign tenants to office room")

    current_occupants = len(room.get("occupant_ids", []))
    if current_occupants >= room["capacity"]:
        raise HTTPException(status_code=400, detail="Room is at full capacity")

    # Create tenant document
    tenant_id = generate_id()
    now = datetime.utcnow()

    tenant_doc = {
        "tenant_id": tenant_id,
        **tenant_data.model_dump(),
        "date_left": None,
        "is_active": True,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
    }

    if not tenant_doc.get("date_joined"):
        tenant_doc["date_joined"] = now.strftime("%Y-%m-%d")

    await db.tenants.insert_one(tenant_doc)

    # Add tenant to room's occupant_ids
    await db.rooms.update_one(
        {"room_id": tenant_data.room_id},
        {"$push": {"occupant_ids": tenant_id}}
    )

    tenant_doc.pop("_id", None)
    return tenant_doc


@router.put("/{tenant_id}")
async def update_tenant(tenant_id: str, updates: TenantUpdate):
    """Update tenant fields."""
    db = get_db()

    tenant = await db.tenants.find_one({"tenant_id": tenant_id})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # If room is changing, handle room transfer
    if "room_id" in update_data and update_data["room_id"] != tenant["room_id"]:
        new_room = await db.rooms.find_one({"room_id": update_data["room_id"]})
        if not new_room:
            raise HTTPException(status_code=404, detail="New room not found")
        if new_room["room_type"] == "office":
            raise HTTPException(status_code=400, detail="Cannot assign tenants to office room")
        if len(new_room.get("occupant_ids", [])) >= new_room["capacity"]:
            raise HTTPException(status_code=400, detail="New room is at full capacity")

        # Remove from old room
        await db.rooms.update_one(
            {"room_id": tenant["room_id"]},
            {"$pull": {"occupant_ids": tenant_id}}
        )
        # Add to new room
        await db.rooms.update_one(
            {"room_id": update_data["room_id"]},
            {"$push": {"occupant_ids": tenant_id}}
        )

    update_data["updated_at"] = datetime.utcnow().isoformat()

    await db.tenants.update_one(
        {"tenant_id": tenant_id},
        {"$set": update_data}
    )

    updated = await db.tenants.find_one({"tenant_id": tenant_id})
    updated.pop("_id", None)
    return updated


@router.post("/{tenant_id}/mark-left")
async def mark_tenant_left(tenant_id: str):
    """Mark a tenant as left (soft delete)."""
    db = get_db()

    tenant = await db.tenants.find_one({"tenant_id": tenant_id})
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")

    if not tenant.get("is_active"):
        raise HTTPException(status_code=400, detail="Tenant already marked as left")

    now = datetime.utcnow()

    await db.tenants.update_one(
        {"tenant_id": tenant_id},
        {"$set": {
            "is_active": False,
            "date_left": now.strftime("%Y-%m-%d"),
            "updated_at": now.isoformat()
        }}
    )

    # Remove from room's occupant_ids
    await db.rooms.update_one(
        {"room_id": tenant["room_id"]},
        {"$pull": {"occupant_ids": tenant_id}}
    )

    # Delete any unpaid payments for this tenant so they don't clutter the ledger
    await db.payments.delete_many({
        "tenant_id": tenant_id,
        "status": "unpaid"
    })

    return {"message": "Tenant marked as left and unpaid payments cleared", "date_left": now.strftime("%Y-%m-%d")}


@router.post("/upload-photo")
async def upload_photo(file: UploadFile = File(...)):
    """Upload a photo (tenant photo or Aadhar photo)."""
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, and WebP images are allowed")

    contents = await file.read()
    
    from config import CLOUDINARY_CLOUD_NAME
    if CLOUDINARY_CLOUD_NAME:
        import cloudinary.uploader
        try:
            # Upload to Cloudinary
            upload_result = cloudinary.uploader.upload(
                contents,
                resource_type="image",
                folder="hostel_management_uploads"
            )
            return {"url": upload_result.get("secure_url"), "filename": upload_result.get("public_id")}
        except Exception as e:
            print(f"[ERROR] Cloudinary upload failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to upload image to Cloudinary")
    else:
        # Fallback to local upload
        ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(contents)

        return {"url": f"/uploads/{filename}", "filename": filename}
