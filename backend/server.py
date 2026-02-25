from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import jwt
from passlib.context import CryptContext

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
SECRET_KEY = os.environ.get('JWT_SECRET', 'vokzo-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI(title="VOKZO API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# ============ MODELS ============

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str
    role: str  # customer, provider

class ProviderSignup(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    confirm_password: str
    category_id: str
    sub_service_id: str
    experience: int
    base_price: float
    city: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    city: Optional[str] = None
    created_at: str

class ProviderResponse(BaseModel):
    id: str
    user_id: str
    full_name: str
    email: str
    category_id: str
    category_name: Optional[str] = None
    sub_service_id: str
    sub_service_name: Optional[str] = None
    experience: int
    base_price: float
    rating: float
    total_reviews: int
    is_verified: bool
    is_approved: bool
    is_online: bool
    city: str
    created_at: str

class BookingCreate(BaseModel):
    provider_id: str
    sub_service_id: str
    booking_date: str
    booking_time: str
    address: str
    city: str
    notes: Optional[str] = None

class BookingResponse(BaseModel):
    id: str
    customer_id: str
    customer_name: str
    provider_id: str
    provider_name: str
    sub_service_id: str
    sub_service_name: str
    category_name: str
    booking_date: str
    booking_time: str
    address: str
    city: str
    notes: Optional[str] = None
    status: str
    base_price: float
    commission: float
    provider_earnings: float
    created_at: str

class ServiceCategory(BaseModel):
    id: str
    name: str
    icon: str
    description: str
    provider_count: int

class SubService(BaseModel):
    id: str
    category_id: str
    name: str
    description: str
    icon: str

class ReviewCreate(BaseModel):
    booking_id: str
    provider_id: str
    rating: int
    comment: Optional[str] = None

class AdminSettings(BaseModel):
    commission_percentage: float

# ============ HELPER FUNCTIONS ============

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_admin_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

async def get_provider_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "provider":
        raise HTTPException(status_code=403, detail="Provider access required")
    return current_user

# ============ AUTH ROUTES ============

@api_router.post("/auth/signup")
async def signup(user: UserCreate):
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    if user.role not in ["customer", "provider"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    user_doc = {
        "id": str(uuid.uuid4()),
        "full_name": user.full_name,
        "email": user.email,
        "password": get_password_hash(user.password),
        "role": user.role,
        "city": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    token = create_access_token({"user_id": user_doc["id"], "role": user_doc["role"]})
    
    return {
        "token": token,
        "user": {
            "id": user_doc["id"],
            "full_name": user_doc["full_name"],
            "email": user_doc["email"],
            "role": user_doc["role"]
        }
    }

@api_router.post("/auth/provider-signup")
async def provider_signup(data: ProviderSignup):
    if data.password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "full_name": data.full_name,
        "email": data.email,
        "password": get_password_hash(data.password),
        "role": "provider",
        "city": data.city,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    provider_doc = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "full_name": data.full_name,
        "email": data.email,
        "category_id": data.category_id,
        "sub_service_id": data.sub_service_id,
        "experience": data.experience,
        "base_price": data.base_price,
        "rating": 0.0,
        "total_reviews": 0,
        "is_verified": False,
        "is_approved": False,
        "is_online": False,
        "city": data.city,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    await db.providers.insert_one(provider_doc)
    
    token = create_access_token({"user_id": user_id, "role": "provider"})
    
    return {
        "token": token,
        "user": {
            "id": user_id,
            "full_name": data.full_name,
            "email": data.email,
            "role": "provider"
        },
        "provider_id": provider_doc["id"]
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    token = create_access_token({"user_id": user["id"], "role": user["role"]})
    
    return {
        "token": token,
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "email": user["email"],
            "role": user["role"],
            "city": user.get("city")
        }
    }

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user_data = {
        "id": current_user["id"],
        "full_name": current_user["full_name"],
        "email": current_user["email"],
        "role": current_user["role"],
        "city": current_user.get("city")
    }
    
    if current_user["role"] == "provider":
        provider = await db.providers.find_one({"user_id": current_user["id"]}, {"_id": 0})
        if provider:
            user_data["provider"] = provider
    
    return user_data

@api_router.put("/auth/update-city")
async def update_city(city: str, current_user: dict = Depends(get_current_user)):
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"city": city}})
    return {"message": "City updated", "city": city}

# ============ SERVICE ROUTES ============

@api_router.get("/services/categories", response_model=List[ServiceCategory])
async def get_categories():
    categories = await db.service_categories.find({}, {"_id": 0}).to_list(100)
    for cat in categories:
        count = await db.providers.count_documents({"category_id": cat["id"], "is_approved": True})
        cat["provider_count"] = count
    return categories

@api_router.get("/services/categories/{category_id}/sub-services", response_model=List[SubService])
async def get_sub_services(category_id: str):
    sub_services = await db.sub_services.find({"category_id": category_id}, {"_id": 0}).to_list(100)
    return sub_services

@api_router.get("/services/sub-services", response_model=List[SubService])
async def get_all_sub_services():
    sub_services = await db.sub_services.find({}, {"_id": 0}).to_list(100)
    return sub_services

@api_router.get("/services/search")
async def search_services(q: str):
    categories = await db.service_categories.find(
        {"$or": [{"name": {"$regex": q, "$options": "i"}}, {"description": {"$regex": q, "$options": "i"}}]},
        {"_id": 0}
    ).to_list(100)
    
    sub_services = await db.sub_services.find(
        {"$or": [{"name": {"$regex": q, "$options": "i"}}, {"description": {"$regex": q, "$options": "i"}}]},
        {"_id": 0}
    ).to_list(100)
    
    return {"categories": categories, "sub_services": sub_services}

# ============ PROVIDER ROUTES ============

@api_router.get("/providers")
async def get_providers(
    sub_service_id: Optional[str] = None,
    category_id: Optional[str] = None,
    city: Optional[str] = None
):
    query = {"is_approved": True}
    if sub_service_id:
        query["sub_service_id"] = sub_service_id
    if category_id:
        query["category_id"] = category_id
    if city:
        query["city"] = city
    
    providers = await db.providers.find(query, {"_id": 0}).to_list(100)
    
    for provider in providers:
        category = await db.service_categories.find_one({"id": provider["category_id"]}, {"_id": 0})
        sub_service = await db.sub_services.find_one({"id": provider["sub_service_id"]}, {"_id": 0})
        provider["category_name"] = category["name"] if category else None
        provider["sub_service_name"] = sub_service["name"] if sub_service else None
    
    return providers

@api_router.get("/providers/{provider_id}")
async def get_provider(provider_id: str):
    provider = await db.providers.find_one({"id": provider_id}, {"_id": 0})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    category = await db.service_categories.find_one({"id": provider["category_id"]}, {"_id": 0})
    sub_service = await db.sub_services.find_one({"id": provider["sub_service_id"]}, {"_id": 0})
    provider["category_name"] = category["name"] if category else None
    provider["sub_service_name"] = sub_service["name"] if sub_service else None
    
    reviews = await db.reviews.find({"provider_id": provider_id}, {"_id": 0}).to_list(50)
    provider["reviews"] = reviews
    
    return provider

@api_router.put("/providers/toggle-online")
async def toggle_online(current_user: dict = Depends(get_provider_user)):
    provider = await db.providers.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    new_status = not provider.get("is_online", False)
    await db.providers.update_one({"user_id": current_user["id"]}, {"$set": {"is_online": new_status}})
    return {"is_online": new_status}

@api_router.get("/providers/dashboard/stats")
async def get_provider_stats(current_user: dict = Depends(get_provider_user)):
    provider = await db.providers.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    total_bookings = await db.bookings.count_documents({"provider_id": provider["id"]})
    completed_bookings = await db.bookings.count_documents({"provider_id": provider["id"], "status": "completed"})
    pending_bookings = await db.bookings.count_documents({"provider_id": provider["id"], "status": "pending"})
    
    earnings_pipeline = [
        {"$match": {"provider_id": provider["id"], "status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$provider_earnings"}}}
    ]
    earnings_result = await db.bookings.aggregate(earnings_pipeline).to_list(1)
    total_earnings = earnings_result[0]["total"] if earnings_result else 0
    
    return {
        "provider": provider,
        "total_bookings": total_bookings,
        "completed_bookings": completed_bookings,
        "pending_bookings": pending_bookings,
        "total_earnings": total_earnings
    }

# ============ BOOKING ROUTES ============

@api_router.post("/bookings")
async def create_booking(booking: BookingCreate, current_user: dict = Depends(get_current_user)):
    provider = await db.providers.find_one({"id": booking.provider_id}, {"_id": 0})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    sub_service = await db.sub_services.find_one({"id": booking.sub_service_id}, {"_id": 0})
    category = await db.service_categories.find_one({"id": provider["category_id"]}, {"_id": 0})
    
    settings = await db.admin_settings.find_one({}, {"_id": 0})
    commission_pct = settings.get("commission_percentage", 15) if settings else 15
    
    commission = (provider["base_price"] * commission_pct) / 100
    provider_earnings = provider["base_price"] - commission
    
    booking_doc = {
        "id": str(uuid.uuid4()),
        "customer_id": current_user["id"],
        "customer_name": current_user["full_name"],
        "provider_id": provider["id"],
        "provider_name": provider["full_name"],
        "sub_service_id": booking.sub_service_id,
        "sub_service_name": sub_service["name"] if sub_service else None,
        "category_name": category["name"] if category else None,
        "booking_date": booking.booking_date,
        "booking_time": booking.booking_time,
        "address": booking.address,
        "city": booking.city,
        "notes": booking.notes,
        "status": "pending",
        "base_price": provider["base_price"],
        "commission": commission,
        "provider_earnings": provider_earnings,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.bookings.insert_one(booking_doc)
    
    return {k: v for k, v in booking_doc.items() if k != "_id"}

@api_router.get("/bookings/customer")
async def get_customer_bookings(current_user: dict = Depends(get_current_user)):
    bookings = await db.bookings.find({"customer_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bookings

@api_router.get("/bookings/provider")
async def get_provider_bookings(current_user: dict = Depends(get_provider_user)):
    provider = await db.providers.find_one({"user_id": current_user["id"]}, {"_id": 0})
    if not provider:
        raise HTTPException(status_code=404, detail="Provider profile not found")
    
    bookings = await db.bookings.find({"provider_id": provider["id"]}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bookings

@api_router.put("/bookings/{booking_id}/accept")
async def accept_booking(booking_id: str, current_user: dict = Depends(get_provider_user)):
    provider = await db.providers.find_one({"user_id": current_user["id"]}, {"_id": 0})
    booking = await db.bookings.find_one({"id": booking_id, "provider_id": provider["id"]}, {"_id": 0})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": "accepted"}})
    return {"message": "Booking accepted", "status": "accepted"}

@api_router.put("/bookings/{booking_id}/reject")
async def reject_booking(booking_id: str, current_user: dict = Depends(get_provider_user)):
    provider = await db.providers.find_one({"user_id": current_user["id"]}, {"_id": 0})
    booking = await db.bookings.find_one({"id": booking_id, "provider_id": provider["id"]}, {"_id": 0})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": "rejected"}})
    return {"message": "Booking rejected", "status": "rejected"}

@api_router.put("/bookings/{booking_id}/complete")
async def complete_booking(booking_id: str, current_user: dict = Depends(get_provider_user)):
    provider = await db.providers.find_one({"user_id": current_user["id"]}, {"_id": 0})
    booking = await db.bookings.find_one({"id": booking_id, "provider_id": provider["id"]}, {"_id": 0})
    
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    await db.bookings.update_one({"id": booking_id}, {"$set": {"status": "completed"}})
    return {"message": "Booking completed", "status": "completed"}

# ============ REVIEW ROUTES ============

@api_router.post("/reviews")
async def create_review(review: ReviewCreate, current_user: dict = Depends(get_current_user)):
    booking = await db.bookings.find_one({"id": review.booking_id, "customer_id": current_user["id"]}, {"_id": 0})
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    existing_review = await db.reviews.find_one({"booking_id": review.booking_id})
    if existing_review:
        raise HTTPException(status_code=400, detail="Review already exists for this booking")
    
    review_doc = {
        "id": str(uuid.uuid4()),
        "booking_id": review.booking_id,
        "customer_id": current_user["id"],
        "customer_name": current_user["full_name"],
        "provider_id": review.provider_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.reviews.insert_one(review_doc)
    
    # Update provider rating
    reviews = await db.reviews.find({"provider_id": review.provider_id}, {"_id": 0}).to_list(1000)
    avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
    await db.providers.update_one(
        {"id": review.provider_id},
        {"$set": {"rating": round(avg_rating, 1), "total_reviews": len(reviews)}}
    )
    
    return {k: v for k, v in review_doc.items() if k != "_id"}

# ============ ADMIN ROUTES ============

@api_router.get("/admin/providers")
async def admin_get_providers(current_user: dict = Depends(get_admin_user)):
    providers = await db.providers.find({}, {"_id": 0}).to_list(100)
    for provider in providers:
        category = await db.service_categories.find_one({"id": provider["category_id"]}, {"_id": 0})
        sub_service = await db.sub_services.find_one({"id": provider["sub_service_id"]}, {"_id": 0})
        provider["category_name"] = category["name"] if category else None
        provider["sub_service_name"] = sub_service["name"] if sub_service else None
    return providers

@api_router.put("/admin/providers/{provider_id}/approve")
async def admin_approve_provider(provider_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.providers.update_one({"id": provider_id}, {"$set": {"is_approved": True, "is_verified": True}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Provider not found")
    return {"message": "Provider approved"}

@api_router.put("/admin/providers/{provider_id}/reject")
async def admin_reject_provider(provider_id: str, current_user: dict = Depends(get_admin_user)):
    result = await db.providers.update_one({"id": provider_id}, {"$set": {"is_approved": False}})
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Provider not found")
    return {"message": "Provider rejected"}

@api_router.get("/admin/bookings")
async def admin_get_bookings(current_user: dict = Depends(get_admin_user)):
    bookings = await db.bookings.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return bookings

@api_router.get("/admin/analytics")
async def admin_get_analytics(current_user: dict = Depends(get_admin_user)):
    total_users = await db.users.count_documents({"role": {"$ne": "admin"}})
    total_customers = await db.users.count_documents({"role": "customer"})
    total_providers = await db.providers.count_documents({})
    approved_providers = await db.providers.count_documents({"is_approved": True})
    pending_providers = await db.providers.count_documents({"is_approved": False})
    
    total_bookings = await db.bookings.count_documents({})
    pending_bookings = await db.bookings.count_documents({"status": "pending"})
    completed_bookings = await db.bookings.count_documents({"status": "completed"})
    
    revenue_pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$commission"}}}
    ]
    revenue_result = await db.bookings.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    settings = await db.admin_settings.find_one({}, {"_id": 0})
    commission_pct = settings.get("commission_percentage", 15) if settings else 15
    
    return {
        "total_users": total_users,
        "total_customers": total_customers,
        "total_providers": total_providers,
        "approved_providers": approved_providers,
        "pending_providers": pending_providers,
        "total_bookings": total_bookings,
        "pending_bookings": pending_bookings,
        "completed_bookings": completed_bookings,
        "total_revenue": total_revenue,
        "commission_percentage": commission_pct
    }

@api_router.put("/admin/settings/commission")
async def update_commission(settings: AdminSettings, current_user: dict = Depends(get_admin_user)):
    await db.admin_settings.update_one({}, {"$set": {"commission_percentage": settings.commission_percentage}}, upsert=True)
    return {"message": "Commission updated", "commission_percentage": settings.commission_percentage}

@api_router.post("/admin/categories")
async def admin_create_category(name: str, icon: str, description: str, current_user: dict = Depends(get_admin_user)):
    category_doc = {
        "id": str(uuid.uuid4()),
        "name": name,
        "icon": icon,
        "description": description,
        "provider_count": 0
    }
    await db.service_categories.insert_one(category_doc)
    return {k: v for k, v in category_doc.items() if k != "_id"}

@api_router.post("/admin/sub-services")
async def admin_create_sub_service(category_id: str, name: str, description: str, icon: str, current_user: dict = Depends(get_admin_user)):
    sub_service_doc = {
        "id": str(uuid.uuid4()),
        "category_id": category_id,
        "name": name,
        "description": description,
        "icon": icon
    }
    await db.sub_services.insert_one(sub_service_doc)
    return {k: v for k, v in sub_service_doc.items() if k != "_id"}

@api_router.delete("/admin/categories/{category_id}")
async def admin_delete_category(category_id: str, current_user: dict = Depends(get_admin_user)):
    await db.service_categories.delete_one({"id": category_id})
    await db.sub_services.delete_many({"category_id": category_id})
    return {"message": "Category deleted"}

@api_router.delete("/admin/sub-services/{sub_service_id}")
async def admin_delete_sub_service(sub_service_id: str, current_user: dict = Depends(get_admin_user)):
    await db.sub_services.delete_one({"id": sub_service_id})
    return {"message": "Sub-service deleted"}

# ============ CITIES ============

@api_router.get("/cities")
async def get_cities():
    return {
        "cities": [
            {"id": "delhi", "name": "Delhi", "state": "Delhi"},
            {"id": "mumbai", "name": "Mumbai", "state": "Maharashtra"},
            {"id": "bangalore", "name": "Bangalore", "state": "Karnataka"},
            {"id": "chennai", "name": "Chennai", "state": "Tamil Nadu"},
            {"id": "kolkata", "name": "Kolkata", "state": "West Bengal"},
            {"id": "hyderabad", "name": "Hyderabad", "state": "Telangana"},
            {"id": "pune", "name": "Pune", "state": "Maharashtra"},
            {"id": "ahmedabad", "name": "Ahmedabad", "state": "Gujarat"},
            {"id": "jaipur", "name": "Jaipur", "state": "Rajasthan"},
            {"id": "lucknow", "name": "Lucknow", "state": "Uttar Pradesh"}
        ],
        "villages": [
            {"id": "himatnagar", "name": "Himatnagar", "state": "Gujarat"},
            {"id": "mehsana", "name": "Mehsana", "state": "Gujarat"},
            {"id": "palanpur", "name": "Palanpur", "state": "Gujarat"},
            {"id": "nadiad", "name": "Nadiad", "state": "Gujarat"},
            {"id": "anand", "name": "Anand", "state": "Gujarat"},
            {"id": "junagadh", "name": "Junagadh", "state": "Gujarat"},
            {"id": "porbandar", "name": "Porbandar", "state": "Gujarat"},
            {"id": "gandhidham", "name": "Gandhidham", "state": "Gujarat"},
            {"id": "bhuj", "name": "Bhuj", "state": "Gujarat"},
            {"id": "morbi", "name": "Morbi", "state": "Gujarat"}
        ]
    }

# ============ SEED DATA ============

@api_router.post("/seed")
async def seed_data():
    # Check if already seeded
    existing_admin = await db.users.find_one({"email": "memonaynul2403@gmail.com"})
    if existing_admin:
        return {"message": "Data already seeded"}
    
    # Create admin user
    admin_doc = {
        "id": str(uuid.uuid4()),
        "full_name": "Admin",
        "email": "memonaynul2403@gmail.com",
        "password": get_password_hash("aynul2226@"),
        "role": "admin",
        "city": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(admin_doc)
    
    # Create service categories
    categories = [
        {"id": "home-services", "name": "Home Services", "icon": "Home", "description": "Professional home maintenance and repair services"},
        {"id": "appliance-services", "name": "Appliance Services", "icon": "Refrigerator", "description": "Expert appliance repair and maintenance"},
        {"id": "tech-services", "name": "Tech Services", "icon": "Laptop", "description": "Technology installation and repair services"},
        {"id": "vehicle-services", "name": "Vehicle Services", "icon": "Car", "description": "Vehicle repair and maintenance"},
        {"id": "personal-services", "name": "Personal Services", "icon": "User", "description": "Personal care and wellness services"},
        {"id": "local-services", "name": "Local Services", "icon": "MapPin", "description": "Various local assistance services"}
    ]
    
    for cat in categories:
        cat["provider_count"] = 0
        await db.service_categories.insert_one(cat)
    
    # Create sub-services
    sub_services = [
        # Home Services
        {"id": "plumber", "category_id": "home-services", "name": "Plumber", "description": "Pipe repairs, leaks, bathroom fittings", "icon": "Wrench"},
        {"id": "electrician", "category_id": "home-services", "name": "Electrician", "description": "Wiring, switches, electrical repairs", "icon": "Zap"},
        {"id": "carpenter", "category_id": "home-services", "name": "Carpenter", "description": "Furniture repair, woodwork", "icon": "Hammer"},
        {"id": "painter", "category_id": "home-services", "name": "Painter", "description": "Wall painting, waterproofing", "icon": "Paintbrush"},
        {"id": "cleaning", "category_id": "home-services", "name": "Cleaning Service", "description": "Deep cleaning, sanitization", "icon": "Sparkles"},
        {"id": "pest-control", "category_id": "home-services", "name": "Pest Control", "description": "Termite, cockroach control", "icon": "Bug"},
        # Appliance Services
        {"id": "ac-repair", "category_id": "appliance-services", "name": "AC Repair", "description": "AC servicing, gas refill, repair", "icon": "Wind"},
        {"id": "fridge-repair", "category_id": "appliance-services", "name": "Refrigerator Repair", "description": "Fridge repair and servicing", "icon": "Refrigerator"},
        {"id": "washing-machine", "category_id": "appliance-services", "name": "Washing Machine Repair", "description": "Washing machine servicing", "icon": "WashingMachine"},
        {"id": "ro-service", "category_id": "appliance-services", "name": "RO Service", "description": "Water purifier servicing", "icon": "Droplets"},
        # Tech Services
        {"id": "mobile-repair", "category_id": "tech-services", "name": "Mobile Repair", "description": "Screen repair, battery replacement", "icon": "Smartphone"},
        {"id": "laptop-repair", "category_id": "tech-services", "name": "Laptop Repair", "description": "Laptop servicing and repair", "icon": "Laptop"},
        {"id": "cctv-install", "category_id": "tech-services", "name": "CCTV Installation", "description": "Security camera setup", "icon": "Camera"},
        {"id": "it-support", "category_id": "tech-services", "name": "IT Support", "description": "Software, network issues", "icon": "Monitor"},
        # Vehicle Services
        {"id": "bike-repair", "category_id": "vehicle-services", "name": "Bike Repair", "description": "Two-wheeler servicing", "icon": "Bike"},
        {"id": "car-repair", "category_id": "vehicle-services", "name": "Car Repair", "description": "Car servicing and repair", "icon": "Car"},
        {"id": "towing", "category_id": "vehicle-services", "name": "Towing Service", "description": "Vehicle towing assistance", "icon": "Truck"},
        # Personal Services
        {"id": "salon-home", "category_id": "personal-services", "name": "Salon at Home", "description": "Haircut, grooming at home", "icon": "Scissors"},
        {"id": "fitness", "category_id": "personal-services", "name": "Fitness Trainer", "description": "Personal training sessions", "icon": "Dumbbell"},
        {"id": "makeup", "category_id": "personal-services", "name": "Makeup Artist", "description": "Bridal, party makeup", "icon": "Palette"},
        # Local Services
        {"id": "tutor", "category_id": "local-services", "name": "Home Tutor", "description": "Private tutoring", "icon": "GraduationCap"},
        {"id": "movers", "category_id": "local-services", "name": "Movers & Packers", "description": "Relocation services", "icon": "Package"},
        {"id": "event-support", "category_id": "local-services", "name": "Event Support", "description": "Event planning assistance", "icon": "Calendar"}
    ]
    
    for sub in sub_services:
        await db.sub_services.insert_one(sub)
    
    # Create admin settings
    await db.admin_settings.insert_one({"commission_percentage": 15})
    
    return {"message": "Data seeded successfully"}

# Include router
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
