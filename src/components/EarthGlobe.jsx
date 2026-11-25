
import React, { useEffect, useRef, useState } from "react";
import Globe from "react-globe.gl";

export default function EarthGlobe({ weather }) {
  const globeRef = useRef(null);

  const [size, setSize] = useState(390);
  const [globeReady, setGlobeReady] = useState(false);

  // Responsive Earth size
  useEffect(() => {
    const container = document.querySelector(".earth-stage");

    if (!container) return;

    const resize = () => {
      setSize(
        Math.min(
          470,
          Math.max(260, container.clientWidth || 390)
        )
      );
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  // City location marker
  const marker =
    weather?.coord
      ? [
          {
            lat: weather.coord.lat,
            lng: weather.coord.lon,
            name: weather.name,
          },
        ]
      : [];

  // Animated radar rings
  const rings =
    weather?.coord
      ? [
          {
            lat: weather.coord.lat,
            lng: weather.coord.lon,
          },
        ]
      : [];

  // Smooth zoom to searched city
  useEffect(() => {
    if (!weather?.coord || !globeRef.current || !globeReady) {
      return;
    }

    globeRef.current.pointOfView(
      {
        lat: weather.coord.lat,
        lng: weather.coord.lon,
        altitude: 1.6,
      },
      2000
    );
  }, [weather, globeReady]);

  return (
    <div className="earth-stage">

      {/* Decorative orbits */}
      <div className="orbit orbit-a"></div>
      <div className="orbit orbit-b"></div>

      {/* 3D Earth */}
      <Globe
        ref={globeRef}

        width={size}
        height={size * 0.86}

        backgroundColor="rgba(0,0,0,0)"

        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"

        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"

        showAtmosphere={true}
        atmosphereColor="#54c9f0"
        atmosphereAltitude={0.18}

        showGraticules={true}

        // Location marker
        pointsData={marker}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => "#00eaff"}
        pointAltitude={0.02}
        pointRadius={0.35}
        pointLabel="name"

        // Animated radar effect
        ringsData={rings}
        ringLat="lat"
        ringLng="lng"
        ringColor={() => "#00eaff"}
        ringMaxRadius={2.5}
        ringPropagationSpeed={1.5}
        ringRepeatPeriod={1200}

        // Globe interaction
        enablePointerInteraction={true}

        // Start zooming after the globe loads
        onGlobeReady={() => setGlobeReady(true)}
      />

      {/* Bottom caption */}
      <span className="earth-caption">
        ● LIVE PLANET VIEW · DRAG TO ROTATE
      </span>

    </div>
  );
}
