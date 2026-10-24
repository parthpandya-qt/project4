import React, { useState } from "react";
import confetti from "canvas-confetti";
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  User, 
  Users, 
  Heart, 
  Compass, 
  DollarSign, 
  Tag, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Loader2,
  Utensils,
  Hotel
} from "lucide-react";
import { generateItinerary } from "../services/api";

const POPULAR_DESTINATIONS = [
  "Kyoto, Japan",
  "Amalfi Coast, Italy",
  "Bali, Indonesia",
  "Paris, France",
  "Interlaken, Swiss Alps",
  "Rome, Italy",
  "Tokyo, Japan",
  "Barcelona, Spain"
];

const INTEREST_OPTIONS = [
  "Sightseeing",
  "Food & Dining",
  "Hidden Gems",
  "Culture & History",
  "Nature & Outdoors",
  "Adventure & Sports",
  "Nightlife & Bars",
  "Photography",
  "Relaxation & Spa",
  "Local Markets"
];

const DIETARY_OPTIONS = [
  "No restrictions",
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten-Free",
  "Pescatarian"
];

export default function TripBuilderWizard({ onItineraryGenerated, onCancel }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatusText, setLoadingStatusText] = useState("Initializing AI synthesis...");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    destination: "Kyoto, Japan",
    start_date: "2026-11-10",
    end_date: "2026-11-13",
    duration_days: 3,
    traveler_type: "solo",
    group_size: 1,
    travel_style: "balanced",
    budget_tier: "moderate",
    currency: "USD",
    interests: ["Sightseeing", "Food & Dining", "Hidden Gems"],
    dietary_preferences: ["No restrictions"],
    accommodation_type: "boutique hotel",
    pace_preference: "balanced",
    custom_notes: "",
  });

  function handleDateChange(field, val) {
    const updated = { ...formData, [field]: val };
    try {
      const d1 = new Date(field === "start_date" ? val : formData.start_date);
      const d2 = new Date(field === "end_date" ? val : formData.end_date);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      updated.duration_days = diffDays;
    } catch (e) {}
    setFormData(updated);
  }

  function handleTravelerTypeChange(type) {
    let size = 1;
    if (type === "couple") size = 2;
    if (type === "group") size = 4;
    setFormData({ ...formData, traveler_type: type, group_size: size });
  }

  function toggleInterest(interest) {
    const exists = formData.interests.includes(interest);
    if (exists) {
      setFormData({
        ...formData,
        interests: formData.interests.filter((i) => i !== interest),
      });
    } else {
      setFormData({
        ...formData,
        interests: [...formData.interests, interest],
      });
    }
  }

  function toggleDietary(diet) {
    if (diet === "No restrictions") {
      setFormData({ ...formData, dietary_preferences: ["No restrictions"] });
      return;
    }
    let current = formData.dietary_preferences.filter((d) => d !== "No restrictions");
    if (current.includes(diet)) {
      current = current.filter((d) => d !== diet);
      if (current.length === 0) current = ["No restrictions"];
    } else {
      current.push(diet);
    }
    setFormData({ ...formData, dietary_preferences: current });
  }

  async function handleGenerate() {
    setLoading(true);
    setErrorMsg("");
    setLoadingProgress(15);
    setLoadingStatusText("Geocoding destination and route corridors...");

    const progressTimer1 = setTimeout(() => {
      setLoadingProgress(45);
      setLoadingStatusText("Analyzing top culinary gems and local attractions...");
    }, 600);

    const progressTimer2 = setTimeout(() => {
      setLoadingProgress(75);
      setLoadingStatusText("Balancing day-by-day pacing and budget estimates...");
    }, 1200);

    try {
      const result = await generateItinerary(formData);
      setLoadingProgress(100);
      setLoadingStatusText("Itinerary generated successfully!");

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setTimeout(() => {
        setLoading(false);
        onItineraryGenerated(result);
      }, 500);

    } catch (err) {
      clearTimeout(progressTimer1);
      clearTimeout(progressTimer2);
      setErrorMsg("Generation failed: " + err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "30px 0 60px", maxWidth: "860px", margin: "0 auto" }}>
      {/* Wizard Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span className="badge badge-cyan">
            <Sparkles size={13} /> Smart Trip Builder
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Step {currentStep} of 4
          </span>
        </div>
        <h1 style={{ fontSize: "2.3rem", fontWeight: "800" }}>
          Design Your Tailored Itinerary
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", maxWidth: "560px", margin: "8px auto 0" }}>
          Provide your destination and preferences. Our AI will structure your perfect day-by-day adventure.
        </p>
      </div>

      {/* Progress Steps Indicators */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "36px",
      }}>
        {[
          { num: 1, label: "Destination & Dates" },
          { num: 2, label: "Travelers & Budget" },
          { num: 3, label: "Style & Interests" },
          { num: 4, label: "Preferences & Review" }
        ].map((step) => (
          <div 
            key={step.num}
            onClick={() => !loading && setCurrentStep(step.num)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              opacity: currentStep === step.num ? 1 : 0.6,
              transition: "all 0.2s ease"
            }}
          >
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              background: currentStep >= step.num ? "var(--grad-primary)" : "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
              fontSize: "0.8rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {step.num}
            </div>
            <span style={{ fontSize: "0.82rem", fontWeight: currentStep === step.num ? "700" : "500", color: currentStep === step.num ? "#ffffff" : "var(--text-muted)" }}>
              {step.label}
            </span>
            {step.num < 4 && (
              <span style={{ color: "rgba(255, 255, 255, 0.15)", marginLeft: "4px" }}>&bull;</span>
            )}
          </div>
        ))}
      </div>

      {/* Wizard Content Card */}
      <div className="glass-panel" style={{ padding: "36px", position: "relative" }}>
        
        {/* Loading Overlay */}
        {loading && (
          <div style={{
            position: "absolute",
            inset: 0,
            background: "rgba(9, 13, 22, 0.92)",
            backdropFilter: "blur(8px)",
            borderRadius: "var(--radius-lg)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "24px",
          }}>
            <div style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "var(--grad-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "20px",
              boxShadow: "0 0 30px rgba(6, 182, 212, 0.5)",
              animation: "spin 2s linear infinite"
            }}>
              <Compass size={30} color="#ffffff" />
            </div>

            <h3 style={{ fontSize: "1.3rem", fontWeight: "700", marginBottom: "8px" }}>
              Synthesizing Your Itinerary...
            </h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: "20px" }}>
              {loadingStatusText}
            </p>

            {/* Progress bar */}
            <div style={{ width: "280px", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "999px", overflow: "hidden" }}>
              <div style={{
                width: `${loadingProgress}%`,
                height: "100%",
                background: "var(--grad-primary)",
                transition: "width 0.4s ease"
              }} />
            </div>
          </div>
        )}

        {/* STEP 1: Destination & Dates */}
        {currentStep === 1 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "6px" }}>Where and when are you traveling?</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
              Enter any city or region worldwide. You can also pick from popular curated hubs.
            </p>

            <div className="form-group">
              <label className="form-label">Destination</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Kyoto, Japan or Amalfi Coast, Italy"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                  style={{ paddingLeft: "38px" }}
                />
                <MapPin size={18} color="var(--accent-cyan)" style={{ position: "absolute", left: "12px", top: "14px" }} />
              </div>
            </div>

            {/* Quick destination chips */}
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "8px" }}>
                POPULAR QUICK DESTINATIONS:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {POPULAR_DESTINATIONS.map((dest) => (
                  <button
                    key={dest}
                    type="button"
                    onClick={() => setFormData({ ...formData, destination: dest })}
                    className={`btn btn-sm ${formData.destination === dest ? "btn-primary" : "btn-secondary"}`}
                    style={{ fontSize: "0.78rem" }}
                  >
                    {dest}
                  </button>
                ))}
              </div>
            </div>

            {/* Dates Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.start_date}
                  onChange={(e) => handleDateChange("start_date", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.end_date}
                  onChange={(e) => handleDateChange("end_date", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  className="form-input"
                  value={formData.duration_days}
                  onChange={(e) => setFormData({ ...formData, duration_days: Math.max(1, parseInt(e.target.value) || 1) })}
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Travelers & Budget */}
        {currentStep === 2 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "6px" }}>Who is traveling and what is the budget?</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
              We tailor pacing, dining reservations, and logistics to match your travel party.
            </p>

            <div className="form-group">
              <label className="form-label">Traveler Persona</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                {[
                  { id: "solo", title: "Solo Traveler", desc: "Nimble, food & sights, zero waiting", icon: User },
                  { id: "couple", title: "Romantic Couple", desc: "Scenic vistas, candlelit dining, relaxed pacing", icon: Heart },
                  { id: "group", title: "Small Group / Friends", desc: "Shared logistics, adventure, group activities", icon: Users }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.traveler_type === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleTravelerTypeChange(item.id)}
                      style={{
                        padding: "16px",
                        borderRadius: "var(--radius-md)",
                        background: isSelected ? "rgba(6, 182, 212, 0.12)" : "var(--bg-input)",
                        border: `1px solid ${isSelected ? "var(--accent-cyan)" : "var(--border-subtle)"}`,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <Icon size={18} color={isSelected ? "var(--accent-cyan)" : "var(--text-muted)"} />
                        <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>{item.title}</span>
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Group Size input if group */}
            {formData.traveler_type === "group" && (
              <div className="form-group" style={{ maxWidth: "260px" }}>
                <label className="form-label">Total Group Size</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    className="form-input"
                    value={formData.group_size}
                    onChange={(e) => setFormData({ ...formData, group_size: Math.max(2, parseInt(e.target.value) || 2) })}
                  />
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>travelers</span>
                </div>
              </div>
            )}

            {/* Budget Tier */}
            <div className="form-group" style={{ marginTop: "20px" }}>
              <label className="form-label">Budget Tier</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
                {[
                  { id: "budget", title: "Budget ($)", desc: "Hostels / Airbnbs, street food, public transit" },
                  { id: "moderate", title: "Moderate ($$)", desc: "Boutique hotels, popular bistros, guided visits" },
                  { id: "luxury", title: "Luxury ($$$)", desc: "5-star resorts, private boat charters, fine dining" },
                ].map((b) => {
                  const isSelected = formData.budget_tier === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => setFormData({ ...formData, budget_tier: b.id })}
                      style={{
                        padding: "16px",
                        borderRadius: "var(--radius-md)",
                        background: isSelected ? "rgba(139, 92, 246, 0.12)" : "var(--bg-input)",
                        border: `1px solid ${isSelected ? "var(--accent-purple)" : "var(--border-subtle)"}`,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ fontWeight: "700", fontSize: "0.95rem", marginBottom: "4px", color: isSelected ? "#c084fc" : "#ffffff" }}>
                        {b.title}
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                        {b.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Style & Interests */}
        {currentStep === 3 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "6px" }}>Travel Style & Desired Interests</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
              Choose your pacing and select the activities that excite you most.
            </p>

            <div className="form-group">
              <label className="form-label">Travel Pacing</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px" }}>
                {[
                  { id: "relaxed", label: "Relaxed", sub: "Slow mornings, 2-3 sights" },
                  { id: "balanced", label: "Balanced", sub: "Steady pace, 3-4 sights" },
                  { id: "fast-paced", label: "Fast-Paced", sub: "Pack every hour" },
                  { id: "romantic", label: "Romantic", sub: "Scenic & intimate" },
                  { id: "adventure", label: "Adventure", sub: "Active & outdoors" }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, travel_style: p.id })}
                    className={`btn ${formData.travel_style === p.id ? "btn-primary" : "btn-secondary"}`}
                    style={{ flexDirection: "column", padding: "10px", height: "auto" }}
                  >
                    <span style={{ fontSize: "0.9rem" }}>{p.label}</span>
                    <span style={{ fontSize: "0.7rem", opacity: 0.8, fontWeight: "normal" }}>{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: "24px" }}>
              <label className="form-label">Interests (Choose any that apply)</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {INTEREST_OPTIONS.map((interest) => {
                  const isSelected = formData.interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      style={{
                        padding: "8px 14px",
                        borderRadius: "9999px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        border: `1px solid ${isSelected ? "var(--accent-cyan)" : "var(--border-subtle)"}`,
                        background: isSelected ? "rgba(6, 182, 212, 0.18)" : "var(--bg-input)",
                        color: isSelected ? "#38bdf8" : "var(--text-secondary)",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {isSelected && <Check size={14} />}
                      <span>{interest}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Preferences & Review */}
        {currentStep === 4 && (
          <div>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "6px" }}>Final Touches & Synthesis Review</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "24px" }}>
              Specify dietary needs, lodging style, and custom notes before generating.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Utensils size={14} color="var(--accent-amber)" />
                  <span>Dietary Preferences</span>
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {DIETARY_OPTIONS.map((diet) => {
                    const isSelected = formData.dietary_preferences.includes(diet);
                    return (
                      <button
                        key={diet}
                        type="button"
                        onClick={() => toggleDietary(diet)}
                        className={`btn btn-sm ${isSelected ? "btn-primary" : "btn-secondary"}`}
                        style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                      >
                        {diet}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <Hotel size={14} color="var(--accent-purple)" />
                  <span>Accommodation Style</span>
                </label>
                <select
                  className="form-select"
                  value={formData.accommodation_type}
                  onChange={(e) => setFormData({ ...formData, accommodation_type: e.target.value })}
                >
                  <option value="boutique hotel">Boutique Hotel</option>
                  <option value="luxury resort">Luxury Resort / 5-Star Hotel</option>
                  <option value="budget hostel/inn">Budget Inn / Modern Hostel</option>
                  <option value="private villa">Private Villa / Airbnb</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Custom Requests or Notes (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Please include an early morning coffee spot with scenic canal views, and avoid long strenuous mountain stair climbs."
                value={formData.custom_notes}
                onChange={(e) => setFormData({ ...formData, custom_notes: e.target.value })}
              />
            </div>

            {/* Summary card */}
            <div style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "16px 20px",
              marginTop: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  READY TO SYNTHESIZE
                </div>
                <div style={{ fontWeight: "700", fontSize: "1.05rem", color: "#f8fafc" }}>
                  {formData.duration_days} Days in {formData.destination}
                </div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                  {formData.traveler_type.toUpperCase()} ({formData.group_size} travelers) &bull; {formData.budget_tier} budget &bull; {formData.travel_style} pace
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="badge badge-emerald">Ready</span>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{ color: "var(--accent-rose)", fontSize: "0.85rem", marginTop: "16px" }}>
            {errorMsg}
          </div>
        )}

        {/* Wizard Footer Navigation */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "32px",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "20px"
        }}>
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          ) : (
            <button type="button" onClick={onCancel} className="btn btn-ghost">
              Cancel
            </button>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="btn btn-primary"
            >
              <span>Continue</span>
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleGenerate}
              className="btn btn-primary btn-lg"
              style={{ boxShadow: "0 0 25px rgba(6, 182, 212, 0.4)" }}
            >
              <Sparkles size={18} />
              <span>Generate Personalized Itinerary</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
