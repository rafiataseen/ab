from fastapi import FastAPI, APIRouter, HTTPException, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import random
import string
import time
import logging
from collections import defaultdict, deque
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator, BeforeValidator
from typing import Optional, Annotated
from bson import ObjectId
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

REGISTRATION_TARGET = int(os.environ.get("REGISTRATION_TARGET", "500"))
REFERRAL_TIER_THRESHOLDS = sorted(
    int(t) for t in os.environ.get("REFERRAL_TIER_THRESHOLDS", "3,5,10").split(",") if t.strip()
)

app = FastAPI()
api_router = APIRouter(prefix="/api")

PyObjectId = Annotated[str, BeforeValidator(str)]

PHONE_RE = re.compile(r"^[6-9]\d{9}$")

RATE_LIMIT = 10
RATE_WINDOW_SECONDS = 60
_rate_bucket: dict = defaultdict(deque)


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, extra="ignore")

    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id")

    def to_mongo(self) -> dict:
        doc = self.model_dump(by_alias=True)
        doc["_id"] = ObjectId(doc["_id"])
        return doc

    @classmethod
    def from_mongo(cls, doc: dict):
        if doc is None:
            return None
        return cls(**doc)


class RegistrationCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=80)
    college: str = Field(min_length=2, max_length=150)
    branch: str = Field(min_length=1, max_length=80)
    grad_year: str = Field(min_length=1, max_length=30)
    whatsapp_number: str
    email: EmailStr
    source: str = Field(default="direct", max_length=60)
    referred_by: Optional[str] = Field(default=None, max_length=12)

    @field_validator("whatsapp_number")
    @classmethod
    def valid_indian_number(cls, v: str) -> str:
        digits = re.sub(r"\D", "", v)
        if digits.startswith("91") and len(digits) == 12:
            digits = digits[2:]
        if not PHONE_RE.match(digits):
            raise ValueError("Enter a valid 10-digit Indian mobile number")
        return digits

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()


class Registration(BaseDocument):
    full_name: str
    college: str
    branch: str
    grad_year: str
    whatsapp_number: str
    email: str
    source: str = "direct"
    referred_by: Optional[str] = None
    referral_code: str
    created_at: str


def gen_referral_code() -> str:
    return "".join(random.choices(string.ascii_uppercase + string.digits, k=6))


def client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for")
    if fwd:
        return fwd.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@api_router.get("/")
async def root():
    return {"message": "Workshop Launchpad API"}


@api_router.post("/register", status_code=201)
async def register(input: RegistrationCreate, request: Request):
    ip = client_ip(request)
    now = time.time()
    bucket = _rate_bucket[ip]
    while bucket and now - bucket[0] > RATE_WINDOW_SECONDS:
        bucket.popleft()
    if len(bucket) >= RATE_LIMIT:
        raise HTTPException(
            status_code=429,
            detail="Too many attempts from this network — please wait a minute and try again.",
        )
    bucket.append(now)

    existing = await db.registrations.find_one(
        {"$or": [{"email": input.email}, {"whatsapp_number": input.whatsapp_number}]},
        {"_id": 0, "email": 1, "whatsapp_number": 1},
    )
    if existing:
        if existing.get("email") == input.email:
            msg = "Good news — this email is already registered, your seat is safe! Watch your inbox and WhatsApp for the joining link."
        else:
            msg = "Good news — this WhatsApp number is already registered, your seat is safe! See you at the workshop."
        raise HTTPException(status_code=409, detail=msg)

    referred_by = None
    if input.referred_by:
        ref_code = input.referred_by.strip().upper()
        referrer = await db.registrations.find_one(
            {"referral_code": ref_code},
            {"_id": 0, "email": 1, "whatsapp_number": 1},
        )
        if (
            referrer
            and referrer["email"] != input.email
            and referrer["whatsapp_number"] != input.whatsapp_number
        ):
            referred_by = ref_code

    code = gen_referral_code()
    while await db.registrations.find_one({"referral_code": code}, {"_id": 1}):
        code = gen_referral_code()

    data = input.model_dump()
    data["referred_by"] = referred_by
    reg = Registration(
        **data,
        referral_code=code,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    await db.registrations.insert_one(reg.to_mongo())
    total = await db.registrations.count_documents({})
    return {
        "id": reg.id,
        "full_name": reg.full_name,
        "referral_code": reg.referral_code,
        "referred_by": reg.referred_by,
        "seats_claimed": total,
        "target": REGISTRATION_TARGET,
    }


@api_router.get("/stats")
async def stats():
    total = await db.registrations.count_documents({})
    return {"total": total, "target": REGISTRATION_TARGET}


@api_router.get("/referrals/{code}")
async def referrals(code: str):
    code = code.strip().upper()
    referrer = await db.registrations.find_one(
        {"referral_code": code}, {"_id": 0, "full_name": 1}
    )
    if not referrer:
        raise HTTPException(status_code=404, detail="Referral code not found")
    count = await db.registrations.count_documents({"referred_by": code})
    tier = 0
    for threshold in REFERRAL_TIER_THRESHOLDS:
        if count >= threshold:
            tier = threshold
    return {
        "code": code,
        "first_name": referrer["full_name"].strip().split()[0],
        "referral_count": count,
        "tier": tier,
    }


@api_router.get("/colleges")
async def colleges(q: str = ""):
    q = q.strip()
    if len(q) < 2:
        return {"colleges": []}
    cursor = db.registrations.find(
        {"college": {"$regex": "^" + re.escape(q), "$options": "i"}},
        {"_id": 0, "college": 1},
    ).limit(60)
    seen, out = set(), []
    async for doc in cursor:
        c = doc.get("college", "").strip()
        if c and c.lower() not in seen:
            seen.add(c.lower())
            out.append(c)
        if len(out) >= 8:
            break
    return {"colleges": out}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def create_indexes():
    await db.registrations.create_index("email")
    await db.registrations.create_index("whatsapp_number")
    await db.registrations.create_index("referral_code")
    await db.registrations.create_index("referred_by")
    await db.registrations.create_index("college")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
