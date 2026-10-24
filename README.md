# VoyageAI - Personalized AI Travel Itinerary Planner 🌍✈️

> A full-stack, AI-powered web application that automates travel planning with customized day-by-day itineraries, smart routes, budget tracking, and real-time destination intelligence.

Built with **React 19** frontend, **FastAPI** backend, **Google Gemini 2.5 Flash**, and **Supabase PostgreSQL** integration.

---

## 🎯 Target User Scenarios

| Scenario | Traveler Persona | Highlights & Optimization Strategy |
| :--- | :--- | :--- |
| **Scenario 1: Solo Weekend Getaway** | Solo Adventurer / Professional | Fast-paced budget schedule, crowd-free dawn visits (Fushimi Inari at 7:30 AM), Nishiki Market street food crawl, zero transit friction. |
| **Scenario 2: Romantic Vacation** | Couple / Honeymooners | Relaxed pacing, private sunset boat cruises along Faraglioni, Ravello cliffside marble terraces, 400-candlelit dining at *La Sponda*, 1-click single-day regeneration. |
| **Scenario 3: Small Group Multi-Day Trip** | Group of 5 Friends | Volcano sunrise trek, Ayung river white water rafting, Tirta Empul purification rituals, shared private van logistics, balanced group downtime. |

---

## ✨ Features

- 🧭 **Smart 4-Step Trip Builder**: Destination selector, party size counter, budget tiers (Budget $, Moderate $$, Luxury $$$), travel pacing, and custom dietary/accommodation preferences.
- 🗺️ **Interactive Leaflet Route Maps**: Geo-coordinate plotting with numbered waypoints and route polylines.
- 🔄 **Single-Day AI Regeneration**: Recalculate any single day's plan with alternate activities without affecting other days.
- ✏️ **Full Schedule Management**: Add, edit, reorder (move up/down), delete, or mark activities as booked.
- 💰 **Automated Cost Breakdown**: Dynamic budget tracker across lodging, dining, tickets, local transit, and contingency buffers.
- 🎒 **Smart Packing Checklist & Local Tips**: Weather forecast notes, clothing suggestions, and local etiquette tips.
- 🔗 **Sharing & Print/PDF Export**: Direct shareable links, formatted text summaries, and print/PDF support.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Leaflet, Lucide Icons, Canvas Confetti, Vanilla CSS Design System
- **Backend**: FastAPI, Uvicorn, Pydantic, HTTPX, Psycopg, Python-Dotenv
- **AI Engine**: Google Gemini 2.5 Flash API (`gemini-2.5-flash`) + Knowledge Fallback Engine
- **Database**: Supabase PostgreSQL (with automatic local JSON persistence fallback)

---

## 🐳 1-Command Docker Hosting

You can spin up the full production stack (FastAPI backend + Nginx-powered React frontend) with a single command:

```bash
docker compose up -d --build
```

- **Web Application**: Access at `http://localhost` (or `http://localhost:3000`)
- **FastAPI Backend**: Access at `http://localhost:8000/docs`
- To stop the containers: `docker compose down`

---

## 🚀 Local Development Setup (Without Docker)

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend will be live at `http://127.0.0.1:8000` (API docs at `http://127.0.0.1:8000/docs`).

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live at `http://127.0.0.1:5173`.


---

## 🔌 Supabase Database Schema

Run this in your **Supabase SQL Editor** to initialize the table:

```sql
CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    destination TEXT NOT NULL,
    tagline TEXT,
    overview TEXT,
    hero_image_keyword TEXT,
    hero_gradient TEXT,
    traveler_type TEXT DEFAULT 'solo',
    group_size INTEGER DEFAULT 1,
    travel_style TEXT DEFAULT 'balanced',
    budget_tier TEXT DEFAULT 'moderate',
    start_date TEXT,
    end_date TEXT,
    duration_days INTEGER DEFAULT 3,
    currency TEXT DEFAULT 'USD',
    days JSONB NOT NULL,
    cost_breakdown JSONB NOT NULL,
    packing_list JSONB DEFAULT '[]'::jsonb,
    local_tips JSONB DEFAULT '[]'::jsonb,
    weather_forecast_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    share_slug TEXT UNIQUE
);

ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public trips access" ON trips FOR ALL USING (true) WITH CHECK (true);
```

---

## 📄 License
MIT License.
