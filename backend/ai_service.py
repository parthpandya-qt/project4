import os
import json
import uuid
import math
import random
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx

from config import GEMINI_API_KEY, OPENAI_API_KEY
from models import TripRequest, TripItinerary, DayPlan, ActivityItem, TripCostBreakdown, RegenerateDayRequest

logger = logging.getLogger("ai_service")

# Curated knowledge base for realistic itineraries & coordinates
DESTINATION_KNOWLEDGE = {
    "kyoto": {
        "city": "Kyoto, Japan",
        "tagline": "Ancient Temples, Serene Bamboo Groves & Culinary Treasures",
        "coords": {"lat": 35.0116, "lng": 135.7681},
        "hero_keyword": "kyoto japan",
        "hero_gradient": "linear-gradient(135deg, #134e5e 0%, #71b280 100%)",
        "highlights": [
            {"title": "Fushimi Inari Shrine & 10,000 Torii Gates", "category": "sightseeing", "tip": "Hike early at 7:30 AM to beat the crowd and get serene photos.", "cost": 0, "lat": 34.9671, "lng": 135.7727},
            {"title": "Nishiki Market Street Food Safari", "category": "dining", "tip": "Try grilled tako tamago (baby octopus with quail egg) and matcha warabi mochi.", "cost": 18, "lat": 35.0050, "lng": 135.7650},
            {"title": "Arashiyama Bamboo Grove & Tenryu-ji Temple", "category": "nature", "tip": "Rent a city bicycle at Saga-Arashiyama station for riverside paths.", "cost": 6, "lat": 35.0158, "lng": 135.6713},
            {"title": "Gion Evening Geisha District & Lantern Walk", "category": "culture", "tip": "Walk quietly along Shirakawa Canal around sunset for timeless vibes.", "cost": 0, "lat": 35.0037, "lng": 135.7770},
            {"title": "Kinkaku-ji (The Golden Pavilion)", "category": "sightseeing", "tip": "Catch the reflection on Mirror Lake when sun hits the gold leaf.", "cost": 4, "lat": 35.0394, "lng": 135.7292},
            {"title": "Traditional Kaiseki Multi-Course Dinner", "category": "dining", "tip": "Book riverside tatami seating along the Kamogawa River.", "cost": 65, "lat": 35.0090, "lng": 135.7710},
            {"title": "Kiyomizu-dera Wooden Stage & Otowa Waterfall", "category": "sightseeing", "tip": "Drink from one of three streams for health, longevity, or success in studies.", "cost": 4, "lat": 34.9949, "lng": 135.7850},
            {"title": "Pontocho Alley Izakaya Crawl", "category": "dining", "tip": "Sample local yakitori skewers and crisp Kyoto craft sakes.", "cost": 28, "lat": 35.0065, "lng": 135.7714}
        ],
        "transit_tip": "Acquire an IC card (ICOCA/Suica) or Kyoto 1-Day Subway & Bus Pass for frictionless hopping between wards.",
        "packing": ["Comfortable slip-on walking shoes (for temple shoes-off policy)", "Coin pouch for shrine fortune boxes", "Light layers & rain umbrella"]
    },
    "amalfi": {
        "city": "Amalfi Coast, Italy",
        "tagline": "Cliffside Romance, Limoncello Groves & Turquoise Vistas",
        "coords": {"lat": 40.6340, "lng": 14.6027},
        "hero_keyword": "amalfi coast italy",
        "hero_gradient": "linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%)",
        "highlights": [
            {"title": "Scenic Positano Cliffside Village & Marina Grande", "category": "sightseeing", "tip": "Wear soft linen and sandals; Positano has hundreds of picturesque staircases.", "cost": 0, "lat": 40.6281, "lng": 14.4850},
            {"title": "Private Sunset Gozzo Boat Cruise along Faraglioni", "category": "adventure", "tip": "Includes chilled prosecco and snorkeling into secret sea caves.", "cost": 95, "lat": 40.6270, "lng": 14.4880},
            {"title": "Candlelight Dinner at Ristorante La Sponda", "category": "dining", "tip": "Lit by 400 candles nightly with classical mandolin duo accompaniment.", "cost": 110, "lat": 40.6290, "lng": 14.4860},
            {"title": "Path of the Gods (Sentiero degli Dei) Cliff Walk", "category": "nature", "tip": "Start from Bomerano downwards to Nocelle for effortless downhill panoramic vistas.", "cost": 0, "lat": 40.6210, "lng": 14.5050},
            {"title": "Ravello Villa Cimbrone & Infinity Terrace (Terrazza dell'Infinito)", "category": "culture", "tip": "World-famous marble busts suspended between cobalt sea and sky.", "cost": 10, "lat": 40.6470, "lng": 14.6110},
            {"title": "Artisanal Limoncello Tasting at Lemon Farm Valle dei Mulini", "category": "dining", "tip": "Taste hand-shaved granita made from sfusato amalfitano lemons.", "cost": 22, "lat": 40.6350, "lng": 14.6010},
            {"title": "Amalfi Cathedral (Duomo di Sant'Andrea) & Cloister of Paradise", "category": "sightseeing", "tip": "Marvel at the Arab-Norman mosaic facade towering over Piazza del Duomo.", "cost": 5, "lat": 40.6342, "lng": 14.6028}
        ],
        "transit_tip": "Prefer scheduled passenger ferries (Travelmar) over crowded buses for stunning sea views without winding road nausea.",
        "packing": ["Stylish sunglasses & wide-brim sunhat", "High-SPF reef-safe sunscreen", "Smart evening resort-wear", "Dramamine if prone to curvy coastal drives"]
    },
    "bali": {
        "city": "Bali, Indonesia",
        "tagline": "Tropical Jungle Adventures, Sacred Water Temples & Sunset Beach Clubs",
        "coords": {"lat": -8.4095, "lng": 115.1889},
        "hero_keyword": "bali indonesia",
        "hero_gradient": "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
        "highlights": [
            {"title": "Sunrise Quad Bike & Mount Batur Volcano Trek", "category": "adventure", "tip": "Witness steam vents cooking eggs at summit with group breakfast.", "cost": 45, "lat": -8.2424, "lng": 115.3756},
            {"title": "Tegalalang Rice Terraces & Giant Valley Swing", "category": "nature", "tip": "Great group drone shots among emerald cascading hills.", "cost": 15, "lat": -8.4348, "lng": 115.2798},
            {"title": "Ayung River White Water Rafting Experience", "category": "adventure", "tip": "12km rapids navigate past hidden waterfalls and Hindu rock carvings.", "cost": 35, "lat": -8.4870, "lng": 115.2340},
            {"title": "Tirta Empul Holy Spring Cleansing Ritual", "category": "culture", "tip": "Rent sarongs on-site; respect temple guides during the purification shower.", "cost": 5, "lat": -8.4150, "lng": 115.3150},
            {"title": "Sunset Seafood Feast on Jimbaran Bay Sands", "category": "dining", "tip": "Order grilled red snapper with spicy sambal matah right at the water's edge.", "cost": 25, "lat": -8.7750, "lng": 115.1680},
            {"title": "Canggu & Uluwatu Cliffside Beach Club Experience", "category": "leisure", "tip": "Reserve a group daybed ahead for infinity pool sunset beats.", "cost": 30, "lat": -8.8290, "lng": 115.0840},
            {"title": "Ubud Monkey Forest Sanctuary & Art Market Bargaining", "category": "sightseeing", "tip": "Secure loose sunglasses and phones; keep bananas tucked away.", "cost": 7, "lat": -8.5190, "lng": 115.2630}
        ],
        "transit_tip": "Hire a private air-conditioned van with local driver for the group (approx $45/day total), split effortlessly among all travelers.",
        "packing": ["Quick-dry activewear & water shoes", "Mosquito repellent with DEET", "Waterproof dry bag for rafting", "Power bank with universal adapter"]
    },
    "paris": {
        "city": "Paris, France",
        "tagline": "Haute Cuisine, Timeless Architecture & Secret Bohemian Corners",
        "coords": {"lat": 48.8566, "lng": 2.3522},
        "hero_keyword": "paris france",
        "hero_gradient": "linear-gradient(135deg, #654ea3 0%, #eaafc8 100%)",
        "highlights": [
            {"title": "Sunrise Photography at Trocadéro & Eiffel Tower", "category": "sightseeing", "tip": "Early morning light illuminates the Iron Lady with zero tourists in frame.", "cost": 0, "lat": 48.8624, "lng": 2.2872},
            {"title": "Louvre Masterpieces & Secret Courtyards Tour", "category": "culture", "tip": "Enter via the Carrousel du Louvre underground entrance to skip plaza queues.", "cost": 22, "lat": 48.8606, "lng": 2.3376},
            {"title": "Artisanal Boulangerie & Croissant Tasting in Le Marais", "category": "dining", "tip": "Sample pain au chocolat and salted butter kouign-amann.", "cost": 12, "lat": 48.8575, "lng": 2.3610},
            {"title": "Montmartre Painters Square & Sacré-Cœur Sunset", "category": "culture", "tip": "Sit on the basilique stairs with street harpists as city lights turn on.", "cost": 0, "lat": 48.8867, "lng": 2.3431},
            {"title": "Seine River Twilight Glass-Canopy Dinner Cruise", "category": "dining", "tip": "Passing illuminated Notre-Dame and Musée d'Orsay while dining on duck confit.", "cost": 85, "lat": 48.8580, "lng": 2.2960},
            {"title": "Palais Garnier Opera House & Rooftop Views", "category": "sightseeing", "tip": "Check out the Chagall ceiling painting inside the grand auditorium.", "cost": 15, "lat": 48.8719, "lng": 2.3316}
        ],
        "transit_tip": "Use contactless credit card or Navigo Easy pass on the Paris Métro for rapid 3-minute hops across arrondissements.",
        "packing": ["Chic walking sneakers", "Trench coat or light scarf", "Crossbody bag with secure zip closure"]
    },
    "swiss_alps": {
        "city": "Interlaken & Swiss Alps, Switzerland",
        "tagline": "Glacial Peaks, Alpine Meadows & High-Adrenaline Thrills",
        "coords": {"lat": 46.6863, "lng": 7.8632},
        "hero_keyword": "swiss alps interlaken",
        "hero_gradient": "linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)",
        "highlights": [
            {"title": "Jungfraujoch - Top of Europe & Ice Palace", "category": "adventure", "tip": "Ride the Eiger Express tricable gondola to 3,454m altitude.", "cost": 120, "lat": 46.5475, "lng": 7.9822},
            {"title": "Lauterbrunnen Valley 72 Waterfalls Bike Trail", "category": "nature", "tip": "Rent e-bikes and ride behind Staubbach Falls for magical mist.", "cost": 30, "lat": 46.5935, "lng": 7.9079},
            {"title": "Swiss Cheese Fondue & Rosti Feast at Traditional Chalet", "category": "dining", "tip": "Dip crusty artisan sourdough into bubbling Gruyère and Emmental with Kirsch.", "cost": 42, "lat": 46.6850, "lng": 7.8650},
            {"title": "First Cliff Walk by Tissot & Mountain Cart Downhill", "category": "adventure", "tip": "Suspended footbridge along sheer rock faces with panoramic Eiger backdrop.", "cost": 38, "lat": 46.6578, "lng": 8.0558},
            {"title": "Lake Brienz Turquoise Steamer Boat Excursion", "category": "leisure", "tip": "Glacial mineral waters give this lake its surreal neon turquoise sheen.", "cost": 25, "lat": 46.7110, "lng": 7.9730}
        ],
        "transit_tip": "The Swiss Travel Pass covers unlimited trains, buses, and scenic lake boats across the entire country.",
        "packing": ["Sturdy hiking boots with ankle grip", "Thermal fleece & windproof outer shell", "UV sunglasses for glacial reflections"]
    }
}

def _calculate_budget_multiplier(tier: str) -> float:
    tier = tier.lower()
    if tier == "budget":
        return 0.65
    elif tier == "luxury":
        return 2.4
    return 1.0

def _get_matched_template(destination: str) -> Optional[Dict[str, Any]]:
    dest_lower = destination.lower()
    for key, data in DESTINATION_KNOWLEDGE.items():
        if key in dest_lower or data["city"].lower() in dest_lower or any(part in dest_lower for part in key.split("_")):
            return data
    # Fallback to Kyoto if Japanese, Amalfi if Italian, Paris if French, Bali if tropical
    if any(w in dest_lower for w in ["japan", "tokyo", "osaka"]):
        return DESTINATION_KNOWLEDGE["kyoto"]
    if any(w in dest_lower for w in ["italy", "rome", "florence", "venice", "positano"]):
        return DESTINATION_KNOWLEDGE["amalfi"]
    if any(w in dest_lower for w in ["france", "nice"]):
        return DESTINATION_KNOWLEDGE["paris"]
    if any(w in dest_lower for w in ["thailand", "phuket", "asia", "beach", "island"]):
        return DESTINATION_KNOWLEDGE["bali"]
    if any(w in dest_lower for w in ["switzerland", "mountain", "alps", "austria"]):
        return DESTINATION_KNOWLEDGE["swiss_alps"]
    return None

def _generate_synthetic_activities_for_destination(
    destination: str, 
    day_num: int, 
    date_str: str,
    interests: List[str], 
    travel_style: str, 
    traveler_type: str, 
    budget_multiplier: float,
    currency: str
) -> List[ActivityItem]:
    """Generates dynamic activities for destinations not explicitly pre-mapped."""
    base_lat = 40.7128 + (hash(destination) % 100) * 0.05
    base_lng = -74.0060 + ((hash(destination) // 100) % 100) * 0.05

    day_themes = [
        {"theme": "Iconic Landmarks & Culinary Kickoff", "slots": [
            ("09:00 AM - 11:30 AM", "morning", f"Historic Heart & Grand Plaza of {destination}", "sightseeing", f"Explore the storied architecture and vibrant morning atmosphere in central {destination}.", 15, "Arrive right at opening to photograph empty plazas."),
            ("12:00 PM - 01:30 PM", "afternoon", f"Traditional Local Cuisine at Old Town Bistro", "dining", f"Savor authentic regional delicacies loved by {destination} residents for decades.", 22, "Ask for the seasonal daily special menu."),
            ("02:30 PM - 05:00 PM", "afternoon", f"Cultural Arts & Heritage District Discovery", "culture", f"Wander through artisan workshops, boutique galleries, and historic alleyways.", 12, "Chat with local craftsmen crafting handmade goods."),
            ("07:00 PM - 09:30 PM", "evening", f"Atmospheric Sunset Dinner & Scenic Overlook", "dining", f"Unwind with scenic views of {destination}'s evening skyline and culinary pairings.", 45, "Reserve an outdoor terrace table 30 mins before dusk.")
        ]},
        {"theme": "Hidden Gems, Local Flavors & Scenic Panorama", "slots": [
            ("09:30 AM - 12:00 PM", "morning", f"Secret Gardens & Architectural Marvels", "sightseeing", f"Discover hidden courtyards away from standard tourist corridors.", 10, "Bring a camera for quiet cobblestone lanes."),
            ("12:30 PM - 02:00 PM", "afternoon", f"Artisanal Food Market & Street Delicacies", "dining", f"Sample a variety of freshly prepared snacks, breads, and farm-fresh cheeses.", 16, "Carry small local currency denominations for market stalls."),
            ("03:00 PM - 05:30 PM", "afternoon", f"Panoramic Viewpoint & Nature Walk", "nature", f"Gentle hike or tram ride up to the most famous vista point overlooking {destination}.", 8, "Great spot for high-resolution group or couple portraits."),
            ("07:30 PM - 10:00 PM", "evening", f"Cocktails & Live Acoustic Music", "leisure", f"Experience the nightlife, jazz, or acoustic performance in the bohemian district.", 32, "Try signature cocktails crafted with regional spirits.")
        ]},
        {"theme": "Outdoor Exploration, Markets & Farewell Sunset", "slots": [
            ("09:00 AM - 11:30 AM", "morning", f"Waterfront / Riverside Promenade Walk", "leisure", f"Brisk morning stroll along the water, watching boats and morning street life.", 0, "Grab a fresh artisan coffee from a waterside kiosk."),
            ("12:00 PM - 01:30 PM", "afternoon", f"Farm-to-Table Lunch at Chef's Garden", "dining", f"Modern dining featuring organic seasonal produce from surrounding valleys.", 30, "The handmade pasta or seafood stew is a must-order."),
            ("02:30 PM - 05:00 PM", "afternoon", f"Craft Flea Market & Souvenir Curation", "culture", f"Browse local textiles, spices, vintage finds, and heirloom crafts.", 0, "Bargain respectfully for unique keepsakes."),
            ("06:30 PM - 09:30 PM", "evening", f"Celebratory Farewell Dinner & Night Lights", "dining", f"An unforgettable celebratory dinner marking the grand finale of your journey.", 55, "Toast the trip with a dessert pairing.")
        ]}
    ]

    selected_theme = day_themes[(day_num - 1) % len(day_themes)]
    activities = []
    
    for idx, (slot, period, title, category, desc, cost, tip) in enumerate(selected_theme["slots"]):
        scaled_cost = round(cost * budget_multiplier, 1)
        offset_lat = base_lat + (idx * 0.008) + (day_num * 0.005)
        offset_lng = base_lng + (idx * 0.006) - (day_num * 0.004)
        
        activities.append(ActivityItem(
            id=str(uuid.uuid4())[:8],
            time_slot=slot,
            period=period,
            title=title,
            category=category,
            description=desc,
            location_name=f"{title.split(' at ')[0]}, {destination}",
            coordinates={"lat": round(offset_lat, 4), "lng": round(offset_lng, 4)},
            estimated_cost=scaled_cost,
            currency=currency,
            insider_tip=tip,
            duration_mins=90 if "lunch" in title.lower() or "dinner" in title.lower() else 120,
            is_booked=False
        ))
    
    return activities

async def generate_itinerary_with_llm(req: TripRequest) -> Optional[TripItinerary]:
    """Attempts LLM generation via Gemini or OpenAI if keys are provided."""
    prompt = f"""
You are an expert personalized travel concierge. Create a detailed day-by-day travel itinerary in JSON format.
Trip Details:
- Destination: {req.destination}
- Duration: {req.duration_days} days (From {req.start_date} to {req.end_date})
- Traveler Type: {req.traveler_type} (Group Size: {req.group_size})
- Travel Style: {req.travel_style}
- Budget Tier: {req.budget_tier} (Currency: {req.currency})
- Interests: {', '.join(req.interests)}
- Dietary: {', '.join(req.dietary_preferences or ['None specified'])}
- Accommodation Preference: {req.accommodation_type}
- Pace: {req.pace_preference}
- Notes: {req.custom_notes or 'None'}

Return ONLY valid JSON matching this schema:
{{
  "title": "Inspiring Title",
  "destination": "{req.destination}",
  "tagline": "Captivating Subtitle",
  "overview": "3-4 sentence comprehensive narrative summary of this trip",
  "hero_image_keyword": "keyword for scenery",
  "hero_gradient": "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
  "traveler_type": "{req.traveler_type}",
  "group_size": {req.group_size},
  "travel_style": "{req.travel_style}",
  "budget_tier": "{req.budget_tier}",
  "start_date": "{req.start_date}",
  "end_date": "{req.end_date}",
  "duration_days": {req.duration_days},
  "currency": "{req.currency}",
  "days": [
    {{
      "day_number": 1,
      "date": "{req.start_date}",
      "theme": "Day theme",
      "summary": "Day overview",
      "transit_advice": "Specific transit guidance",
      "day_budget_estimate": 100.0,
      "activities": [
        {{
          "id": "act-1",
          "time_slot": "09:00 AM - 11:30 AM",
          "period": "morning",
          "title": "Activity name",
          "category": "sightseeing|dining|culture|adventure|leisure|transit|lodging",
          "description": "Engaging description",
          "location_name": "Exact place name",
          "coordinates": {{"lat": 35.0, "lng": 135.7}},
          "estimated_cost": 25.0,
          "currency": "{req.currency}",
          "insider_tip": "Practical local secret tip",
          "duration_mins": 90,
          "is_booked": false
        }}
      ]
    }}
  ],
  "cost_breakdown": {{
    "accommodations": 300.0,
    "activities_and_tickets": 150.0,
    "food_and_dining": 200.0,
    "local_transit": 60.0,
    "contingency": 50.0,
    "total_estimated": 760.0,
    "currency": "{req.currency}"
  }},
  "packing_list": ["Item 1", "Item 2", "Item 3", "Item 4"],
  "local_tips": ["Tip 1", "Tip 2", "Tip 3"],
  "weather_forecast_note": "Expected climate & wardrobe advice"
}}
"""
    # Try Gemini if key exists
    from config import reload_config
    reload_config()
    import config

    if config.GEMINI_API_KEY:
        for model_name in ["gemini-2.5-flash", "gemini-1.5-flash"]:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={config.GEMINI_API_KEY}"
                async with httpx.AsyncClient(timeout=35.0) as client:
                    resp = await client.post(
                        url,
                        json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"response_mime_type": "application/json"}}
                    )
                    if resp.status_code == 200:
                        raw_text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
                        data = json.loads(raw_text)
                        data["id"] = f"trip_{uuid.uuid4().hex[:10]}"
                        data["created_at"] = datetime.utcnow().isoformat() + "Z"
                        data["updated_at"] = data["created_at"]
                        data["share_slug"] = uuid.uuid4().hex[:8]
                        return TripItinerary(**data)
            except Exception as e:
                logger.warning(f"Gemini {model_name} generation failed: {e}. Trying next or falling back.")


    # Try OpenAI if key exists
    if OPENAI_API_KEY:
        try:
            url = "https://api.openai.com/v1/chat/completions"
            headers = {"Authorization": f"Bearer {OPENAI_API_KEY}", "Content-Type": "application/json"}
            payload = {
                "model": "gpt-4o-mini",
                "messages": [{"role": "system", "content": "You output strictly valid JSON."}, {"role": "user", "content": prompt}],
                "response_format": {"type": "json_object"}
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(url, headers=headers, json=payload)
                if resp.status_code == 200:
                    data = json.loads(resp.json()["choices"][0]["message"]["content"])
                    data["id"] = f"trip_{uuid.uuid4().hex[:10]}"
                    data["created_at"] = datetime.utcnow().isoformat() + "Z"
                    data["updated_at"] = data["created_at"]
                    data["share_slug"] = uuid.uuid4().hex[:8]
                    return TripItinerary(**data)
        except Exception as e:
            logger.warning(f"OpenAI generation failed: {e}. Falling back to knowledge engine.")

    return None

def generate_itinerary(req: TripRequest) -> TripItinerary:
    """Generates an intelligent, tailored day-by-day travel plan."""
    multiplier = _calculate_budget_multiplier(req.budget_tier)
    matched = _get_matched_template(req.destination)

    # Base date math
    try:
        start_dt = datetime.strptime(req.start_date, "%Y-%m-%d")
    except Exception:
        start_dt = datetime.utcnow() + timedelta(days=7)

    days_list: List[DayPlan] = []
    total_activities_cost = 0.0

    if matched:
        highlights_pool = list(matched["highlights"])
        random.seed(req.destination + str(req.duration_days) + req.travel_style)
        random.shuffle(highlights_pool)
        
        city_name = matched["city"]
        coords = matched["coords"]
        hero_keyword = matched["hero_keyword"]
        hero_gradient = matched["hero_gradient"]
        tagline = matched["tagline"]
        transit_advice = matched["transit_tip"]
        packing_list = list(matched["packing"])
    else:
        city_name = req.destination
        coords = {"lat": 40.7128, "lng": -74.0060}
        hero_keyword = f"{req.destination} travel"
        hero_gradient = "linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)"
        tagline = f"Tailored Exploration of {req.destination} for {req.traveler_type.title()} Travelers"
        transit_advice = f"Utilize regional public transit passes and rideshare apps for economical navigation around {req.destination}."
        packing_list = ["Universal plug adapter", "Comfortable walking shoes", "Light weather-appropriate layers", "Portable power bank"]

    # Build Day Plans
    for day_i in range(1, req.duration_days + 1):
        cur_date = (start_dt + timedelta(days=day_i - 1)).strftime("%Y-%m-%d")
        day_activities: List[ActivityItem] = []

        if matched and len(matched["highlights"]) >= 3:
            # Pick 3 or 4 activities per day based on travel style
            acts_count = 3 if req.travel_style in ["relaxed", "romantic"] else 4
            selected_items = [
                matched["highlights"][(i + (day_i - 1) * acts_count) % len(matched["highlights"])]
                for i in range(acts_count)
            ]

            time_slots = [
                ("09:00 AM - 11:30 AM", "morning"),
                ("12:00 PM - 02:00 PM", "afternoon"),
                ("02:45 PM - 05:30 PM", "afternoon"),
                ("07:00 PM - 09:30 PM", "evening")
            ]

            day_cost = 0.0
            for idx, item in enumerate(selected_items):
                slot_time, period = time_slots[idx % len(time_slots)]
                act_cost = round(item["cost"] * multiplier, 1)
                day_cost += act_cost
                total_activities_cost += act_cost

                day_activities.append(ActivityItem(
                    id=f"act-{day_i}-{idx+1}-{uuid.uuid4().hex[:4]}",
                    time_slot=slot_time,
                    period=period,
                    title=item["title"],
                    category=item["category"],
                    description=f"{item['title']} in {city_name}. Tailored for {req.traveler_type} travelers seeking a {req.travel_style} rhythm.",
                    location_name=f"{item['title'].split(' at ')[0]}, {city_name}",
                    coordinates={"lat": item["lat"], "lng": item["lng"]},
                    estimated_cost=act_cost,
                    currency=req.currency,
                    insider_tip=item["tip"],
                    duration_mins=90 if "dinner" in item["title"].lower() or "lunch" in item["title"].lower() else 120,
                    is_booked=False
                ))
            
            day_theme = f"Day {day_i}: " + ("Arrival & Iconic Highlights" if day_i == 1 else "Immersion & Hidden Flavors" if day_i == 2 else "Adventure & Scenic Horizons")
        else:
            day_activities = _generate_synthetic_activities_for_destination(
                req.destination, day_i, cur_date, req.interests, req.travel_style, req.traveler_type, multiplier, req.currency
            )
            day_cost = sum(a.estimated_cost for a in day_activities)
            total_activities_cost += day_cost
            day_theme = f"Day {day_i}: Cultural Landmarks & Local Immersion"

        days_list.append(DayPlan(
            day_number=day_i,
            date=cur_date,
            theme=day_theme,
            summary=f"Optimized schedule balancing {req.travel_style} pacing with curated dining, sightseeing, and minimal transit friction.",
            activities=day_activities,
            day_budget_estimate=round(day_cost, 2),
            transit_advice=transit_advice
        ))

    # Calculate realistic full trip cost breakdown
    base_hotel_night = 80.0 if req.budget_tier == "budget" else (350.0 if req.budget_tier == "luxury" else 160.0)
    # Adjust for traveler type / group size
    if req.traveler_type == "group":
        hotel_total = round(base_hotel_night * req.duration_days * math.ceil(req.group_size / 2.0), 2)
    elif req.traveler_type == "couple":
        hotel_total = round(base_hotel_night * req.duration_days * 1.1, 2)
    else:
        hotel_total = round(base_hotel_night * req.duration_days, 2)

    food_per_day = 30.0 if req.budget_tier == "budget" else (120.0 if req.budget_tier == "luxury" else 65.0)
    food_total = round(food_per_day * req.duration_days * max(1, req.group_size), 2)
    transit_total = round(18.0 * req.duration_days * max(1, req.group_size) * multiplier, 2)
    contingency = round((hotel_total + food_total + total_activities_cost) * 0.08, 2)
    total_est = round(hotel_total + food_total + total_activities_cost + transit_total + contingency, 2)

    cost_breakdown = TripCostBreakdown(
        accommodations=hotel_total,
        activities_and_tickets=round(total_activities_cost * max(1, req.group_size), 2),
        food_and_dining=food_total,
        local_transit=transit_total,
        contingency=contingency,
        total_estimated=total_est,
        currency=req.currency
    )

    # Contextual overview narrative matching the user's scenarios
    if req.traveler_type == "solo":
        overview = f"A high-efficiency, stress-free solo getaway to {req.destination}. Thoughtfully structured with fast routes, walkability, nearby highlights, and budget-friendly foodie gems so you can immerse yourself without the headache of cross-checking multiple apps."
    elif req.traveler_type == "couple":
        overview = f"A romantic, tailored escape to {req.destination} focusing on scenic viewpoints, intimate dining, relaxed pacing, and unforgettable shared experiences away from cookie-cutter tourist crowds."
    elif req.traveler_type == "group":
        overview = f"A synchronized group expedition to {req.destination} for {req.group_size} travelers. Blends high-energy adventure with cultural landmarks and organized group logistics to eliminate scheduling conflicts and minimize delays."
    else:
        overview = f"A bespoke {req.duration_days}-day travel itinerary for {req.destination}, balancing highlights, culinary delights, and localized logistics."

    local_tips = [
        f"Early mornings (before 09:30 AM) offer peaceful sightseeing with optimal photographic lighting.",
        f"Keep digital offline map downloads handy to navigate alleys effortlessly.",
        f"Tipping and dining customs: Check whether service charge (coperto/service compris) is included on bills.",
        f"Pack comfortable walking shoes as the best hidden gems in {req.destination} are nestled along pedestrian-only walkways."
    ]

    title = f"{req.duration_days}-Day {req.travel_style.title()} Journey to {city_name}"

    itinerary = TripItinerary(
        id=f"trip_{uuid.uuid4().hex[:10]}",
        title=title,
        destination=city_name,
        tagline=tagline,
        overview=overview,
        hero_image_keyword=hero_keyword,
        hero_gradient=hero_gradient,
        traveler_type=req.traveler_type,
        group_size=req.group_size,
        travel_style=req.travel_style,
        budget_tier=req.budget_tier,
        start_date=req.start_date,
        end_date=req.end_date,
        duration_days=req.duration_days,
        currency=req.currency,
        days=days_list,
        cost_breakdown=cost_breakdown,
        packing_list=packing_list,
        local_tips=local_tips,
        weather_forecast_note=f"Mild to pleasant conditions expected in {req.destination}. Carry light breathable layers with an evening jacket.",
        created_at=datetime.utcnow().isoformat() + "Z",
        updated_at=datetime.utcnow().isoformat() + "Z",
        share_slug=uuid.uuid4().hex[:8]
    )

    return itinerary

def regenerate_single_day(req: RegenerateDayRequest) -> DayPlan:
    """Regenerates a single day with alternate activities or fresh pacing."""
    multiplier = _calculate_budget_multiplier(req.budget_tier)
    matched = _get_matched_template(req.destination)

    time_slots = [
        ("09:30 AM - 12:00 PM", "morning"),
        ("12:30 PM - 02:00 PM", "afternoon"),
        ("03:00 PM - 05:30 PM", "afternoon"),
        ("07:30 PM - 10:00 PM", "evening")
    ]

    new_activities: List[ActivityItem] = []
    
    if matched and len(matched["highlights"]) >= 4:
        # Shuffle with random offset to guarantee fresh picks
        pool = list(matched["highlights"])
        random.shuffle(pool)
        selected = pool[:4]
        
        day_cost = 0.0
        for idx, item in enumerate(selected):
            slot, period = time_slots[idx]
            cost = round(item["cost"] * multiplier, 1)
            day_cost += cost
            new_activities.append(ActivityItem(
                id=f"act-regen-{req.day_number}-{idx+1}-{uuid.uuid4().hex[:4]}",
                time_slot=slot,
                period=period,
                title=f"[Alternative] {item['title']}",
                category=item["category"],
                description=f"Freshly regenerated option: {item['title']} in {matched['city']}.",
                location_name=f"{item['title']}, {matched['city']}",
                coordinates={"lat": item["lat"], "lng": item["lng"]},
                estimated_cost=cost,
                currency="USD",
                insider_tip=item["tip"],
                duration_mins=90,
                is_booked=False
            ))
    else:
        new_activities = _generate_synthetic_activities_for_destination(
            req.destination, req.day_number + 7, req.date, req.interests, req.travel_style, req.traveler_type, multiplier, "USD"
        )
        day_cost = sum(a.estimated_cost for a in new_activities)

    return DayPlan(
        day_number=req.day_number,
        date=req.date,
        theme=f"Day {req.day_number}: Curated Alternative Exploration ({req.travel_style.title()})",
        summary=f"Newly regenerated itinerary for Day {req.day_number} focusing on fresh sights and optimized timing.",
        activities=new_activities,
        day_budget_estimate=round(day_cost, 2),
        transit_advice="Use city rideshare or central light rail for quick transitions."
    )
