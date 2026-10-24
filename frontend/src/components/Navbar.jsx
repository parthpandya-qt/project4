import React from "react";
import { Compass, Sparkles, Database, Layers, PlusCircle, CheckCircle2, Bookmark, Sliders } from "lucide-react";

export default function Navbar({ activeTab, setActiveTab, supabaseStatus, onOpenSettings, onNewTrip }) {
  const isSupabase = supabaseStatus?.mode === "supabase" && supabaseStatus?.connected;

  return (
    <header style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(9, 13, 22, 0.85)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "72px",
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => setActiveTab("dashboard")}
          style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}
        >
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "var(--grad-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 20px rgba(6, 182, 212, 0.4)",
          }}>
            <Compass size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: "800", letterSpacing: "-0.03em" }}>
                Voyage<span style={{ color: "var(--accent-cyan)" }}>AI</span>
              </span>
              <span className="badge badge-purple" style={{ fontSize: "0.65rem", padding: "2px 6px" }}>v1.0</span>
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "-3px" }}>
              AI Travel Itinerary Planner
            </div>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`btn ${activeTab === "dashboard" ? "btn-secondary" : "btn-ghost"}`}
            style={{ fontSize: "0.88rem", padding: "8px 14px" }}
          >
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveTab("builder")}
            className={`btn ${activeTab === "builder" ? "btn-secondary" : "btn-ghost"}`}
            style={{ fontSize: "0.88rem", padding: "8px 14px" }}
          >
            <Sparkles size={16} color="var(--accent-cyan)" />
            Smart Trip Builder
          </button>

          <button
            onClick={() => setActiveTab("scenarios")}
            className={`btn ${activeTab === "scenarios" ? "btn-secondary" : "btn-ghost"}`}
            style={{ fontSize: "0.88rem", padding: "8px 14px" }}
          >
            <Layers size={16} color="var(--accent-purple)" />
            Scenarios (1-3)
          </button>

          <button
            onClick={() => setActiveTab("saved")}
            className={`btn ${activeTab === "saved" ? "btn-secondary" : "btn-ghost"}`}
            style={{ fontSize: "0.88rem", padding: "8px 14px" }}
          >
            <Bookmark size={16} color="var(--accent-amber)" />
            Saved Itineraries
          </button>
        </nav>

        {/* Right Action & Supabase Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Supabase status badge */}
          <button 
            onClick={onOpenSettings}
            className="btn btn-ghost btn-sm"
            style={{
              padding: "6px 12px",
              background: isSupabase 
                ? "rgba(16, 185, 129, 0.12)" 
                : (supabaseStatus?.mode === "supabase_key_verified" ? "rgba(245, 158, 11, 0.15)" : "rgba(6, 182, 212, 0.12)"),
              border: `1px solid ${
                isSupabase 
                  ? "rgba(16, 185, 129, 0.3)" 
                  : (supabaseStatus?.mode === "supabase_key_verified" ? "rgba(245, 158, 11, 0.4)" : "rgba(6, 182, 212, 0.3)")
              }`,
              borderRadius: "9999px",
              fontSize: "0.78rem",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              cursor: "pointer"
            }}
            title="Click to configure Supabase or AI settings"
          >
            <Database size={13} color={isSupabase ? "#10b981" : (supabaseStatus?.mode === "supabase_key_verified" ? "#fbbf24" : "#06b6d4")} />
            <span style={{ 
              color: isSupabase ? "#34d399" : (supabaseStatus?.mode === "supabase_key_verified" ? "#fbbf24" : "#22d3ee"), 
              fontWeight: "600" 
            }}>
              {isSupabase 
                ? "Supabase: Connected" 
                : (supabaseStatus?.mode === "supabase_key_verified" ? "Supabase: Key Verified (Run SQL)" : "Storage: Ready")}
            </span>
            <Sliders size={12} color="var(--text-muted)" />
          </button>


          {/* New Trip CTA */}
          <button 
            onClick={onNewTrip}
            className="btn btn-primary btn-sm"
            style={{ padding: "8px 16px" }}
          >
            <PlusCircle size={16} />
            Plan Trip
          </button>
        </div>
      </div>
    </header>
  );
}
