import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import Openrouteservice from "openrouteservice-js";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify";

// Fix for the default icon issue in Leaflet with webpack
// Correctly import the marker icons with explicit URLs
const defaultIconUrl =
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: defaultIconUrl,
  shadowUrl: shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom marker colors for different point types
const markerIcons = {
  start: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  end: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  waypoint: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  stop: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
  dayStop: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  }),
};

// Component to fit map bounds to markers and route
const FitBoundsToRoute = ({ waypoints, routeGeoJson }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let bounds = null;
    if (routeGeoJson?.coordinates?.length > 0) {
      // Fit to route if available
      try {
        bounds = L.geoJSON(routeGeoJson).getBounds();
      } catch (e) {
        console.error("Error creating bounds from routeGeoJson", e);
      }
    } else if (waypoints?.length > 0) {
      // Otherwise fit to markers
      try {
        const validPoints = waypoints
          .filter((wp) => wp?.coordinates)
          .map((wp) => [wp.coordinates[1], wp.coordinates[0]]); // Leaflet uses [lat, lng]
        if (validPoints.length > 0) {
          bounds = L.latLngBounds(validPoints);
        }
      } catch (e) {
        console.error("Error creating bounds from waypoints", e);
      }
    }

    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    } else {
      console.warn("[FitBoundsToRoute] Could not determine valid bounds.");
    }
  }, [map, waypoints, routeGeoJson]);

  return null;
};

/**
 * Itinerary Map Component
 * Displays markers based on startLocation and itineraryLocations, calculates and shows route.
 *
 * @param {Object} props
 * @param {object} props.startLocation - Object { name: string, coordinates: [lng, lat] }
 * @param {Array} props.itineraryLocations - Array of objects [{ day: number, location: { name: string, coordinates: [lng, lat] } }]
 * @param {number} props.height - Height of the map in px
 * @param {string} [props.profile='driving-car'] - ORS routing profile (e.g., 'driving-car', 'cycling-regular')
 * @returns {JSX.Element} Map component
 */
const InteractiveMap = ({
  startLocation,
  itineraryLocations = [],
  height = 500,
  profile = "driving-car", // Default to driving-car
}) => {
  const [routeGeoJson, setRouteGeoJson] = useState(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const mapRef = useRef(); // Ref for map instance

  console.log("[InteractiveMap Itinerary] Initializing with:", {
    startLocation,
    itineraryLocations,
  });

  // Prepare waypoints for markers and routing
  const waypoints = [
    // Add start location if valid coordinates exist
    ...(startLocation?.coordinates
      ? [{ ...startLocation, type: "start", day: "Start" }]
      : []),
    // Add itinerary locations if valid coordinates exist
    ...itineraryLocations
      .filter((item) => item?.location?.coordinates)
      .map((item) => ({
        name: item.location.name,
        coordinates: item.location.coordinates,
        type: "dayStop", // Use custom type for itinerary days
        day: `Day ${item.day}`,
      })),
  ];

  console.log("[InteractiveMap Itinerary] Processed waypoints:", waypoints);

  // Effect to fetch route when waypoints change
  useEffect(() => {
    const validWaypoints = waypoints.filter((wp) => wp?.coordinates);
    if (validWaypoints.length < 2) {
      setRouteGeoJson(null);
      setRouteError(
        validWaypoints.length === 1
          ? "Need at least two locations to calculate a route."
          : null
      );
      return;
    }

    const coordinates = validWaypoints.map((wp) => wp.coordinates);
    const apiKey = import.meta.env.VITE_ORS_API_KEY;

    if (!apiKey) {
      setRouteError("ORS API Key is missing.");
      toast.error("Configuration Error: ORS API Key is missing.");
      return;
    }

    console.log(
      `[InteractiveMap Itinerary] Fetching route via fetch for ${coordinates.length} points with profile ${profile}:`,
      coordinates
    );
    setIsLoadingRoute(true);
    setRouteError(null);
    setRouteGeoJson(null);

    const apiUrl = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;

    fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
        Accept:
          "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
      },
      body: JSON.stringify({
        coordinates: coordinates,
        radiuses: coordinates.map(() => -1), // Add radius for each coordinate
      }),
    })
      .then((response) => {
        if (!response.ok) {
          // Attempt to read error body for more details
          return response
            .json()
            .then((errBody) => {
              console.error("ORS API Error Response Body:", errBody);
              throw new Error(
                `HTTP error ${response.status}: ${
                  errBody?.error?.message || "Failed to fetch route"
                }`
              );
            })
            .catch(() => {
              // Fallback if error body isn't JSON or doesn't exist
              throw new Error(`HTTP error ${response.status}`);
            });
        }
        return response.json();
      })
      .then((data) => {
        console.log(
          "[InteractiveMap Itinerary] ORS Route response (fetch):",
          data
        );
        if (data.features && data.features[0]) {
          setRouteGeoJson(data.features[0].geometry);
        } else {
          throw new Error("No route found in ORS response.");
        }
      })
      .catch((err) => {
        console.error(
          "[InteractiveMap Itinerary] Error fetching ORS route (fetch):",
          err
        );
        setRouteError(`Routing Error: ${err.message}`);
        toast.error(`Routing Error: ${err.message}`);
      })
      .finally(() => {
        setIsLoadingRoute(false);
      });
  }, [JSON.stringify(waypoints), profile]);

  // Default center is Nepal if no points
  const defaultCenter = [27.7172, 85.324]; // Kathmandu, Nepal
  const initialCenter =
    waypoints.length > 0 && waypoints[0].coordinates
      ? [waypoints[0].coordinates[1], waypoints[0].coordinates[0]] // Leaflet uses [lat, lng]
      : defaultCenter;

  return (
    <div
      style={{ height: `${height}px`, width: "100%", position: "relative" }}
      className="leaflet-container"
    >
      {isLoadingRoute && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-3 py-1 rounded shadow text-sm text-[var(--color-primary)]">
          Calculating route...
        </div>
      )}
      {routeError && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-100 text-red-700 px-3 py-1 rounded shadow text-xs">
          {routeError}
        </div>
      )}
      <MapContainer
        center={initialCenter}
        zoom={7}
        style={{ height: "100%", width: "100%", borderRadius: "0.5rem" }}
        whenCreated={(mapInstance) => {
          mapRef.current = mapInstance;
          console.log(
            "[InteractiveMap Itinerary] Map instance created:",
            mapInstance
          );
          setTimeout(() => mapInstance.invalidateSize(), 100);
        }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Draw Markers with Tooltips */}
        {waypoints.map(
          (marker, index) =>
            marker.coordinates && (
              <Marker
                key={`${marker.type}-${index}-${marker.coordinates.join(",")}`} // More robust key
                position={[marker.coordinates[1], marker.coordinates[0]]}
                icon={markerIcons[marker.type] || DefaultIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <h3 className="font-semibold mb-1">
                      {marker.day || marker.type}
                    </h3>
                    <p>{marker.name}</p>
                    <p className="text-xs text-gray-500">{`Coords: ${marker.coordinates[1].toFixed(
                      4
                    )}, ${marker.coordinates[0].toFixed(4)}`}</p>
                  </div>
                </Popup>
                <Tooltip
                  direction="top"
                  offset={[0, -35]}
                  opacity={0.9}
                  permanent={false}
                >
                  <span className="font-medium">
                    {marker.day ||
                      (marker.type === "start" ? "Start" : "Location")}
                    :
                  </span>
                  {marker.name}
                </Tooltip>
              </Marker>
            )
        )}

        {/* Draw Route Polyline */}
        {routeGeoJson && (
          <Polyline
            positions={routeGeoJson.coordinates.map((coord) => [
              coord[1],
              coord[0],
            ])} // Convert [lng, lat] to [lat, lng]
            color="#0ea5e9" // Use primary color
            weight={5}
            opacity={0.8}
          />
        )}

        <FitBoundsToRoute waypoints={waypoints} routeGeoJson={routeGeoJson} />
        {/* Removed MapClickHandler - interaction handled via props */}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
