from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
import uuid


def generate_id():
    return str(uuid.uuid4())


# --- Enums ---

class FloorType(str, Enum):
    GROUND = "ground"
    FIRST = "first"


class RoomType(str, Enum):
    RENT = "rent"
    OFFICE = "office"


class Gender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class PoliceVerificationStatus(str, Enum):
    DONE = "done"
    PENDING = "pending"
    NOT_REQUIRED = "not_required"


class PaymentStatus(str, Enum):
    PAID = "paid"
    PARTIAL = "partial"
    UNPAID = "unpaid"


# --- Room ---

class Room(BaseModel):
    room_id: str = Field(default_factory=generate_id)
    room_number: str  # "1", "2", ... "11", or "Office"
    floor: FloorType
    room_type: RoomType
    capacity: int = 3
    occupant_ids: List[str] = []


class RoomResponse(Room):
    """Room with computed occupancy info."""
    occupant_count: int = 0
    is_occupied: bool = False


# --- Tenant ---

class ReminderEntry(BaseModel):
    type: str  # "due_date", "day_1", "day_5"
    sent_at: datetime


class TenantCreate(BaseModel):
    full_name: str
    photo_url: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[Gender] = None
    aadhar_number: Optional[str] = None
    aadhar_photo_url: Optional[str] = None
    contact_number: str
    alternate_contact_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    parents_contact_number: Optional[str] = None
    local_guardian_name: Optional[str] = None
    local_guardian_contact: Optional[str] = None
    home_address: Optional[str] = None
    occupation_or_work: Optional[str] = None
    blood_group: Optional[str] = None
    vehicle_number: Optional[str] = None
    room_id: str
    bed_slot_number: Optional[int] = None
    date_joined: Optional[str] = None
    monthly_rent_amount: float
    rent_due_day: int = 5  # Per-tenant due day (1-31)
    police_verification_status: PoliceVerificationStatus = PoliceVerificationStatus.PENDING
    payment_mode_preference: Optional[str] = None
    notes: Optional[str] = None


class Tenant(BaseModel):
    tenant_id: str = Field(default_factory=generate_id)
    full_name: str
    photo_url: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[Gender] = None
    aadhar_number: Optional[str] = None
    aadhar_photo_url: Optional[str] = None
    contact_number: str
    alternate_contact_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    parents_contact_number: Optional[str] = None
    local_guardian_name: Optional[str] = None
    local_guardian_contact: Optional[str] = None
    home_address: Optional[str] = None
    occupation_or_work: Optional[str] = None
    blood_group: Optional[str] = None
    vehicle_number: Optional[str] = None
    room_id: str
    bed_slot_number: Optional[int] = None
    date_joined: Optional[str] = None
    date_left: Optional[str] = None
    monthly_rent_amount: float
    rent_due_day: int = 5
    police_verification_status: PoliceVerificationStatus = PoliceVerificationStatus.PENDING
    payment_mode_preference: Optional[str] = None
    is_active: bool = True
    notes: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TenantUpdate(BaseModel):
    full_name: Optional[str] = None
    photo_url: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[Gender] = None
    aadhar_number: Optional[str] = None
    aadhar_photo_url: Optional[str] = None
    contact_number: Optional[str] = None
    alternate_contact_number: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_number: Optional[str] = None
    parents_contact_number: Optional[str] = None
    local_guardian_name: Optional[str] = None
    local_guardian_contact: Optional[str] = None
    home_address: Optional[str] = None
    occupation_or_work: Optional[str] = None
    blood_group: Optional[str] = None
    vehicle_number: Optional[str] = None
    room_id: Optional[str] = None
    bed_slot_number: Optional[int] = None
    monthly_rent_amount: Optional[float] = None
    rent_due_day: Optional[int] = None
    police_verification_status: Optional[PoliceVerificationStatus] = None
    payment_mode_preference: Optional[str] = None
    notes: Optional[str] = None


# --- Rent Payment ---

class RentPayment(BaseModel):
    payment_id: str = Field(default_factory=generate_id)
    tenant_id: str
    month_year: str  # "YYYY-MM"
    due_date: str  # "YYYY-MM-DD"
    amount_due: float
    amount_paid: float = 0.0
    payment_date: Optional[str] = None
    payment_mode: Optional[str] = None
    status: PaymentStatus = PaymentStatus.UNPAID
    reminders_sent: List[dict] = []  # [{type, sent_at}]


class RecordPaymentRequest(BaseModel):
    amount_paid: float
    payment_date: Optional[str] = None
    payment_mode: Optional[str] = None
    status: Optional[PaymentStatus] = None
