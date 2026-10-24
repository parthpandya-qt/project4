import React from "react";
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  Users, 
  Clock, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  TrendingUp, 
  Trash2, 
  Share2, 
  CheckCircle2, 
  Layers,
  Heart,
  Zap,
  Globe
} from "lucide-react";

export default function DashboardView({ 
  trips = [], 
  templates = [], 
  onSelectTrip, 
  onLaunchTemplate, 
  onStartNewPlan, 
  onDeleteTrip, 
  onOpenShare 
}) {
  const totalDays = trips.reduce((acc, t) => acc + (t.duration_days || 0), 0);
  const totalEstSavings = Math.round(trips.length * 14.5); // hours saved from manual searching

  return (
    <div style={{ padding: "36px 0 60px" }}>
      {/* Hero Section */}
      <div className="glass-panel" style={{
        padding: "44px 40px",
        marginBottom: "36px",
        position: "relative",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.85) 100%)",
      }}>
        {/* Background ambient glow circles */}
        <div style={{
          position: "absolute",
          top: "-50px",
          right: "-50px",
          width: "280px",
          height: "280px",
          background: "radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)",
          filter: "blur(30px)",
          pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute",
          bottom: "-40px",
          left: "20%",
          width: "220px",
          height: "220px",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
          filter: "blur(30px)",
          pointerEvents: "none"
        }} />

        <div style={{ maxWidth: "780px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span className="badge badge-cyan" style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <Sparkles size={12} /> Next-Gen AI Travel Engineering
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Automated logistics &bull; Zero decision fatigue
            </span>
          </div>

          <h1 style={{
            fontSize: "2.8rem",
            fontWeight: "800",
            lineHeight: 1.15,
            marginBottom: "16px",
          }}>
            Turn Dream Destinations Into <span className="gradient-text">Precision Day-by-Day</span> Itineraries
          </h1>

          <p style={{
            fontSize: "1.05rem",
            color: "var(--text-secondary)",
            lineHeight: 1.6,
            marginBottom: "28px",
          }}>
            Automates hours of cross-tab research across attractions, curated dining gems, pacing logistics, and cost projections. Tailored specifically for solo weekenders, romantic couples, and synchronized travel groups.
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
            <button onClick={onStartNewPlan} className="btn btn-primary btn-lg">
              <Sparkles size={20} />
              <span>Launch Smart Trip Builder</span>
            </button>
            <button 
              onClick={() => onLaunchTemplate(templates[0]?.id || "scenario-1-solo-kyoto")} 
              className="btn btn-secondary btn-lg"
            >
              <span>Explore Solo Kyoto Scenario</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Quick SaaS Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginTop: "36px",
          paddingTop: "28px",
          borderTop: "1px solid var(--border-subtle)",
        }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
              Saved Itineraries
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
              {trips.length} Trips
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--accent-cyan)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <TrendingUp size={13} /> Active in Storage
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
              Total Days Planned
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
              {totalDays} Days
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--accent-purple)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <Clock size={13} /> Structured Schedules
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
              Research Hours Saved
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
              ~{totalEstSavings} hrs
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--accent-emerald)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <Zap size={13} /> Decision Fatigue -90%
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
              Database Sync
            </div>
            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#f8fafc", marginTop: "4px" }}>
              Instant
            </div>
            <div style={{ fontSize: "0.78rem", color: "var(--accent-amber)", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <ShieldCheck size={13} /> Supabase PostgreSQL
            </div>
          </div>
        </div>
      </div>

      {/* Featured Scenarios Showcase (1, 2, 3) */}
      <div style={{ marginBottom: "44px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "18px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--accent-purple)", fontSize: "0.85rem", fontWeight: "700" }}>
              <Layers size={16} /> CORE USER SCENARIOS
            </div>
            <h2 style={{ fontSize: "1.7rem", marginTop: "4px" }}>Tailored Travel Personas</h2>
          </div>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            1-Click Interactive Demonstrations
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {templates.map((tpl) => (
            <div 
              key={tpl.id}
              className="glass-panel"
              style={{
                borderRadius: "var(--radius-lg)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: "1px solid var(--border-subtle)",
                transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.borderColor = "rgba(6, 182, 212, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.borderColor = "var(--border-subtle)";
              }}
              onClick={() => onLaunchTemplate(tpl.id)}
            >
              {/* Cover Image & Badges */}
              <div style={{
                height: "170px",
                position: "relative",
                backgroundImage: `url(${tpl.cover_image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(15,23,42,0.92) 100%)",
                }} />
                
                <div style={{ position: "absolute", top: "14px", left: "14px", display: "flex", gap: "6px" }}>
                  <span className="badge badge-purple" style={{ background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)" }}>
                    {tpl.badge}
                  </span>
                  <span className="badge badge-cyan" style={{ background: "rgba(15, 23, 42, 0.85)", backdropFilter: "blur(6px)" }}>
                    {tpl.duration_days} Days
                  </span>
                </div>

                <div style={{ position: "absolute", bottom: "12px", left: "16px", right: "16px" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#38bdf8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {tpl.scenario_name.split(":")[0]}
                  </div>
                  <h3 style={{ fontSize: "1.25rem", color: "#ffffff", fontWeight: "700" }}>
                    {tpl.title}
                  </h3>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "16px" }}>
                  {tpl.description}
                </p>

                {/* Specs */}
                <div>
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginBottom: "16px",
                  }}>
                    {tpl.interests.slice(0, 3).map((inter, i) => (
                      <span key={i} style={{
                        fontSize: "0.72rem",
                        padding: "3px 8px",
                        borderRadius: "6px",
                        background: "rgba(255, 255, 255, 0.06)",
                        color: "var(--text-secondary)",
                      }}>
                        {inter}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border-subtle)", paddingTop: "14px" }}>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Users size={14} />
                      <span>{tpl.group_size} {tpl.group_size === 1 ? "Traveler" : "Travelers"} &bull; {tpl.budget_tier}</span>
                    </div>

                    <button className="btn btn-primary btn-sm" style={{ padding: "6px 12px" }}>
                      <span>View Itinerary</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent / Saved Itineraries Section */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "1.5rem" }}>All Saved Itineraries</h2>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Access, fine-tune, or re-generate your travel schedules anytime.
            </p>
          </div>
          <button onClick={onStartNewPlan} className="btn btn-primary btn-sm">
            <Sparkles size={14} />
            <span>Generate New Trip</span>
          </button>
        </div>

        {trips.length === 0 ? (
          <div className="glass-panel" style={{ padding: "48px 24px", textAlign: "center" }}>
            <Compass size={44} color="var(--accent-cyan)" style={{ margin: "0 auto 12px", opacity: 0.8 }} />
            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px" }}>No trips planned yet</h3>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", maxWidth: "420px", margin: "0 auto 20px" }}>
              Use the Smart Trip Builder or click any scenario above to generate your first personalized itinerary!
            </p>
            <button onClick={onStartNewPlan} className="btn btn-primary">
              Build Your First Trip
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "18px" }}>
            {trips.map((trip) => (
              <div 
                key={trip.id}
                className="glass-panel"
                style={{
                  padding: "20px",
                  borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  transition: "all 0.2s ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <span className="badge badge-cyan" style={{ fontSize: "0.7rem" }}>
                      {trip.destination}
                    </span>
                    <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                      {trip.duration_days} Days
                    </span>
                  </div>

                  <h3 style={{ fontSize: "1.18rem", fontWeight: "700", marginBottom: "6px", lineHeight: 1.3 }}>
                    {trip.title}
                  </h3>

                  <p style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    lineHeight: 1.5,
                    marginBottom: "14px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }}>
                    {trip.tagline || trip.overview}
                  </p>

                  <div style={{
                    background: "rgba(0,0,0,0.25)",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    marginBottom: "16px",
                  }}>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {trip.traveler_type?.toUpperCase()} ({trip.group_size || 1} pers.)
                    </span>
                    <span style={{ fontWeight: "700", color: "#34d399" }}>
                      Est. ${trip.cost_breakdown?.total_estimated || 0}
                    </span>
                  </div>
                </div>

                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--border-subtle)",
                  paddingTop: "12px",
                }}>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button 
                      onClick={() => onOpenShare(trip)}
                      className="btn btn-ghost btn-sm"
                      title="Share link or export"
                      style={{ padding: "6px 10px" }}
                    >
                      <Share2 size={15} />
                    </button>
                    <button 
                      onClick={() => onDeleteTrip(trip.id)}
                      className="btn btn-ghost btn-sm"
                      title="Delete trip"
                      style={{ padding: "6px 10px", color: "#fda4af" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <button 
                    onClick={() => onSelectTrip(trip)}
                    className="btn btn-primary btn-sm"
                  >
                    <span>Open Plan</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
