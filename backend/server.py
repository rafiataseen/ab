from fastapi import FastAPI, APIRouter, HTTPException, Request, Depends, Response
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import random
import string
import time
import asyncio
import jwt
import logging
from collections import defaultdict, deque
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr, field_validator, BeforeValidator
from typing import Optional, Annotated
from bson import ObjectId
from datetime import datetime, timezone, timedelta

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


@api_router.get("/leaderboard")
async def leaderboard():
    college_pipeline = [
        {
            "$group": {
                "_id": {"$toLower": {"$trim": {"input": "$college"}}},
                "registrations": {"$sum": 1},
                "name": {"$first": {"$trim": {"input": "$college"}}},
            }
        },
        {"$sort": {"registrations": -1, "_id": 1}},
        {"$limit": 15},
    ]
    colleges = []
    async for doc in db.registrations.aggregate(college_pipeline):
        colleges.append({"college": doc["name"], "registrations": doc["registrations"]})

    ref_pipeline = [
        {"$match": {"referred_by": {"$ne": None}}},
        {"$group": {"_id": "$referred_by", "count": {"$sum": 1}}},
        {"$sort": {"count": -1, "_id": 1}},
        {"$limit": 15},
    ]
    referrers = []
    async for doc in db.registrations.aggregate(ref_pipeline):
        referrer = await db.registrations.find_one(
            {"referral_code": doc["_id"]}, {"_id": 0, "full_name": 1}
        )
        if not referrer:
            continue
        parts = referrer["full_name"].strip().split()
        display = parts[0] + (f" {parts[-1][0].upper()}." if len(parts) > 1 else "")
        referrers.append({"name": display, "referrals": doc["count"]})

    return {"colleges": colleges, "referrers": referrers}


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


class QuizAnswers(BaseModel):
    branch: str = Field(min_length=1, max_length=40)
    interest: str = Field(min_length=1, max_length=60)
    comfort: str = Field(min_length=1, max_length=40)


FALLBACK_IDEAS = [
    {
        "title": "Campus FAQ Chatbot",
        "description": "A chatbot that answers freshers' questions about your college.",
        "steps": [
            "Collect 20 common questions and answers about your campus",
            "Connect a free AI chat API to match questions to answers",
            "Wrap it in a simple web page and share the link with juniors",
        ],
        "recruiter_line": "Shows you can turn a real campus problem into a working AI tool people actually use.",
    },
    {
        "title": "Study-Buddy Quiz Bot",
        "description": "A bot that quizzes you on your own notes before exams.",
        "steps": [
            "Convert one subject's notes into short Q&A pairs",
            "Use an AI API to generate new practice questions from them",
            "Hook it to a free messaging bot so friends can quiz themselves too",
        ],
        "recruiter_line": "Proves you can combine AI APIs with real messaging platforms — a skill product teams use daily.",
    },
    {
        "title": "Lecture Photo Organizer",
        "description": "An app that sorts your lecture photos by topic automatically.",
        "steps": [
            "Gather sample photos of whiteboards, notes and slides",
            "Use a free image AI API to tag what each photo contains",
            "Auto-file them into folders by subject and date",
        ],
        "recruiter_line": "Demonstrates practical computer-vision API usage on a problem every student has.",
    },
    {
        "title": "Classroom Face Counter",
        "description": "Counts how many students are in a class photo in seconds.",
        "steps": [
            "Take sample classroom photos with permission",
            "Run them through a free face-detection model",
            "Show the count on a tiny web dashboard for your class",
        ],
        "recruiter_line": "Real computer-vision deployment experience — a standout line in any interview.",
    },
    {
        "title": "Placement Readiness Predictor",
        "description": "Enter your CGPA and skills, get a realistic readiness score.",
        "steps": [
            "List the factors recruiters check (CGPA, skills, projects)",
            "Score sample profiles with an AI API to find patterns",
            "Build a small form that gives instant feedback",
        ],
        "recruiter_line": "Shows data-driven thinking about the very process you are interviewing for.",
    },
    {
        "title": "Hostel Expense Forecaster",
        "description": "Predicts next month's spending from your UPI history.",
        "steps": [
            "Export a month of transactions into a simple table",
            "Let an AI API categorize each expense automatically",
            "Chart the categories and predict next month's total",
        ],
        "recruiter_line": "End-to-end data pipeline work — collection, AI categorization and prediction in one project.",
    },
    {
        "title": "Deadline Reminder Bot",
        "description": "Never miss an assignment deadline again.",
        "steps": [
            "List your subjects and where deadlines get announced",
            "Use an AI API to turn messy circular text into clean deadlines",
            "Send yourself scheduled reminders from a simple script",
        ],
        "recruiter_line": "Automation that saves real time — recruiters love builders who remove busywork.",
    },
    {
        "title": "Resume Tailor",
        "description": "Rewrites your resume bullets for each job description.",
        "steps": [
            "Paste your resume and one job description",
            "Ask an AI API to match your bullets to the job's keywords",
            "Export the tailored version as a clean page",
        ],
        "recruiter_line": "Meta in the best way — you built the tool that improves the resume they are reading.",
    },
]

INTEREST_INDEX = {
    "chatting with apps": 0,
    "images and cameras": 2,
    "data and predictions": 4,
    "automating boring tasks": 6,
}


def pick_fallback(interest: str, comfort: str) -> dict:
    base = INTEREST_INDEX.get(interest.strip().lower(), 0)
    offset = 0 if comfort.strip().lower() == "beginner" else 1
    return FALLBACK_IDEAS[base + offset]


async def generate_idea_with_llm(branch: str, interest: str, comfort: str) -> dict:
    import json as _json
    from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone

    chat = LlmChat(
        api_key=os.environ["EMERGENT_LLM_KEY"],
        session_id=f"project-matcher-{time.time_ns()}",
        system_message=(
            "You suggest beginner-friendly first AI projects for final-year "
            "engineering students in India. You respond with valid JSON only — "
            "no markdown, no code fences, no commentary."
        ),
    ).with_model("openai", "gpt-5.4")

    prompt = (
        f"Branch: {branch}. Enjoys: {interest}. Coding comfort: {comfort}.\n"
        "Suggest ONE first AI project this student can build in a weekend with free tools. "
        'Return ONLY a JSON object: {"title": "max 6 words", "description": "one sentence", '
        '"steps": ["step 1", "step 2", "step 3"], "recruiter_line": "one sentence on why this '
        'impresses recruiters"}. Keep steps simple and tool-agnostic.'
    )

    async def _collect() -> str:
        parts = []
        async for event in chat.stream_message(UserMessage(text=prompt)):
            if isinstance(event, TextDelta):
                parts.append(event.content)
            elif isinstance(event, StreamDone):
                break
        return "".join(parts)

    raw = (await asyncio.wait_for(_collect(), timeout=30)).strip()
    if raw.startswith("```"):
        raw = raw.strip("`").removeprefix("json").strip()
    data = _json.loads(raw)
    idea = {
        "title": str(data["title"]).strip(),
        "description": str(data["description"]).strip(),
        "steps": [str(s).strip() for s in data["steps"]][:3],
        "recruiter_line": str(data["recruiter_line"]).strip(),
    }
    if not idea["title"] or len(idea["steps"]) < 3 or not idea["recruiter_line"]:
        raise ValueError("Incomplete idea from LLM")
    return idea


@api_router.post("/project-idea")
async def project_idea(input: QuizAnswers):
    await db.quiz_stats.update_one(
        {"_id": "completions"}, {"$inc": {"count": 1}}, upsert=True
    )
    try:
        idea = await generate_idea_with_llm(input.branch, input.interest, input.comfort)
        return {"idea": idea, "source": "ai"}
    except Exception as e:
        logger.warning(f"LLM project idea failed, using fallback: {e}")
        return {"idea": pick_fallback(input.interest, input.comfort), "source": "fallback"}


ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "")
JWT_SECRET = os.environ.get("JWT_SECRET", "")
JWT_ALGORITHM = "HS256"
ADMIN_TOKEN_HOURS = 12

_admin_rate: dict = defaultdict(deque)


class AdminLogin(BaseModel):
    password: str = Field(min_length=1, max_length=200)


class TrackEvent(BaseModel):
    event: str = Field(max_length=30)
    page: str = Field(default="/", max_length=60)


def create_admin_token() -> str:
    payload = {
        "sub": "admin",
        "type": "admin",
        "exp": datetime.now(timezone.utc) + timedelta(hours=ADMIN_TOKEN_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def require_admin(request: Request):
    auth = request.headers.get("Authorization", "")
    token = auth[7:] if auth.startswith("Bearer ") else ""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "admin":
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired session — log in again")


@api_router.post("/admin/login")
async def admin_login(input: AdminLogin, request: Request):
    ip = client_ip(request)
    now = time.time()
    bucket = _admin_rate[ip]
    while bucket and now - bucket[0] > 60:
        bucket.popleft()
    if len(bucket) >= 5:
        raise HTTPException(
            status_code=429, detail="Too many login attempts — wait a minute and try again."
        )
    bucket.append(now)
    if not ADMIN_PASSWORD or input.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"token": create_admin_token()}


@api_router.post("/track", status_code=204)
async def track(input: TrackEvent):
    if input.event not in ("page_visit", "form_start"):
        return
    await db.funnel_events.insert_one(
        {
            "event": input.event,
            "page": input.page,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
    )


def _ist_date(iso: str) -> str:
    return (datetime.fromisoformat(iso) + timedelta(hours=5, minutes=30)).date().isoformat()


@api_router.get("/admin/dashboard")
async def admin_dashboard(_: None = Depends(require_admin)):
    docs = await db.registrations.find(
        {},
        {"_id": 0, "full_name": 1, "college": 1, "source": 1, "referred_by": 1, "created_at": 1, "referral_code": 1},
    ).to_list(100000)

    total = len(docs)
    now_ist = datetime.now(timezone.utc) + timedelta(hours=5, minutes=30)
    today_ist = now_ist.date().isoformat()

    by_source = {}
    college_counts = {}
    day_map = {}
    ref_counts = {}
    name_by_code = {}
    referral_driven = 0
    for d in docs:
        src = d.get("source") or "direct"
        by_source[src] = by_source.get(src, 0) + 1
        norm = d["college"].strip().lower()
        if norm not in college_counts:
            college_counts[norm] = {"college": d["college"].strip(), "registrations": 0}
        college_counts[norm]["registrations"] += 1
        day = _ist_date(d["created_at"])
        day_map[day] = day_map.get(day, 0) + 1
        name_by_code[d["referral_code"]] = d["full_name"]
        if d.get("referred_by"):
            referral_driven += 1
            ref_counts[d["referred_by"]] = ref_counts.get(d["referred_by"], 0) + 1

    daily = []
    for i in range(6, -1, -1):
        day = (now_ist - timedelta(days=i)).date().isoformat()
        daily.append({"date": day, "count": day_map.get(day, 0)})

    top_colleges = sorted(
        college_counts.values(), key=lambda x: (-x["registrations"], x["college"].lower())
    )[:10]
    top_codes = sorted(ref_counts.items(), key=lambda x: -x[1])[:10]
    top_referrers = [
        {"name": name_by_code.get(code, "Unknown"), "code": code, "referrals": n}
        for code, n in top_codes
    ]

    visits = await db.funnel_events.count_documents({"event": "page_visit"})
    starts = await db.funnel_events.count_documents({"event": "form_start"})

    return {
        "kpis": {
            "total": total,
            "target": REGISTRATION_TARGET,
            "pct_of_target": round(total / REGISTRATION_TARGET * 100, 1),
            "today": sum(1 for d in docs if _ist_date(d["created_at"]) == today_ist),
            "referral_share": round(referral_driven / total * 100, 1) if total else 0,
            "unique_colleges": len(college_counts),
        },
        "daily": daily,
        "by_source": [
            {"source": k, "count": v}
            for k, v in sorted(by_source.items(), key=lambda x: -x[1])
        ],
        "top_colleges": top_colleges,
        "top_referrers": top_referrers,
        "funnel": {"page_visits": visits, "form_starts": starts, "registered": total},
    }


@api_router.get("/admin/registrations")
async def admin_registrations(
    page: int = 1, q: str = "", _: None = Depends(require_admin)
):
    per_page = 10
    filt = {}
    if q.strip():
        rx = {"$regex": re.escape(q.strip()), "$options": "i"}
        filt = {
            "$or": [
                {"full_name": rx},
                {"college": rx},
                {"email": rx},
                {"whatsapp_number": rx},
                {"referral_code": rx},
            ]
        }
    total = await db.registrations.count_documents(filt)
    pages = max(1, (total + per_page - 1) // per_page)
    page = max(1, min(page, pages))
    items = await db.registrations.find(filt, {"_id": 0}).sort("created_at", -1).skip(
        (page - 1) * per_page
    ).limit(per_page).to_list(per_page)
    return {"items": items, "total": total, "page": page, "pages": pages}


@api_router.get("/admin/export.csv")
async def admin_export(_: None = Depends(require_admin)):
    import csv
    import io

    docs = await db.registrations.find({}, {"_id": 0}).sort("created_at", -1).to_list(100000)
    headers = [
        "full_name",
        "college",
        "branch",
        "grad_year",
        "whatsapp_number",
        "email",
        "source",
        "referred_by",
        "referral_code",
        "created_at",
    ]
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(headers)
    for d in docs:
        writer.writerow([d.get(h) or "" for h in headers])
    return Response(
        content=buf.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=registrations.csv"},
    )


DEMO_FIRST = ["Aarav", "Vivaan", "Ananya", "Diya", "Arjun", "Sneha", "Rohan", "Priya", "Karthik", "Ishita", "Aditya", "Meera", "Rahul", "Kavya", "Vikram", "Anjali", "Siddharth", "Pooja", "Nikhil", "Divya", "Manav", "Riya", "Varun", "Tanvi", "Harsh", "Nandini", "Yash", "Shreya", "Dev", "Lakshmi"]
DEMO_LAST = ["Sharma", "Verma", "Patel", "Iyer", "Reddy", "Nair", "Gupta", "Khan", "Das", "Menon", "Chauhan", "Pillai", "Joshi", "Kulkarni", "Singh", "Rao", "Bose", "Mishra", "Chopra", "Hegde"]
DEMO_COLLEGES = ["IIT Bombay", "NIT Trichy", "VIT Vellore", "SRM Institute of Science and Technology", "Anna University", "Manipal Institute of Technology", "RV College of Engineering", "Delhi Technological University", "JNTU Hyderabad", "PSG College of Technology", "Amrita Vishwa Vidyapeetham", "BITS Pilani"]
DEMO_SOURCES = ["direct", "whatsapp_amrita_cse", "whatsapp_nit_trichy", "instagram_page", "college_club_ecell", "friend_forward"]
DEMO_BRANCHES = [
    "Computer Science & Engineering (CSE)",
    "Information Technology (IT)",
    "Electronics & Communication (ECE)",
    "Electrical & Electronics (EEE)",
    "Mechanical Engineering (ME)",
    "Civil Engineering (CE)",
    "Data Science / AI & ML",
    "Chemical / Biotech / Other",
]
DEMO_YEARS = ["2026 (Final Year)", "2026 (Final Year)", "2026 (Final Year)", "2027", "2025 (Recent Grad)"]


@api_router.get("/admin/demo/status")
async def demo_status(_: None = Depends(require_admin)):
    count = await db.registrations.count_documents({"is_demo": True})
    return {"demo_count": count}


@api_router.post("/admin/demo/seed")
async def demo_seed(_: None = Depends(require_admin)):
    existing = await db.registrations.count_documents({"is_demo": True})
    if existing:
        return {
            "seeded": 0,
            "demo_count": existing,
            "message": "Demo data already loaded — clear it first to reseed.",
        }
    used_phones, used_emails = set(), set()
    docs, codes = [], []
    base = datetime.now(timezone.utc)
    for _ in range(150):
        fn, ln = random.choice(DEMO_FIRST), random.choice(DEMO_LAST)
        while True:
            phone = "9" + "".join(random.choices("0123456789", k=9))
            if phone not in used_phones:
                used_phones.add(phone)
                break
        n = random.randint(10, 99)
        email = f"demo.{fn.lower()}.{ln.lower()}{n}@gmail.com"
        while email in used_emails:
            n += 1
            email = f"demo.{fn.lower()}.{ln.lower()}{n}@gmail.com"
        used_emails.add(email)
        code = gen_referral_code()
        codes.append(code)
        created = base - timedelta(seconds=random.randint(600, 6 * 86400))
        docs.append(
            {
                "_id": ObjectId(),
                "full_name": f"{fn} {ln}",
                "college": random.choice(DEMO_COLLEGES),
                "branch": random.choice(DEMO_BRANCHES),
                "grad_year": random.choice(DEMO_YEARS),
                "whatsapp_number": phone,
                "email": email,
                "source": random.choice(DEMO_SOURCES),
                "referred_by": random.choice(codes[:-1]) if codes[:-1] and random.random() < 0.3 else None,
                "referral_code": code,
                "created_at": created.isoformat(),
                "is_demo": True,
            }
        )
    await db.registrations.insert_many(docs)
    return {"seeded": 150, "demo_count": 150, "message": "Loaded 150 demo registrations."}


@api_router.delete("/admin/demo")
async def demo_clear(_: None = Depends(require_admin)):
    result = await db.registrations.delete_many({"is_demo": True})
    return {"deleted": result.deleted_count, "demo_count": 0}


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
