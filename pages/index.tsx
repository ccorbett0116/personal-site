"use client";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import { useControls, Leva } from "leva";

export default function ParticlesBackground() {
  const [engineLoaded, setEngineLoaded] = useState(false);

  // Live controls for particle physics and colors
  const {
    particleCount,
    particleSpeed,
    bounce,
    gravity,
    minSize,
    maxSize,
    hueMin,
    hueMax,
    satMin,
    satMax,
    lightMin,
    lightMax
  } = useControls("Particles", {
    particleCount: { value: 100, min: 10, max: 500, step: 1 },
    particleSpeed: { value: 2, min: 0.1, max: 10, step: 0.1 },
    bounce: { value: 1, min: 0, max: 2, step: 0.1 },
    gravity: { value: 0, min: 0, max: 1, step: 0.01 },
    minSize: { value: 2, min: 1, max: 30, step: 1 },
    maxSize: { value: 6, min: 1, max: 30, step: 1 },
    hueMin: { value: 0, min: 0, max: 360, step: 1 },
    hueMax: { value: 360, min: 0, max: 360, step: 1 },
    satMin: { value: 50, min: 0, max: 100, step: 1 },
    satMax: { value: 100, min: 0, max: 100, step: 1 },
    lightMin: { value: 40, min: 0, max: 100, step: 1 },
    lightMax: { value: 80, min: 0, max: 100, step: 1 }
  });

  // Initialize tsParticles engine once on mount
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadFull(engine);
    }).then(() => setEngineLoaded(true));
  }, []);

  // Particle configuration bound to controls
  const options = {
    fullScreen: { enable: true, zIndex: -1 },
    background: { color: "#000" },
    fpsLimit: 60,
    particles: {
      number: { value: particleCount, density: { enable: true, area: 800 } },
      color: {
        value: {
          h: { min: hueMin, max: hueMax },
          s: { min: satMin, max: satMax },
          l: { min: lightMin, max: lightMax }
        }
      },
      shape: { type: "circle" },
      opacity: { value: 0.8, random: { enable: true, minimumValue: 0.3 } },
      size: { value: { min: minSize, max: maxSize }, random: true },
      move: {
        enable: true,
        speed: particleSpeed,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
        gravity: { enable: gravity > 0, acceleration: gravity }
      },
      collisions: { enable: true }
    },
    interactivity: {
      detectsOn: "canvas",
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" }
      },
      modes: { repulse: { distance: 100, speed: 0.8 }, push: { quantity: 4 } }
    },
    detectRetina: true
  };

  return (
      <>
        {/* Leva control panel */}
        <div className="fixed top-4 right-4 z-20 p-2 bg-black/50 rounded">
          <Leva collapsed={false} />
        </div>

        {/* Render particles once engine is ready */}
        {engineLoaded && <Particles id="tsparticles" options={options} />}
      </>
  );
}