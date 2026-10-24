import json
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime
from config import SUPABASE_URL, SUPABASE_KEY, DATABASE_URL, is_supabase_configured, reload_config

logger = logging.getLogger("supabase_service")

LOCAL_DB_FILE = Path(__file__).resolve().parent / "trips_data.json"

SUPABASE_SQL_SCHEMA = """-- Personalized Travel Planner Schema
-- Run this in Supabase SQL Editor if you are creating a new project

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

-- Enable Row Level Security (RLS)
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Allow public read & write for this demo (or configure auth rules)
CREATE POLICY "Public trips access" ON trips
    FOR ALL
    USING (true)
    WITH CHECK (true);
"""

class StorageService:
    def __init__(self):
        self._supabase_client = None
        self._pg_conn = None
        self._init_local_db()
        self._init_clients()

    def _init_local_db(self):
        if not LOCAL_DB_FILE.exists():
            with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
                json.dump([], f, indent=2)

    def _init_clients(self):
        reload_config()
        self._supabase_client = None

        if SUPABASE_URL and SUPABASE_KEY:
            try:
                from supabase import create_client
                self._supabase_client = create_client(SUPABASE_URL, SUPABASE_KEY)
                logger.info("Supabase client initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Supabase client: {e}")
                self._supabase_client = None

    def refresh_client(self):
        self._init_clients()

    def sync_local_trips_to_supabase(self):
        """Automatically pushes existing trips to Supabase once the table is ready."""
        if not self._supabase_client:
            return
        try:
            local_trips = self._read_local_trips()
            if local_trips:
                for trip in local_trips:
                    self._supabase_client.table("trips").upsert(trip).execute()
                logger.info(f"Synchronized {len(local_trips)} trips to Supabase cloud.")
        except Exception as e:
            logger.debug(f"Sync check: {e}")

    def get_status(self) -> Dict[str, Any]:
        self.refresh_client()
        
        # Test Supabase SDK client if configured
        if self._supabase_client:
            try:
                res = self._supabase_client.table("trips").select("id").limit(1).execute()
                # Table exists! Auto-sync initial trips
                self.sync_local_trips_to_supabase()
                return {
                    "mode": "supabase",
                    "connected": True,
                    "url": SUPABASE_URL,
                    "message": "Connected to Supabase PostgreSQL cloud! Table 'trips' is live and synced."
                }
            except Exception as e:
                err_str = str(e)
                if "schema cache" in err_str or "PGRST205" in err_str or "Could not find the table" in err_str:
                    return {
                        "mode": "supabase_key_verified",
                        "connected": False,
                        "url": SUPABASE_URL,
                        "table_needed": True,
                        "message": "Supabase Secret Key is VERIFIED and connected! Just run the SQL schema in your Supabase SQL Editor to finish creating the 'trips' table."
                    }
                return {
                    "mode": "supabase",
                    "connected": False,
                    "url": SUPABASE_URL,
                    "message": f"Supabase API error: {err_str}."
                }

        # If project URL is set but key is waiting
        if SUPABASE_URL:
            return {
                "mode": "supabase_ready",
                "connected": False,
                "url": SUPABASE_URL,
                "message": f"Supabase project registered ({SUPABASE_URL}). Provide your anon/service key to activate direct live sync!"
            }

        return {
            "mode": "local_fallback",
            "connected": False,
            "url": None,
            "message": "Supabase credentials not yet entered. Operating with local fast JSON storage."
        }

    def _read_local_trips(self) -> List[Dict[str, Any]]:
        try:
            if LOCAL_DB_FILE.exists():
                with open(LOCAL_DB_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
        except Exception as e:
            logger.error(f"Error reading local trips: {e}")
        return []

    def _write_local_trips(self, trips: List[Dict[str, Any]]):
        try:
            with open(LOCAL_DB_FILE, "w", encoding="utf-8") as f:
                json.dump(trips, f, indent=2, ensure_ascii=False)
        except Exception as e:
            logger.error(f"Error saving local trips: {e}")

    def list_trips(self) -> List[Dict[str, Any]]:
        self.refresh_client()
        if self._supabase_client:
            try:
                response = self._supabase_client.table("trips").select("*").order("created_at", desc=True).execute()
                if response.data is not None and len(response.data) > 0:
                    return response.data
            except Exception as e:
                logger.warning(f"Supabase list failed, reading local fallback: {e}")

        trips = self._read_local_trips()
        trips.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return trips

    def get_trip(self, trip_id: str) -> Optional[Dict[str, Any]]:
        self.refresh_client()
        if self._supabase_client:
            try:
                response = self._supabase_client.table("trips").select("*").eq("id", trip_id).execute()
                if response.data and len(response.data) > 0:
                    return response.data[0]
            except Exception as e:
                logger.warning(f"Supabase get failed: {e}")

        trips = self._read_local_trips()
        for t in trips:
            if t.get("id") == trip_id or t.get("share_slug") == trip_id:
                return t
        return None

    def save_trip(self, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        self.refresh_client()
        now_iso = datetime.utcnow().isoformat() + "Z"
        if "created_at" not in trip_data or not trip_data["created_at"]:
            trip_data["created_at"] = now_iso
        trip_data["updated_at"] = now_iso

        # Always save to local backup
        local_trips = self._read_local_trips()
        idx = next((i for i, t in enumerate(local_trips) if t.get("id") == trip_data.get("id")), -1)
        if idx >= 0:
            local_trips[idx] = trip_data
        else:
            local_trips.insert(0, trip_data)
        self._write_local_trips(local_trips)

        # Upsert into Supabase table if client is live
        if self._supabase_client:
            try:
                self._supabase_client.table("trips").upsert(trip_data).execute()
            except Exception as e:
                logger.error(f"Failed to upsert trip into Supabase: {e}")

        return trip_data

    def delete_trip(self, trip_id: str) -> bool:
        self.refresh_client()
        deleted = False
        local_trips = self._read_local_trips()
        filtered = [t for t in local_trips if t.get("id") != trip_id]
        if len(filtered) != len(local_trips):
            self._write_local_trips(filtered)
            deleted = True

        if self._supabase_client:
            try:
                self._supabase_client.table("trips").delete().eq("id", trip_id).execute()
                deleted = True
            except Exception as e:
                logger.warning(f"Supabase delete failed: {e}")

        return deleted

storage = StorageService()
