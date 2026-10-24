import os
import uuid
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import reload_config, update_env_file, is_supabase_configured, SUPABASE_URL
from models import TripRequest, TripItinerary, DayPlan, RegenerateDayRequest, ConfigUpdateRequest
from ai_service import generate_itinerary, generate_itinerary_with_llm, regenerate_single_day
from supabase_service import storage, SUPABASE_SQL_SCHEMA

app = FastAPI(
    title="Personalized Travel Itinerary Planner API",
    description="AI-powered full-stack travel planner with FastAPI and Supabase integration",
    version="1.0.0"
)

# Enable CORS for frontend development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pre-seed Scenario Templates
SCENARIO_TEMPLATES = [
    {
        "id": "scenario-1-solo-kyoto",
        "title": "Weekend Solo Getaway to Kyoto",
        "scenario_name": "Scenario 1: Solo Traveler Weekend Getaway",
        "destination": "Kyoto, Japan",
        "tagline": "Optimized, Stress-Free Weekend in the Cultural Heart of Japan",
        "duration_days": 3,
        "traveler_type": "solo",
        "group_size": 1,
        "budget_tier": "budget",
        "travel_style": "fast-paced",
        "interests": ["Food & Dining", "Sightseeing", "Photography", "Culture & History"],
        "badge": "Solo Weekend",
        "cover_image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80",
        "description": "Short weekend trip with tight time constraints. High-efficiency routes, early-morning temple photography, and budget street-food crawls along Nishiki Market."
    },
    {
        "id": "scenario-2-couple-amalfi",
        "title": "Romantic Escape to Amalfi Coast",
        "scenario_name": "Scenario 2: Couple Planning a Romantic Vacation",
        "destination": "Amalfi Coast, Italy",
        "tagline": "Cliffside Romance, Limoncello Groves & Mediterranean Sunsets",
        "duration_days": 5,
        "traveler_type": "couple",
        "group_size": 2,
        "budget_tier": "luxury",
        "travel_style": "romantic",
        "interests": ["Scenic Spots", "Fine Dining", "Leisure", "Unique Experiences"],
        "badge": "Romantic Couple",
        "cover_image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&q=80",
        "description": "Curated for romance: sunset private boat cruise, candlelit cliffside dinners, Ravello marble terraces, and leisurely pacing with day-by-day customization."
    },
    {
        "id": "scenario-3-group-bali",
        "title": "Small Group Adventure in Bali",
        "scenario_name": "Scenario 3: Small Group Coordinating Multi-Day Trip",
        "destination": "Bali, Indonesia",
        "tagline": "Synchronized Group Thrills, Water Temples & Beach Sunsets",
        "duration_days": 4,
        "traveler_type": "group",
        "group_size": 5,
        "budget_tier": "moderate",
        "travel_style": "adventure",
        "interests": ["Adventure", "Culture & History", "Nature & Outdoors", "Nightlife"],
        "badge": "Group Expedition",
        "cover_image": "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
        "description": "Group of 5 friends coordinating diverse tastes: volcano sunrise trek, white-water rapids, sacred purification springs, and shared private transit logistics."
    }
]

def _seed_initial_trips_if_empty():
    trips = storage.list_trips()
    if not trips:
        for tpl in SCENARIO_TEMPLATES:
            req = TripRequest(
                destination=tpl["destination"],
                start_date="2026-11-15",
                end_date="2026-11-18",
                duration_days=tpl["duration_days"],
                budget_tier=tpl["budget_tier"],
                travel_style=tpl["travel_style"],
                traveler_type=tpl["traveler_type"],
                group_size=tpl["group_size"],
                interests=tpl["interests"]
            )
            itin = generate_itinerary(req)
            itin.id = tpl["id"]
            itin.title = tpl["title"]
            itin.tagline = tpl["tagline"]
            storage.save_trip(itin.dict())

# Seed on startup
_seed_initial_trips_if_empty()

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Personalized Travel Planner API",
        "supabase_configured": is_supabase_configured()
    }

@app.get("/api/config-status")
def config_status():
    status = storage.get_status()
    return {
        "storage": status,
        "supabase_url": SUPABASE_URL or None,
        "supabase_is_configured": is_supabase_configured(),
        "sql_schema": SUPABASE_SQL_SCHEMA
    }

@app.post("/api/config")
def update_config(req: ConfigUpdateRequest):
    update_env_file(
        supabase_url=req.supabase_url,
        supabase_key=req.supabase_key,
        database_url=req.database_url,
        gemini_key=req.gemini_key,
        openai_key=req.openai_key
    )
    storage.refresh_client()
    return {
        "status": "updated",
        "storage": storage.get_status(),
        "supabase_is_configured": is_supabase_configured()
    }

@app.get("/api/templates")
def get_templates():
    return SCENARIO_TEMPLATES

@app.post("/api/generate-itinerary", response_model=TripItinerary)
async def api_generate_itinerary(req: TripRequest):
    # Try LLM first if API key configured
    itinerary = await generate_itinerary_with_llm(req)
    if not itinerary:
        # Fallback to rich built-in generative engine
        itinerary = generate_itinerary(req)
    
    # Save directly to storage (Supabase or local fallback)
    storage.save_trip(itinerary.dict())
    return itinerary

@app.post("/api/regenerate-day", response_model=DayPlan)
def api_regenerate_day(req: RegenerateDayRequest):
    new_day = regenerate_single_day(req)
    
    # If trip_id is provided, automatically update the saved trip in storage
    if req.trip_id:
        existing = storage.get_trip(req.trip_id)
        if existing and "days" in existing:
            for i, d in enumerate(existing["days"]):
                if d.get("day_number") == req.day_number:
                    existing["days"][i] = new_day.dict()
                    storage.save_trip(existing)
                    break

    return new_day

@app.get("/api/trips")
def get_all_trips():
    return storage.list_trips()

@app.get("/api/trips/{trip_id}")
def get_trip_by_id(trip_id: str):
    trip = storage.get_trip(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip

@app.post("/api/trips")
def create_or_save_trip(trip: TripItinerary):
    saved = storage.save_trip(trip.dict())
    return saved

@app.put("/api/trips/{trip_id}")
def update_trip(trip_id: str, trip_data: Dict[str, Any]):
    existing = storage.get_trip(trip_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Trip not found")
    
    trip_data["id"] = trip_id
    saved = storage.save_trip(trip_data)
    return saved

@app.delete("/api/trips/{trip_id}")
def delete_trip(trip_id: str):
    success = storage.delete_trip(trip_id)
    if not success:
        raise HTTPException(status_code=404, detail="Trip not found or could not be deleted")
    return {"status": "deleted", "id": trip_id}
