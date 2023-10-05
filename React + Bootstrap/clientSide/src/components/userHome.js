import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import pic from "./images/marker.png";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFuaWVsYmQ5NCIsImEiOiJjbG1idHM5azExOWN0M2pvNW85aWZqYzAwIn0.POf6CQrJ6cs-CGcgqCxVvQ";

export default function UserHome({ userData }) {
  const [map, setMap] = useState(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        // Get user's location using navigator.geolocation
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;

        // Initialize the map
        const map = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [longitude, latitude],
          zoom: 12,
        });

        // Load the custom marker image and add it to the map
        map.on("load", () => {
          map.loadImage(pic, (error, image) => {
            if (error) throw error;
            map.addImage("custom-marker", image);
          });

          // Fetch charging stations data
          axios
            .get(
              "/v3/poi/?output=json&key=94bfa313-7b90-46f7-8cff-60a14b0531d2&latitude=33.01376&longitude=35.094528&distance=15"
            )
            .then((response) => {
              const chargingStations = response.data;

              // Create a GeoJSON source for the charging stations
              map.addSource("chargingStations", {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: chargingStations.map((station) => ({
                    type: "Feature",
                    geometry: {
                      type: "Point",
                      coordinates: [
                        station.AddressInfo.Longitude,
                        station.AddressInfo.Latitude,
                      ],
                    },
                    properties: {
                      title: station.AddressInfo.Title,
                      operator: station.OperatorInfo.Title,
                      address: `${station.AddressInfo.AddressLine1}, ${station.AddressInfo.Town}, ${station.AddressInfo.Postcode}`,
                    },
                  })),
                },
              });

              // Add a layer for the charging station markers
              map.addLayer({
                id: "charging-station-markers",
                type: "symbol",
                source: "chargingStations",
                layout: {
                  "icon-image": "custom-marker", // Use the name of the added image
                  "icon-size": 0.5, // Adjust the size of the marker as needed
                  "icon-allow-overlap": true,
                },
                paint: {},
              });

              // Create a popup for the markers
              map.on("click", "charging-station-markers", (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const { title, operator, address } = e.features[0].properties;

                // Create the popup content with a "Get directions" button
                const popupContent = `
                  <h3>${title}</h3>
                  <p>Operator: ${operator}</p>
                  <p>Address: ${address}</p>
                  <button type="submit" class="btn btn-primary" id="getDirectionsBtn">Get directions</button>
                `;

                // Set the popup content
                const popup = new mapboxgl.Popup()
                  .setLngLat(coordinates)
                  .setHTML(popupContent);

                // Add the popup to the map
                popup.addTo(map);

                // Handle "Get directions" button click
                document
                  .getElementById("getDirectionsBtn")
                  .addEventListener("click", () => {
                    // Create a link for navigation with destination coordinates
                    const navigationLink = `https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}`;

                    // Open the link in a new tab/window
                    window.open(navigationLink, "_blank");
                  });
              });

              // Change the cursor to a pointer when hovering over the markers
              map.on("mouseenter", "charging-station-markers", () => {
                map.getCanvas().style.cursor = "pointer";
              });

              // Change the cursor back to the default when not hovering over markers
              map.on("mouseleave", "charging-station-markers", () => {
                map.getCanvas().style.cursor = "";
              });

              setMap(map);
            });
        });
      } catch (error) {
        console.error("Error initializing map: ", error);
      }
    };

    initializeMap();

    // Clean up the map when the component unmounts
    return () => {
      if (map) {
        map.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="map" style={{ width: "100%", height: "100vh" }}></div>
  );
}
