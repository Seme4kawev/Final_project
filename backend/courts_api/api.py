import jwt
import datetime
from django.conf import settings
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from ninja import NinjaAPI, Schema, Router
from ninja.security import HttpBearer
from typing import List, Optional
from .models import Court, Reservation

api = NinjaAPI(title="Sports Booking API")

class AuthBearer(HttpBearer):
    def authenticate(self, request, token):
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = User.objects.get(id=payload['user_id'])
            request.user = user
            return user
        except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, User.DoesNotExist):
            return None

# ============================
# SCHEMAS
# ============================

class MessageSchema(Schema):
    message: str

class UserSchema(Schema):
    id: int
    username: str
    email: str
    is_staff: bool

class RegisterIn(Schema):
    username: str
    password: str
    email: str

class LoginIn(Schema):
    username: str
    password: str

class TokenOut(Schema):
    token: str
    user: UserSchema

class CourtSchema(Schema):
    id: int
    name: str
    sport_type: str
    description: str
    is_active: bool

class CourtIn(Schema):
    name: str
    sport_type: str
    description: str
    is_active: bool = True

class ReservationSchema(Schema):
    id: int
    user_id: int
    court_id: int
    date: datetime.date
    start_time: datetime.time
    end_time: datetime.time
    status: str

class ReservationDetailSchema(ReservationSchema):
    court: CourtSchema
    user: UserSchema

class ReservationIn(Schema):
    court_id: int
    date: datetime.date
    start_time: datetime.time
    end_time: datetime.time

class ReservationStatusIn(Schema):
    status: str

# ============================
# AUTH ROUTER
# ============================
auth_router = Router()

@auth_router.post("/register", response={200: TokenOut, 400: MessageSchema})
def register(request, payload: RegisterIn):
    if User.objects.filter(username=payload.username).exists():
        return 400, {"message": "Username already exists"}
    user = User.objects.create_user(username=payload.username, password=payload.password, email=payload.email)
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }, settings.SECRET_KEY, algorithm='HS256')
    return 200, {"token": token, "user": user}

@auth_router.post("/login", response={200: TokenOut, 400: MessageSchema})
def login(request, payload: LoginIn):
    user = authenticate(username=payload.username, password=payload.password)
    if user:
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
        }, settings.SECRET_KEY, algorithm='HS256')
        return 200, {"token": token, "user": user}
    return 400, {"message": "Invalid credentials"}

@auth_router.get("/me", response=UserSchema, auth=AuthBearer())
def get_me(request):
    return request.user

# ============================
# COURTS ROUTER
# ============================
courts_router = Router()

@courts_router.get("/", response=List[CourtSchema])
def list_courts(request):
    return Court.objects.all()

@courts_router.post("/", response={200: CourtSchema, 403: MessageSchema}, auth=AuthBearer())
def create_court(request, payload: CourtIn):
    if not request.user.is_staff:
        return 403, {"message": "Admin only"}
    court = Court.objects.create(**payload.dict())
    return 200, court

@courts_router.put("/{court_id}", response={200: CourtSchema, 403: MessageSchema, 404: MessageSchema}, auth=AuthBearer())
def update_court(request, court_id: int, payload: CourtIn):
    if not request.user.is_staff:
        return 403, {"message": "Admin only"}
    court = get_object_or_404(Court, id=court_id)
    for attr, value in payload.dict().items():
        setattr(court, attr, value)
    court.save()
    return 200, court

@courts_router.delete("/{court_id}", response={200: MessageSchema, 403: MessageSchema}, auth=AuthBearer())
def delete_court(request, court_id: int):
    if not request.user.is_staff:
        return 403, {"message": "Admin only"}
    court = get_object_or_404(Court, id=court_id)
    court.delete()
    return 200, {"message": "Deleted successfully"}

# ============================
# RESERVATIONS ROUTER
# ============================
reservations_router = Router(auth=AuthBearer())

@reservations_router.get("/", response=List[ReservationDetailSchema])
def list_reservations(request):
    if request.user.is_staff:
        return Reservation.objects.all().order_by('-date', '-start_time')
    return Reservation.objects.filter(user=request.user).order_by('-date', '-start_time')

@reservations_router.post("/", response={200: ReservationSchema, 400: MessageSchema, 404: MessageSchema})
def create_reservation(request, payload: ReservationIn):
    court = get_object_or_404(Court, id=payload.court_id)
    if not court.is_active:
        return 400, {"message": "Court is not active"}
    
    if payload.start_time >= payload.end_time:
        return 400, {"message": "End time must be after start time"}

    # Check overlaps
    overlapping = Reservation.objects.filter(
        court=court,
        date=payload.date,
        status__in=['pending', 'confirmed']
    ).filter(
        start_time__lt=payload.end_time,
        end_time__gt=payload.start_time
    ).exists()

    if overlapping:
        return 400, {"message": "Time slot is already booked"}

    reservation = Reservation.objects.create(
        user=request.user,
        court=court,
        date=payload.date,
        start_time=payload.start_time,
        end_time=payload.end_time,
        status='pending'
    )
    return 200, reservation

@reservations_router.put("/{res_id}/status", response={200: ReservationSchema, 403: MessageSchema})
def update_reservation_status(request, res_id: int, payload: ReservationStatusIn):
    if not request.user.is_staff:
        return 403, {"message": "Admin only"}
    res = get_object_or_404(Reservation, id=res_id)
    res.status = payload.status
    res.save()
    return 200, res

@reservations_router.delete("/{res_id}", response={200: MessageSchema, 403: MessageSchema})
def delete_reservation(request, res_id: int):
    res = get_object_or_404(Reservation, id=res_id)
    if not request.user.is_staff and res.user != request.user:
        return 403, {"message": "Not your reservation"}
    res.delete()
    return 200, {"message": "Deleted successfully"}

api.add_router("/auth", auth_router)
api.add_router("/courts", courts_router)
api.add_router("/reservations", reservations_router)
