from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class TripRequest(BaseModel):
    destination: str = Field(..., example="Kyoto, Japan")
    start_date: str = Field(..., example="2026-11-10")
    end_date: str = Field(..., example="2026-11-13")
    duration_days: int = Field(3, ge=1, le=14)
    budget_tier: str = Field("moderate", example="budget | moderate | luxury")
    currency: str = Field("USD", example="USD")
    travel_style: str = Field("balanced", example="relaxed | balanced | fast-paced | romantic | adventure")
    traveler_type: str = Field("solo", example="solo | couple | group | family")
    group_size: int = Field(1, ge=1, le=50)
    interests: List[str] = Field(default_factory=lambda: ["Sightseeing", "Food & Dining"])
    dietary_preferences: Optional[List[str]] = Field(default_factory=list)
    accommodation_type: Optional[str] = "boutique hotel"
    pace_preference: Optional[str] = "balanced"
    custom_notes: Optional[str] = ""

class ActivityItem(BaseModel):
    id: str
    time_slot: str
    period: str  # morning, afternoon, evening, night
    title: str
    category: str  # sightseeing, dining, culture, adventure, leisure, transit, lodging
    description: str
    location_name: str
    coordinates: Optional[Dict[str, float]] = None  # {"lat": 35.0, "lng": 135.7}
    estimated_cost: float = 0.0
    currency: str = "USD"
    insider_tip: str = ""
    duration_mins: int = 90
    is_booked: bool = False

class DayPlan(BaseModel):
    day_number: int
    date: str
    theme: str
    summary: str
    activities: List[ActivityItem]
    day_budget_estimate: float = 0.0
    transit_advice: str = ""

class TripCostBreakdown(BaseModel):
    accommodations: float = 0.0
    activities_and_tickets: float = 0.0
    food_and_dining: float = 0.0
    local_transit: float = 0.0
    contingency: float = 0.0
    total_estimated: float = 0.0
    currency: str = "USD"

class TripItinerary(BaseModel):
    id: str
    title: str
    destination: str
    tagline: str
    overview: str
    hero_image_keyword: str = "travel"
    hero_gradient: str = "from-teal-500 to-indigo-600"
    traveler_type: str = "solo"
    group_size: int = 1
    travel_style: str = "balanced"
    budget_tier: str = "moderate"
    start_date: str
    end_date: str
    duration_days: int
    currency: str = "USD"
    days: List[DayPlan]
    cost_breakdown: TripCostBreakdown
    packing_list: List[str] = Field(default_factory=list)
    local_tips: List[str] = Field(default_factory=list)
    weather_forecast_note: str = ""
    created_at: str
    updated_at: str
    share_slug: Optional[str] = None

class RegenerateDayRequest(BaseModel):
    trip_id: Optional[str] = None
    day_number: int
    destination: str
    date: str
    travel_style: str
    traveler_type: str
    budget_tier: str
    interests: List[str] = Field(default_factory=list)
    custom_request: Optional[str] = ""

class ConfigUpdateRequest(BaseModel):
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    database_url: Optional[str] = None
    gemini_key: Optional[str] = None
    openai_key: Optional[str] = None
