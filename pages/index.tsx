// ✅ pages/index.tsx
"use client";
import { useState } from "react";
import ParticlesBackground from "@/components/ParticlesBackground";
import Sidebar from "@/components/Sidebar";
import { ParticleConfig } from "@/types";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const [config, setConfig] = useState<ParticleConfig>({
    particleCount: 100,
    particleSpeed: 2,
    bounceStrength: 0.5,
    enableCollisions: true,
    gravity: 0,
    minSize: 2,
    maxSize: 6,
    repulsionStrength: 150,
    repulsionSpeed: 1.5,
    hueMin: 0,
    hueMax: 360,
    saturationMin: 50,
    saturationMax: 100,
    lightnessMin: 40,
    lightnessMax: 80,
  });

  return (
      <main className="relative min-h-screen transition-all duration-300 ease-in-out">
        <ParticlesBackground
            config={config}
            sidebarOpen={sidebarOpen}
            shouldRefresh={shouldRefresh}
            onRefreshDone={() => setShouldRefresh(false)}
        />
        <Sidebar
            config={config}
            setConfig={(newConfig) => {
              setConfig(newConfig);
              setShouldRefresh(true);
            }}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
        />
      </main>
  );
}