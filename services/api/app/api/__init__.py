from fastapi import APIRouter
from . import auth, checkpoints, verifications, history, reviews, audit, admin, system

router = APIRouter()
