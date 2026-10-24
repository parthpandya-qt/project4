import React, { useState } from "react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  Sparkles, 
  RefreshCw, 
  PlusCircle, 
  Share2, 
  Printer, 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  Edit3, 
  Trash2, 
  Lightbulb, 
  Clock, 
  Compass, 
  Tag, 
  Briefcase, 
  ShieldCheck, 
  CloudSun,
  Map,
  PieChart
} from "lucide-react";
import InteractiveMap from "./InteractiveMap";
import { regenerateDay, updateTrip } from "../services/api";

export default function ItineraryDetailView({ 
  trip, 
  onBack, 
  onOpenShare, 
  onOpenEditActivity, 
  onOpenAddActivity, 
  onTripUpdated 
}) {
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [isRegeneratingDay, setIsRegeneratingDay] = useState(false);
  const [saveStatusText, setSaveStatusText] = useState("");
  const [checkedItems, setCheckedItems] = useState({});

  if (!trip || !trip.days) return null;

  const currentDay = trip.days.find((d) => d.day_number === selectedDayNumber) || trip.days[0];

  async function handleRegenerateCurrentDay() {
    setIsRegeneratingDay(true);
    setSaveStatusText("");
    try {
      const regeneratedDayPlan = await regenerateDay({
        trip_id: trip.id,
        day_number: selectedDayNumber,
        destination: trip.destination,
        date: currentDay?.date || trip.start_date,
        travel_style: trip.travel_style,
        traveler_type: trip.traveler_type,
        budget_tier: trip.budget_tier,
        interests: [],
      });

      // Update local trip state
      const updatedDays = trip.days.map((d) => 
        d.day_number === selectedDayNumber ? regeneratedDayPlan : d
      );

      const updatedTrip = { ...trip, days: updatedDays };
      await updateTrip(trip.id, updatedTrip);
      if (onTripUpdated) onTripUpdated(updatedTrip);

      setSaveStatusText(`Day ${selectedDayNumber} regenerated and saved!`);
      setTimeout(() => setSaveStatusText(""), 3500);
    } catch (err) {
      alert("Failed to regenerate day: " + err.message);
    } finally {
      setIsRegeneratingDay(false);
    }
  }

  function handleToggleActivityBooked(activityId) {
    const updatedDays = trip.days.map((day) => {
      if (day.day_number !== selectedDayNumber) return day;
      const updatedActs = day.activities.map((act) => {
        if (act.id === activityId) {
          return { ...act, is_booked: !act.is_booked };
        }
        return act;
      });
      return { ...day, activities: updatedActs };
    });

    const updatedTrip = { ...trip, days: updatedDays };
    updateTrip(trip.id, updatedTrip);
    if (onTripUpdated) onTripUpdated(updatedTrip);
  }

  function handleDeleteActivity(activityId) {
    const updatedDays = trip.days.map((day) => {
      if (day.day_number !== selectedDayNumber) return day;
      return {
        ...day,
        activities: day.activities.filter((a) => a.id !== activityId),
      };
    });

    const updatedTrip = { ...trip, days: updatedDays };
    updateTrip(trip.id, updatedTrip);
    if (onTripUpdated) onTripUpdated(updatedTrip);
  }

  function handleMoveActivity(index, direction) {
    const activities = [...(currentDay.activities || [])];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= activities.length) return;

    const temp = activities[index];
    activities[index] = activities[targetIndex];
    activities[targetIndex] = temp;

    const updatedDays = trip.days.map((day) => {
      if (day.day_number !== selectedDayNumber) return day;
      return { ...day, activities };
    });

    const updatedTrip = { ...trip, days: updatedDays };
    updateTrip(trip.id, updatedTrip);
    if (onTripUpdated) onTripUpdated(updatedTrip);
  }

  function togglePackingCheck(item) {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  }

  function getCategoryColor(cat) {
    switch (cat?.toLowerCase()) {
      case "dining": return { bg: "rgba(245, 158, 11, 0.15)", text: "#fbbf24", border: "rgba(245, 158, 11, 0.3)" };
      case "culture": return { bg: "rgba(139, 92, 246, 0.15)", text: "#c084fc", border: "rgba(139, 92, 246, 0.3)" };
      case "adventure": return { bg: "rgba(244, 63, 94, 0.15)", text: "#fb7185", border: "rgba(244, 63, 94, 0.3)" };
      case "nature": return { bg: "rgba(16, 185, 129, 0.15)", text: "#34d399", border: "rgba(16, 185, 129, 0.3)" };
      case "transit": return { bg: "rgba(59, 130, 246, 0.15)", text: "#60a5fa", border: "rgba(59, 130, 246, 0.3)" };
      default: return { bg: "rgba(6, 182, 212, 0.15)", text: "#22d3ee", border: "rgba(6, 182, 212, 0.3)" };
    }
  }

  return (
    <div style={{ padding: "28px 0 60px" }}>
      {/* Top Navigation Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </button>

        <div style={{ display: "flex", gap: "10px" }}>
          {saveStatusText && (
            <span style={{ color: "var(--accent-emerald)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "4px" }}>
              <CheckCircle2 size={16} /> {saveStatusText}
            </span>
          )}
          <button onClick={() => window.print()} className="btn btn-secondary btn-sm" title="Print itinerary or save to PDF">
            <Printer size={16} />
            <span>Print / PDF</span>
          </button>
          <button onClick={() => onOpenShare(trip)} className="btn btn-primary btn-sm">
            <Share2 size={16} />
            <span>Share Plan</span>
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="glass-panel" style={{
        padding: "36px",
        borderRadius: "var(--radius-xl)",
        marginBottom: "28px",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.12)",
      }}>
        {/* Ambient Gradient glow */}
        <div style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "320px",
          height: "320px",
          background: trip.hero_gradient || "radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)",
          filter: "blur(40px)",
          opacity: 0.4,
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: "850px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span className="badge badge-cyan" style={{ fontSize: "0.78rem" }}>
              <MapPin size={12} /> {trip.destination}
            </span>
            <span className="badge badge-purple" style={{ fontSize: "0.78rem" }}>
              <Users size={12} /> {trip.traveler_type?.toUpperCase()} ({trip.group_size} travelers)
            </span>
            <span className="badge badge-emerald" style={{ fontSize: "0.78rem" }}>
              <DollarSign size={12} /> {trip.budget_tier?.toUpperCase()} BUDGET
            </span>
            <span className="badge badge-amber" style={{ fontSize: "0.78rem" }}>
              <Compass size={12} /> {trip.travel_style?.toUpperCase()} PACING
            </span>
          </div>

          <h1 style={{ fontSize: "2.4rem", fontWeight: "800", marginBottom: "10px", lineHeight: 1.2 }}>
            {trip.title}
          </h1>

          <p style={{ fontSize: "1.05rem", color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: "20px" }}>
            {trip.tagline || trip.overview}
          </p>

          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-subtle)",
            fontSize: "0.88rem",
            color: "var(--text-secondary)"
          }}>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Dates: </span>
              <strong style={{ color: "var(--text-primary)" }}>{trip.start_date} &rarr; {trip.end_date}</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Total Duration: </span>
              <strong style={{ color: "var(--text-primary)" }}>{trip.duration_days} Days</strong>
            </div>
            <div>
              <span style={{ color: "var(--text-muted)" }}>Est. Total Cost: </span>
              <strong style={{ color: "#34d399", fontSize: "0.95rem" }}>${trip.cost_breakdown?.total_estimated || 0} USD</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Days Navigation & Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "24px", alignItems: "start" }}>
        
        {/* Left Column: Day Schedules & Map */}
        <div>
          {/* Day Tabs */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}>
            {trip.days.map((day) => {
              const isSelected = day.day_number === selectedDayNumber;
              return (
                <button
                  key={day.day_number}
                  onClick={() => setSelectedDayNumber(day.day_number)}
                  style={{
                    padding: "10px 18px",
                    borderRadius: "var(--radius-md)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: "700",
                    fontSize: "0.92rem",
                    border: `1px solid ${isSelected ? "var(--accent-cyan)" : "var(--border-subtle)"}`,
                    background: isSelected ? "var(--grad-primary)" : "var(--bg-card)",
                    color: isSelected ? "#ffffff" : "var(--text-secondary)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexShrink: 0,
                    transition: "all 0.2s ease"
                  }}
                >
                  <Calendar size={15} />
                  <span>Day {day.day_number}</span>
                </button>
              );
            })}
          </div>

          {/* Current Day Header & Controls */}
          {currentDay && (
            <div className="glass-panel" style={{ padding: "24px 28px", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", fontWeight: "700", textTransform: "uppercase" }}>
                    Day {currentDay.day_number} &bull; {currentDay.date}
                  </div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: "700", marginTop: "2px" }}>
                    {currentDay.theme}
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                    {currentDay.summary}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button 
                    onClick={() => onOpenAddActivity(currentDay.day_number)}
                    className="btn btn-secondary btn-sm"
                  >
                    <PlusCircle size={15} />
                    <span>Add Activity</span>
                  </button>

                  <button 
                    onClick={handleRegenerateCurrentDay}
                    disabled={isRegeneratingDay}
                    className="btn btn-primary btn-sm"
                    title="Regenerate Day with fresh AI recommendations"
                  >
                    <RefreshCw size={15} className={isRegeneratingDay ? "spin" : ""} />
                    <span>{isRegeneratingDay ? "Regenerating..." : "Regenerate Day"}</span>
                  </button>
                </div>
              </div>

              {/* Transit Advice Pill */}
              {currentDay.transit_advice && (
                <div style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "1px solid rgba(59, 130, 246, 0.25)",
                  borderRadius: "var(--radius-sm)",
                  padding: "10px 14px",
                  marginTop: "16px",
                  fontSize: "0.82rem",
                  color: "#93c5fd",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  <Compass size={16} color="#60a5fa" style={{ flexShrink: 0 }} />
                  <span><strong>Transit Tip:</strong> {currentDay.transit_advice}</span>
                </div>
              )}
            </div>
          )}

          {/* Interactive Geo-Route Map for Current Day */}
          <div style={{ marginBottom: "24px" }}>
            <InteractiveMap 
              activities={currentDay?.activities || []} 
              destination={trip.destination}
            />
          </div>

          {/* Activities Timeline / Cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {(!currentDay?.activities || currentDay.activities.length === 0) ? (
              <div className="glass-panel" style={{ padding: "36px", textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)" }}>No activities in this day yet.</p>
                <button 
                  onClick={() => onOpenAddActivity(currentDay.day_number)}
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: "12px" }}
                >
                  <PlusCircle size={15} /> Add First Activity
                </button>
              </div>
            ) : (
              currentDay.activities.map((act, idx) => {
                const colorStyle = getCategoryColor(act.category);
                return (
                  <div
                    key={act.id || idx}
                    className="glass-panel"
                    style={{
                      padding: "20px 24px",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-subtle)",
                      position: "relative",
                      transition: "all 0.2s ease",
                      opacity: act.is_booked ? 0.75 : 1,
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                        <div style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          background: "var(--grad-primary)",
                          color: "white",
                          fontWeight: "700",
                          fontSize: "0.82rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          {idx + 1}
                        </div>

                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontSize: "0.8rem",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                        }}>
                          <Clock size={14} color="var(--accent-cyan)" />
                          {act.time_slot}
                        </span>

                        <span style={{
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: "6px",
                          background: colorStyle.bg,
                          color: colorStyle.text,
                          border: `1px solid ${colorStyle.border}`,
                        }}>
                          {act.category}
                        </span>

                        <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#34d399" }}>
                          {act.estimated_cost > 0 ? `Est. $${act.estimated_cost}` : "Free"}
                        </span>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                        <button
                          onClick={() => handleMoveActivity(idx, -1)}
                          disabled={idx === 0}
                          className="btn btn-ghost btn-sm"
                          title="Move earlier"
                          style={{ padding: "4px" }}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveActivity(idx, 1)}
                          disabled={idx === currentDay.activities.length - 1}
                          className="btn btn-ghost btn-sm"
                          title="Move later"
                          style={{ padding: "4px" }}
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          onClick={() => onOpenEditActivity(act, currentDay.day_number)}
                          className="btn btn-ghost btn-sm"
                          title="Edit activity"
                          style={{ padding: "4px" }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(act.id)}
                          className="btn btn-ghost btn-sm"
                          title="Remove activity"
                          style={{ padding: "4px", color: "#fda4af" }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <div style={{ marginLeft: "38px" }}>
                      <h3 style={{
                        fontSize: "1.15rem",
                        fontWeight: "700",
                        marginBottom: "4px",
                        textDecoration: act.is_booked ? "line-through" : "none",
                        color: act.is_booked ? "var(--text-muted)" : "var(--text-primary)"
                      }}>
                        {act.title}
                      </h3>

                      <div style={{ fontSize: "0.8rem", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "4px", marginBottom: "8px" }}>
                        <MapPin size={13} />
                        <span>{act.location_name}</span>
                      </div>

                      <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "12px" }}>
                        {act.description}
                      </p>

                      {/* Insider Tip Box */}
                      {act.insider_tip && (
                        <div style={{
                          background: "rgba(245, 158, 11, 0.08)",
                          border: "1px solid rgba(245, 158, 11, 0.2)",
                          borderRadius: "var(--radius-sm)",
                          padding: "8px 12px",
                          fontSize: "0.8rem",
                          color: "#fef3c7",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "8px",
                          marginBottom: "12px"
                        }}>
                          <Lightbulb size={15} color="#fbbf24" style={{ marginTop: "2px", flexShrink: 0 }} />
                          <span><strong>Insider Tip:</strong> {act.insider_tip}</span>
                        </div>
                      )}

                      {/* Checkbox Booked */}
                      <div 
                        onClick={() => handleToggleActivityBooked(act.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          color: act.is_booked ? "#34d399" : "var(--text-muted)",
                          userSelect: "none"
                        }}
                      >
                        <div style={{
                          width: "18px",
                          height: "18px",
                          borderRadius: "4px",
                          border: `1px solid ${act.is_booked ? "#10b981" : "rgba(255,255,255,0.2)"}`,
                          background: act.is_booked ? "#10b981" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center"
                        }}>
                          {act.is_booked && <Check size={13} color="white" />}
                        </div>
                        <span>{act.is_booked ? "Booked / Done" : "Mark as Booked"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Sidebar: Cost Breakdown, Packing, Tips */}
        <div>
          {/* Cost Breakdown Widget */}
          <div className="glass-panel" style={{ padding: "24px", borderRadius: "var(--radius-lg)", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <PieChart size={18} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: "1.1rem" }}>Cost Breakdown</h3>
            </div>

            <div style={{ fontSize: "2rem", fontWeight: "800", color: "#34d399", marginBottom: "4px" }}>
              ${trip.cost_breakdown?.total_estimated || 0}
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "18px" }}>
              Estimated for {trip.group_size || 1} travelers ({trip.budget_tier} tier)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Accommodations:</span>
                <span style={{ fontWeight: "700" }}>${trip.cost_breakdown?.accommodations || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Dining & Food:</span>
                <span style={{ fontWeight: "700" }}>${trip.cost_breakdown?.food_and_dining || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Activities & Tickets:</span>
                <span style={{ fontWeight: "700" }}>${trip.cost_breakdown?.activities_and_tickets || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Local Transit:</span>
                <span style={{ fontWeight: "700" }}>${trip.cost_breakdown?.local_transit || 0}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid var(--border-subtle)", paddingTop: "8px" }}>
                <span style={{ color: "var(--text-muted)" }}>Contingency Buffer (8%):</span>
                <span style={{ color: "var(--text-muted)" }}>${trip.cost_breakdown?.contingency || 0}</span>
              </div>
            </div>
          </div>

          {/* Packing Checklist */}
          {trip.packing_list && trip.packing_list.length > 0 && (
            <div className="glass-panel" style={{ padding: "24px", borderRadius: "var(--radius-lg)", marginBottom: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                <Briefcase size={18} color="var(--accent-purple)" />
                <h3 style={{ fontSize: "1.1rem" }}>Smart Packing List</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {trip.packing_list.map((item, idx) => {
                  const isChecked = !!checkedItems[item];
                  return (
                    <div
                      key={idx}
                      onClick={() => togglePackingCheck(item)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        cursor: "pointer",
                        fontSize: "0.82rem",
                        color: isChecked ? "var(--text-muted)" : "var(--text-primary)",
                        textDecoration: isChecked ? "line-through" : "none",
                        userSelect: "none"
                      }}
                    >
                      <div style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "4px",
                        border: `1px solid ${isChecked ? "#8b5cf6" : "rgba(255,255,255,0.2)"}`,
                        background: isChecked ? "#8b5cf6" : "transparent",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginTop: "2px",
                        flexShrink: 0
                      }}>
                        {isChecked && <Check size={12} color="white" />}
                      </div>
                      <span>{item}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Local Destination Tips & Weather */}
          <div className="glass-panel" style={{ padding: "24px", borderRadius: "var(--radius-lg)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <CloudSun size={18} color="var(--accent-amber)" />
              <h3 style={{ fontSize: "1.1rem" }}>Local Tips & Climate</h3>
            </div>
            
            {trip.weather_forecast_note && (
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "14px" }}>
                {trip.weather_forecast_note}
              </p>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {trip.local_tips?.map((tip, i) => (
                <div key={i} style={{ fontSize: "0.78rem", color: "var(--text-secondary)", display: "flex", alignItems: "flex-start", gap: "6px" }}>
                  <span style={{ color: "var(--accent-cyan)", fontWeight: "bold" }}>&bull;</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
