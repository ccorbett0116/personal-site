"use client";
import { useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { Engine } from "@tsparticles/engine"; // Correct Engine import
import { loadSlim } from "@tsparticles/slim";
import { useControls, Leva } from "leva";

export default function ParticlesBackground() {
  const [engineLoaded, setEngineLoaded] = useState(false);

  // Live controls
  const controls = useControls("Particles", {
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

  // Initialize particles engine
  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine);
    }).then(() => setEngineLoaded(true));
  }, []);

  // Dynamic options configuration
  const options: any = {
    fullScreen: { enable: true, zIndex: -1 },
    background: { color: "#000" },
    fpsLimit: 60,
    particles: {
      number: {
        value: controls.particleCount,
        density: { enable: true, area: 800 }
      },
      color: {
        value: {
          h: { min: controls.hueMin, max: controls.hueMax },
          s: { min: controls.satMin, max: controls.satMax },
          l: { min: controls.lightMin, max: controls.lightMax }
        }
      },
      shape: { type: "circle" },
      opacity: { value: 0.8, random: { enable: true, minimumValue: 0.3 } },
      size: {
        value: {
          min: controls.minSize,
          max: controls.maxSize
        },
        random: true
      },
      move: {
        enable: true,
        speed: controls.particleSpeed,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
        gravity: {
          enable: controls.gravity > 0,
          acceleration: controls.gravity
        }
      },
      collisions: {
        enable: true,
        bounce: {
          horizontal: {
            value: controls.bounce
          },
          vertical: {
            value: controls.bounce
          }
        }
      }
    },
    interactivity: {
      detectsOn: "window",
      events: {
        onHover: { enable: true, mode: "repulse" },
        onClick: { enable: true, mode: "push" }
      },
      modes: {
        repulse: { distance: 100, speed: 0.8 },
        push: { quantity: 4 }
      }
    },
    detectRetina: true
  };

  return (
      <>
        <div className="fixed top-4 right-4 z-20 p-2 bg-black/50 rounded">
          <Leva collapsed={false} />
        </div>

        {engineLoaded && <Particles id="tsparticles" options={options} />}
      </>
  );
}