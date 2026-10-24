import React, { useState, useEffect } from "react";
import { X, Check, MapPin, DollarSign, Clock, Tag, Lightbulb } from "lucide-react";

export default function ActivityModal({ isOpen, onClose, onSave, initialData = null, dayNumber = 1 }) {
  const [formData, setFormData] = useState({
    title: "",
    time_slot: "10:00 AM - 12:30 PM",
    period: "morning",
    category: "sightseeing",
    location_name: "",
    description: "",
    estimated_cost: 0,
    insider_tip: "",
    duration_mins: 90,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        time_slot: initialData.time_slot || "10:00 AM - 12:30 PM",
        period: initialData.period || "morning",
        category: initialData.category || "sightseeing",
        location_name: initialData.location_name || "",
        description: initialData.description || "",
        estimated_cost: initialData.estimated_cost || 0,
        insider_tip: initialData.insider_tip || "",
        duration_mins: initialData.duration_mins || 90,
      });
    } else {
      setFormData({
        title: "",
        time_slot: "10:00 AM - 12:30 PM",
        period: "morning",
        category: "sightseeing",
        location_name: "",
        description: "",
        estimated_cost: 0,
        insider_tip: "",
        duration_mins: 90,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...formData,
      id: initialData?.id || `act-custom-${Date.now()}`,
      estimated_cost: Number(formData.estimated_cost) || 0,
    });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
          <div>
            <h3 style={{ fontSize: "1.2rem" }}>
              {initialData ? "Edit Activity" : `Add Activity to Day ${dayNumber}`}
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
              Customize schedule details, dining reservations, or attractions.
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: "6px" }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Activity Title</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Sunset Aperitivo at Rooftop Terrazza"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Time Slot</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. 03:00 PM - 05:30 PM"
                value={formData.time_slot}
                onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Period</label>
              <select
                className="form-select"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="sightseeing">Sightseeing & Landmarks</option>
                <option value="dining">Food & Dining</option>
                <option value="culture">Art & Culture</option>
                <option value="adventure">Outdoor & Adventure</option>
                <option value="nature">Scenic Nature</option>
                <option value="leisure">Leisure & Relaxation</option>
                <option value="transit">Transportation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Est. Cost ($ USD)</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="form-input"
                placeholder="0"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / Address</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Piazza di Spagna, Rome"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              placeholder="What makes this activity special or what to expect..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <Lightbulb size={14} color="var(--accent-amber)" />
              <span>Insider Tip or Advice</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Pre-book skip-the-line passes online 2 days in advance"
              value={formData.insider_tip}
              onChange={(e) => setFormData({ ...formData, insider_tip: e.target.value })}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
            <button type="button" onClick={onClose} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm">
              <Check size={16} />
              <span>{initialData ? "Save Changes" : "Add to Itinerary"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
