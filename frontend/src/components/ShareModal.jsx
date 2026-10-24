import React, { useState } from "react";
import { X, Copy, Check, Printer, Share2, CheckCheck } from "lucide-react";

export default function ShareModal({ isOpen, onClose, trip }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isOpen || !trip) return null;

  const shareUrl = `${window.location.origin}/?trip=${trip.id}`;

  function handleCopyLink() {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  function handleCopySummary() {
    let summaryText = `🌍 ${trip.title}\n📍 Destination: ${trip.destination}\n📅 Dates: ${trip.start_date} to ${trip.end_date} (${trip.duration_days} Days)\n👥 Travelers: ${trip.traveler_type.toUpperCase()} (${trip.group_size} travelers)\n💰 Budget: ${trip.budget_tier.toUpperCase()} (~$${trip.cost_breakdown?.total_estimated || 0})\n\n`;

    trip.days?.forEach((day) => {
      summaryText += `🗓️ Day ${day.day_number}: ${day.theme}\n`;
      day.activities?.forEach((act, i) => {
        summaryText += `  • ${act.time_slot} - ${act.title} ($${act.estimated_cost})\n`;
      });
      summaryText += `\n`;
    });

    summaryText += `Generated via VoyageAI Travel Planner.`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "560px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "rgba(6, 182, 212, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Share2 size={18} color="var(--accent-cyan)" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem" }}>Share & Export Itinerary</h3>
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                Send to travel companions, save offline, or print.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        {/* Share Link */}
        <div className="form-group">
          <label className="form-label">Direct Shareable Link</label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              readOnly
              className="form-input"
              value={shareUrl}
              style={{ background: "rgba(0,0,0,0.3)" }}
            />
            <button onClick={handleCopyLink} className="btn btn-primary" style={{ padding: "0 18px", flexShrink: 0 }}>
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedLink ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Export Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "20px" }}>
          <div 
            onClick={handleCopySummary}
            className="glass-panel" 
            style={{
              padding: "16px",
              cursor: "pointer",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              {copiedSummary ? <CheckCheck size={18} color="var(--accent-emerald)" /> : <Copy size={18} color="var(--accent-cyan)" />}
              <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>
                {copiedSummary ? "Copied Summary!" : "Copy Text Summary"}
              </span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Formatted for WhatsApp, Slack, group chats, or email threads.
            </p>
          </div>

          <div 
            onClick={handlePrint}
            className="glass-panel" 
            style={{
              padding: "16px",
              cursor: "pointer",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Printer size={18} color="var(--accent-purple)" />
              <span style={{ fontWeight: "700", fontSize: "0.95rem" }}>Print or PDF</span>
            </div>
            <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
              Generates a printer-optimized layout suitable for offline viewing.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
