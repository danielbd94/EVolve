import React, { useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import axios from "axios";
import pic from "./images/marker.png";
import NavigationBar from "./NavigationBar";

mapboxgl.accessToken = "pk.eyJ1IjoiZGFuaWVsYmQ5NCIsImEiOiJjbG1idHM5azExOWN0M2pvNW85aWZqYzAwIn0.POf6CQrJ6cs-CGcgqCxVvQ";

const UserHome = ({ userData }) => {
  const [map, setMap] = useState(null);
  const [routeLength, setRouteLength] = useState(null);

  useEffect(() => {
    const initializeMap = async () => {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });

        const { latitude, longitude } = position.coords;

        const map = new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v11",
          center: [longitude, latitude],
          zoom: 12,
        });

        map.on("load", () => {
          map.loadImage(pic, (error, image) => {
            if (error) throw error;
            map.addImage("custom-marker", image);
          });

          const navControl = new mapboxgl.NavigationControl({
            showZoom: true,
            visualizePitch: true,
            visualizeCourse: true,
          });

          map.addControl(navControl, "top-left");

          axios
            .get(`/v3/poi/?output=json&key=94bfa313-7b90-46f7-8cff-60a14b0531d2&latitude=${latitude}&longitude=${longitude}&distance=100`)
            .then((response) => {
              const chargingStations = response.data;
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
                      title: station.AddressInfo?.Title || "Unknown Title",
                      operator: station.OperatorInfo?.Title || "Unknown Operator",
                      address: `${station.AddressInfo?.AddressLine1 || ""}, ${
                        station.AddressInfo?.Town || ""
                      }, ${station.AddressInfo?.Postcode || ""}`,
                    },
                  })),
                },
              });

              map.addLayer({
                id: "charging-station-markers",
                type: "symbol",
                source: "chargingStations",
                layout: {
                  "icon-image": "custom-marker",
                  "icon-size": 0.5,
                  "icon-allow-overlap": true,
                },
                paint: {},
              });

              map.on("click", "charging-station-markers", (e) => {
                const coordinates = e.features[0].geometry.coordinates.slice();
                const { title, operator, address } = e.features[0].properties;

                axios
                  .get(`https://api.mapbox.com/directions/v5/mapbox/driving/${longitude},${latitude};${coordinates[0]},${coordinates[1]}`, {
                    params: {
                      geometries: "geojson",
                      access_token: mapboxgl.accessToken,
                    },
                  })
                  .then((directionsResponse) => {
                    const route = directionsResponse.data.routes[0].geometry;
                    const lengthInKm = (directionsResponse.data.routes[0].distance / 1000).toFixed(2);

                    setRouteLength(lengthInKm);

                    const routeSourceId = "route";

                    // Check if the source already exists
                    if (map.getSource(routeSourceId)) {
                      map.removeLayer(routeSourceId);
                      map.removeSource(routeSourceId);
                    }

                    map.addSource(routeSourceId, {
                      type: "geojson",
                      data: {
                        type: "Feature",
                        geometry: route,
                      },
                    });

                    map.addLayer({
                      id: routeSourceId,
                      type: "line",
                      source: routeSourceId,
                      paint: {
                        "line-width": 2,
                        "line-color": "blue",
                      },
                    });

                    const popupContent = `
                      <h3>${title}</h3>
                      <p>Operator: ${operator}</p>
                      <p>Address: ${address}</p>
                      <p>Route Length: ${lengthInKm} km</p>
                      <a href="https://www.google.com/maps/dir/?api=1&destination=${coordinates[1]},${coordinates[0]}" target="_blank" rel="noopener noreferrer" class="inline-block align-middle text-center select-none border font-normal whitespace-no-wrap rounded py-1 px-3 leading-normal no-underline bg-blue-600 text-white hover:bg-blue-600">Start Navigation</a>
                    `;

                    const popup = new mapboxgl.Popup()
                      .setLngLat(coordinates)
                      .setHTML(popupContent);

                    popup.addTo(map);
                  })
                  .catch((error) => {
                    console.error("Error fetching route: ", error);
                  });
              });

              map.on("mouseenter", "charging-station-markers", () => {
                map.getCanvas().style.cursor = "pointer";
              });

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

    return () => {
      if (map) {
        map.remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <NavigationBar />
      <div id="map" style={{ flex: 1 }}></div>
    </div>
  );
};

export default UserHome;
