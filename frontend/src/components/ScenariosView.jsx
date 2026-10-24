import React from "react";
import { 
  User, 
  Heart, 
  Users, 
  Clock, 
  DollarSign, 
  Compass, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles 
} from "lucide-react";

export default function ScenariosView({ templates = [], onLaunchScenario }) {
  const scenarioDetails = [
    {
      id: "scenario-1-solo-kyoto",
      number: "1",
      title: "Solo Traveler: High-Efficiency Weekend Getaway",
      persona: "Solo Adventurer / Time-Constrained Professional",
      destination: "Kyoto, Japan",
      icon: User,
      gradient: "var(--grad-primary)",
      problem: "Limited weekend hours to research cross-town routes, temple operating hours, and dining spots without getting overwhelmed by dozens of blogs.",
      aiSolution: "Instantly sequences geographically contiguous sights (Fushimi Inari at dawn, Nishiki Market street food at noon, Gion evening lantern stroll) with zero route backtracking.",
      keyFeatures: [
        "Rapid 3-day dense schedule with minimal transfer delays",
        "Affordable artisanal street-food recommendations",
        "Early morning crowd-avoidance photo strategies",
        "Transit pass advice (ICOCA / Kyoto 1-Day Pass)"
      ]
    },
    {
      id: "scenario-2-couple-amalfi",
      number: "2",
      title: "Couple Vacation: Bespoke Romantic Escape",
      persona: "Romantic Partners / Honeymooners",
      destination: "Amalfi Coast, Italy",
      icon: Heart,
      gradient: "var(--grad-royal)",
      problem: "Standard generic tourist traps ruin romantic getaways. Couples require relaxed pacing, picturesque vistas, and high-quality intimate dining.",
      aiSolution: "Balances relaxed mornings with private sunset boat cruises along Positano, Ravello cliffside marble terrace walks, and 400-candlelit dining reservations.",
      keyFeatures: [
        "Relaxed pacing (slow starts, 2-3 unhurried highlights per day)",
        "Unique scenic experiences & candlelit restaurant curation",
        "Seamless single-day regeneration if plans or weather change",
        "Cost tracking across luxury dining and boat charters"
      ]
    },
    {
      id: "scenario-3-group-bali",
      number: "3",
      title: "Small Group: Synchronized Multi-Day Expedition",
      persona: "Group of 5 Friends / Multi-Interest Travel Party",
      destination: "Bali, Indonesia",
      icon: Users,
      gradient: "var(--grad-aurora)",
      problem: "Coordinating 5 people with conflicting interests (some want volcano hiking, others want beach clubs or cultural temples) causes schedule friction and budget arguments.",
      aiSolution: "Synthesizes shared adventure thrills with cultural cleansing rituals, splits shared private van costs evenly, and schedules free leisure time for individual exploration.",
      keyFeatures: [
        "Group size scaling: calculates shared lodging and private driver costs",
        "Adventure + culture harmony (Mount Batur trek, river rafting & Tirta Empul)",
        "Dedicated group logistics and baggage transit tips",
        "Shared itinerary link for collaborative review"
      ]
    }
  ];

  return (
    <div style={{ padding: "32px 0 60px" }}>
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
          <span className="badge badge-purple">
            <Sparkles size={13} /> Evaluation Showcase
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            3 Real-World Use Cases
          </span>
        </div>
        <h1 style={{ fontSize: "2.4rem", fontWeight: "800" }}>
          Target User Travel Scenarios
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", maxWidth: "620px", margin: "8px auto 0" }}>
          Experience how VoyageAI transforms travel planning complexities into frictionless, tailored itineraries for distinct traveler personas.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
        {scenarioDetails.map((scen) => {
          const Icon = scen.icon;
          return (
            <div 
              key={scen.id}
              className="glass-panel"
              style={{
                padding: "32px",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-subtle)",
                position: "relative",
                overflow: "hidden"
              }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "32px", alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                    <div style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      background: scen.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white"
                    }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <span className="badge badge-cyan" style={{ fontSize: "0.72rem" }}>
                        Scenario {scen.number}
                      </span>
                      <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginLeft: "8px" }}>
                        {scen.persona}
                      </span>
                    </div>
                  </div>

                  <h2 style={{ fontSize: "1.6rem", fontWeight: "700", marginBottom: "12px" }}>
                    {scen.title}
                  </h2>

                  {/* Problem & AI Solution */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
                    <div style={{
                      background: "rgba(244, 63, 94, 0.08)",
                      border: "1px solid rgba(244, 63, 94, 0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "14px 16px"
                    }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#fda4af", textTransform: "uppercase", marginBottom: "4px" }}>
                        Planning Challenge
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {scen.problem}
                      </p>
                    </div>

                    <div style={{
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.2)",
                      borderRadius: "var(--radius-md)",
                      padding: "14px 16px"
                    }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: "700", color: "#6ee7b7", textTransform: "uppercase", marginBottom: "4px" }}>
                        AI Optimization Solution
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {scen.aiSolution}
                      </p>
                    </div>
                  </div>

                  {/* Key Features Checkmarks */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    {scen.keyFeatures.map((feat, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "var(--text-primary)" }}>
                        <CheckCircle2 size={15} color="var(--accent-cyan)" style={{ flexShrink: 0 }} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right CTA Card */}
                <div style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-lg)",
                  padding: "24px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>
                    Destination
                  </div>
                  <div style={{ fontWeight: "700", fontSize: "1.2rem", color: "#f8fafc", marginBottom: "16px" }}>
                    {scen.destination}
                  </div>

                  <button 
                    onClick={() => onLaunchScenario(scen.id)}
                    className="btn btn-primary"
                    style={{ width: "100%", padding: "12px 18px", background: scen.gradient }}
                  >
                    <span>Load Scenario {scen.number}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
