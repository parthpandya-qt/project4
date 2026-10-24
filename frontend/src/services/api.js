const API_BASE = import.meta.env.VITE_API_URL || "/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Health check failed");
  return res.json();
}

export async function fetchConfigStatus() {
  const res = await fetch(`${API_BASE}/config-status`);
  if (!res.ok) throw new Error("Failed to load config status");
  return res.json();
}

export async function updateConfig(keys) {
  const res = await fetch(`${API_BASE}/config`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(keys),
  });
  if (!res.ok) throw new Error("Failed to update config");
  return res.json();
}

export async function fetchTemplates() {
  const res = await fetch(`${API_BASE}/templates`);
  if (!res.ok) throw new Error("Failed to load scenario templates");
  return res.json();
}

export async function fetchTrips() {
  const res = await fetch(`${API_BASE}/trips`);
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
}

export async function fetchTrip(tripId) {
  const res = await fetch(`${API_BASE}/trips/${tripId}`);
  if (!res.ok) throw new Error("Failed to fetch trip details");
  return res.json();
}

export async function generateItinerary(payload) {
  const res = await fetch(`${API_BASE}/generate-itinerary`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to generate itinerary");
  return res.json();
}

export async function regenerateDay(payload) {
  const res = await fetch(`${API_BASE}/regenerate-day`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to regenerate day");
  return res.json();
}

export async function saveTrip(trip) {
  const res = await fetch(`${API_BASE}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error("Failed to save trip");
  return res.json();
}

export async function updateTrip(tripId, trip) {
  const res = await fetch(`${API_BASE}/trips/${tripId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(trip),
  });
  if (!res.ok) throw new Error("Failed to update trip");
  return res.json();
}

export async function deleteTrip(tripId) {
  const res = await fetch(`${API_BASE}/trips/${tripId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete trip");
  return res.json();
}
