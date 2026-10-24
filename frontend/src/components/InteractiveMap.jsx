import React, { useEffect, useRef } from "react";
import L from "leaflet";

export default function InteractiveMap({ activities = [], centerCoords = null, destination = "" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Default center
    const defaultLat = centerCoords?.lat || 40.7128;
    const defaultLng = centerCoords?.lng || -74.0060;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 12,
        zoomControl: true,
      });

      // CartoDB Dark Matter / Voyager tiles for sleek modern dark styling
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://carto.com/">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    layer.clearLayers();

    const validPoints = [];

    activities.forEach((act, idx) => {
      if (act.coordinates && act.coordinates.lat && act.coordinates.lng) {
        const lat = act.coordinates.lat;
        const lng = act.coordinates.lng;
        validPoints.push([lat, lng]);

        // Custom icon pin
        const customIcon = L.divIcon({
          className: "custom-map-pin",
          html: `<div style="width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg, #06b6d4, #6366f1); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; border:2px solid white; box-shadow:0 4px 10px rgba(0,0,0,0.4);">${idx + 1}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
          popupAnchor: [0, -14],
        });

        const marker = L.marker([lat, lng], { icon: customIcon });
        
        const popupContent = `
          <div style="font-family:sans-serif; color:#0f172a; padding:4px; max-width:220px;">
            <div style="font-size:11px; font-weight:700; color:#0284c7; text-transform:uppercase; margin-bottom:2px;">
              Stop #${idx + 1} &bull; ${act.time_slot}
            </div>
            <div style="font-weight:700; font-size:13px; line-height:1.3; margin-bottom:4px;">
              ${act.title}
            </div>
            <div style="font-size:11px; color:#64748b; margin-bottom:6px;">
              ${act.location_name || destination}
            </div>
            <div style="font-size:11px; font-weight:600; color:#059669;">
              Est. ${act.estimated_cost > 0 ? `$${act.estimated_cost}` : "Free"} &bull; ${act.category}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        layer.addLayer(marker);
      }
    });

    // Draw route polyline connecting sequential stops
    if (validPoints.length > 1) {
      const polyline = L.polyline(validPoints, {
        color: "#06b6d4",
        weight: 3,
        opacity: 0.8,
        dashArray: "6, 8",
      });
      layer.addLayer(polyline);
    }

    if (validPoints.length > 0) {
      const bounds = L.latLngBounds(validPoints);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    } else if (centerCoords?.lat && centerCoords?.lng) {
      map.setView([centerCoords.lat, centerCoords.lng], 12);
    }

    // Force map size invalidation to avoid gray boxes
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

  }, [activities, centerCoords, destination]);

  return (
    <div style={{ position: "relative", width: "100%", height: "380px", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      <div style={{
        position: "absolute",
        bottom: "12px",
        left: "12px",
        zIndex: 500,
        background: "rgba(15, 23, 42, 0.88)",
        backdropFilter: "blur(8px)",
        padding: "6px 14px",
        borderRadius: "20px",
        border: "1px solid rgba(255,255,255,0.1)",
        fontSize: "12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#e2e8f0"
      }}>
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#06b6d4", display: "inline-block" }}></span>
        <span>Interactive Geo-Route: {activities.length} Waypoints</span>
      </div>
    </div>
  );
}
