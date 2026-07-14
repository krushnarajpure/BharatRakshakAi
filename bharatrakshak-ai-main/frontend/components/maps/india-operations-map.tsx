"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

const incidents = [
  { title: "Flood Alert",      location: "Assam",     lat: 26.2006, lng: 92.9376 },
  { title: "Cyclone Warning",  location: "Odisha",    lat: 20.9517, lng: 85.0985 },
  { title: "Heatwave",         location: "Rajasthan", lat: 27.0238, lng: 74.2179 },
  { title: "Landslide",        location: "Sikkim",    lat: 27.533,  lng: 88.5122 },
  { title: "Responder Team",   location: "Delhi",     lat: 28.6139, lng: 77.2090 },
  { title: "SOS Request",      location: "Chennai",   lat: 13.0827, lng: 80.2707 },
];

const CENTER: LatLngExpression = [22.5, 79];

export function IndiaOperationsMap() {
  // Only render on the client — fixes "appendChild" SSR crash
  const [mounted, setMounted] = useState(false);
  // Changing this key forces Leaflet to unmount + remount a fresh container,
  // which prevents the "Map container is being reused" StrictMode error
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    // Dynamically fix the default icon paths (Leaflet + webpack asset issue)
    // Must run client-side only
    import("leaflet").then((L) => {
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });
      setMapKey((k) => k + 1); // trigger a clean remount with patched icons
      setMounted(true);
    });
  }, []);

  if (!mounted) {
    return (
      <div className="h-[650px] w-full animate-pulse bg-[#0d1a26] flex items-center justify-center">
        <span className="text-xs uppercase tracking-widest text-slate-500">
          Loading map…
        </span>
      </div>
    );
  }

  return (
    <MapContainer
      key={mapKey}
      center={CENTER}
      zoom={5}
      className="h-[650px] w-full"
      // Prevents a second Leaflet instance stealing focus on StrictMode's
      // second render pass before the first has fully unmounted
      preferCanvas
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {incidents.map((item) => (
        <Marker key={item.title} position={[item.lat, item.lng]}>
          <Popup>
            <div className="font-semibold">{item.title}</div>
            <div>{item.location}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}