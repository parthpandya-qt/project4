import React, { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import DashboardView from "./components/DashboardView";
import TripBuilderWizard from "./components/TripBuilderWizard";
import ItineraryDetailView from "./components/ItineraryDetailView";
import ScenariosView from "./components/ScenariosView";
import SettingsModal from "./components/SettingsModal";
import ShareModal from "./components/ShareModal";
import ActivityModal from "./components/ActivityModal";

import { 
  fetchTrips, 
  fetchTemplates, 
  fetchConfigStatus, 
  deleteTrip, 
  updateTrip 
} from "./services/api";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, builder, detail, scenarios, saved
  const [trips, setTrips] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [supabaseStatus, setSupabaseStatus] = useState(null);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [shareTripData, setShareTripData] = useState(null);

  // Activity Edit/Add Modal
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [editingActivityData, setEditingActivityData] = useState(null);
  const [editingDayNumber, setEditingDayNumber] = useState(1);

  useEffect(() => {
    loadInitialData();

    // Check URL parameters for direct share link (e.g. ?trip=scenario-1-solo-kyoto)
    const params = new URLSearchParams(window.location.search);
    const tripParam = params.get("trip");
    if (tripParam) {
      handleOpenTripById(tripParam);
    }
  }, []);

  async function loadInitialData() {
    try {
      const [tripsData, templatesData, configData] = await Promise.all([
        fetchTrips().catch(() => []),
        fetchTemplates().catch(() => []),
        fetchConfigStatus().catch(() => null),
      ]);
      setTrips(tripsData);
      setTemplates(templatesData);
      if (configData?.storage) {
        setSupabaseStatus(configData.storage);
      }
    } catch (e) {
      console.error("Initialization error:", e);
    }
  }

  async function handleOpenTripById(id) {
    try {
      const allTrips = await fetchTrips();
      const match = allTrips.find((t) => t.id === id || t.share_slug === id);
      if (match) {
        setSelectedTrip(match);
        setActiveTab("detail");
      }
    } catch (e) {
      console.error(e);
    }
  }

  function handleSelectTrip(trip) {
    setSelectedTrip(trip);
    setActiveTab("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleLaunchTemplate(templateId) {
    const match = trips.find((t) => t.id === templateId);
    if (match) {
      setSelectedTrip(match);
      setActiveTab("detail");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Find template specs and switch to builder or trigger
      setActiveTab("builder");
    }
  }

  function handleItineraryGenerated(newTrip) {
    setTrips((prev) => [newTrip, ...prev.filter((t) => t.id !== newTrip.id)]);
    setSelectedTrip(newTrip);
    setActiveTab("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteTrip(tripId) {
    if (!window.confirm("Are you sure you want to delete this trip itinerary?")) return;
    try {
      await deleteTrip(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      if (selectedTrip?.id === tripId) {
        setSelectedTrip(null);
        setActiveTab("dashboard");
      }
    } catch (err) {
      alert("Failed to delete trip: " + err.message);
    }
  }

  function handleOpenShareModal(trip) {
    setShareTripData(trip || selectedTrip);
    setIsShareOpen(true);
  }

  function handleOpenAddActivity(dayNum) {
    setEditingActivityData(null);
    setEditingDayNumber(dayNum);
    setIsActivityModalOpen(true);
  }

  function handleOpenEditActivity(activity, dayNum) {
    setEditingActivityData(activity);
    setEditingDayNumber(dayNum);
    setIsActivityModalOpen(true);
  }

  async function handleSaveActivity(activityData) {
    if (!selectedTrip) return;

    const updatedDays = selectedTrip.days.map((day) => {
      if (day.day_number !== editingDayNumber) return day;

      let activities = [...(day.activities || [])];
      const existingIdx = activities.findIndex((a) => a.id === activityData.id);

      if (existingIdx >= 0) {
        activities[existingIdx] = activityData;
      } else {
        activities.push(activityData);
      }

      return { ...day, activities };
    });

    const updatedTrip = { ...selectedTrip, days: updatedDays };
    setSelectedTrip(updatedTrip);
    setTrips((prev) => prev.map((t) => (t.id === updatedTrip.id ? updatedTrip : t)));

    try {
      await updateTrip(updatedTrip.id, updatedTrip);
    } catch (err) {
      console.error("Failed to save activity to storage:", err);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Top Fixed Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        supabaseStatus={supabaseStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewTrip={() => {
          setActiveTab("builder");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Main Container Views */}
      <main className="container" style={{ flexGrow: 1 }}>
        {activeTab === "dashboard" && (
          <DashboardView
            trips={trips}
            templates={templates}
            onSelectTrip={handleSelectTrip}
            onLaunchTemplate={handleLaunchTemplate}
            onStartNewPlan={() => setActiveTab("builder")}
            onDeleteTrip={handleDeleteTrip}
            onOpenShare={handleOpenShareModal}
          />
        )}

        {activeTab === "builder" && (
          <TripBuilderWizard
            onItineraryGenerated={handleItineraryGenerated}
            onCancel={() => setActiveTab("dashboard")}
          />
        )}

        {activeTab === "detail" && selectedTrip && (
          <ItineraryDetailView
            trip={selectedTrip}
            onBack={() => setActiveTab("dashboard")}
            onOpenShare={handleOpenShareModal}
            onOpenAddActivity={handleOpenAddActivity}
            onOpenEditActivity={handleOpenEditActivity}
            onTripUpdated={(updated) => {
              setSelectedTrip(updated);
              setTrips((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            }}
          />
        )}

        {activeTab === "scenarios" && (
          <ScenariosView
            templates={templates}
            onLaunchScenario={handleLaunchTemplate}
          />
        )}

        {activeTab === "saved" && (
          <div style={{ padding: "36px 0 60px" }}>
            <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Saved Itineraries</h1>
            <p style={{ color: "var(--text-secondary)", marginBottom: "28px" }}>
              All trips stored in your database ({supabaseStatus?.mode === "supabase" ? "Supabase Cloud" : "Local Fast Storage"}).
            </p>
            <DashboardView
              trips={trips}
              templates={templates}
              onSelectTrip={handleSelectTrip}
              onLaunchTemplate={handleLaunchTemplate}
              onStartNewPlan={() => setActiveTab("builder")}
              onDeleteTrip={handleDeleteTrip}
              onOpenShare={handleOpenShareModal}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={(newStatus) => setSupabaseStatus(newStatus)}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trip={shareTripData}
      />

      <ActivityModal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        initialData={editingActivityData}
        dayNumber={editingDayNumber}
        onSave={handleSaveActivity}
      />

      {/* Modern SaaS Footer */}
      <footer style={{
        borderTop: "1px solid var(--border-subtle)",
        background: "rgba(9, 13, 22, 0.95)",
        padding: "30px 0",
        marginTop: "auto"
      }}>
        <div className="container" style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          fontSize: "0.85rem",
          color: "var(--text-muted)"
        }}>
          <div>
            <strong style={{ color: "var(--text-primary)" }}>VoyageAI Planner</strong> &bull; Personalized AI Travel Planning System
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <span className="badge badge-cyan" style={{ fontSize: "0.68rem" }}>React 19</span>
            <span className="badge badge-purple" style={{ fontSize: "0.68rem" }}>FastAPI Backend</span>
            <span className="badge badge-emerald" style={{ fontSize: "0.68rem" }}>
              {supabaseStatus?.connected ? "Supabase Live" : "Supabase Ready"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
