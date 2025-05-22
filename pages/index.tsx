// pages/index.tsx
"use client";
import { useState } from "react";
import ParticlesBackground from "@/components/ParticlesBackground";
import Sidebar from "@/components/Sidebar";
import { ParticleConfig } from "@/types";

// Example additional components to demonstrate squish

export default function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [shouldRefresh, setShouldRefresh] = useState(false);

    const [config, setConfig] = useState<ParticleConfig>({
        particleCount: 100,
        particleSpeed: 2,
        bounceStrength: 0.5,
        enableCollisions: true,
        gravity: 0,
        minSize: 1,
        maxSize: 3,
        repulsionStrength: 100,
        repulsionSpeed: 0.5,
        hueMin: 0,
        hueMax: 360,
        saturationMin: 50,
        saturationMax: 100,
        lightnessMin: 40,
        lightnessMax: 80,
    });


    return (
        <>
            {/* Background & squishable content */}
            <ParticlesBackground
                config={config}
                sidebarOpen={sidebarOpen}
                shouldRefresh={shouldRefresh}
                onRefreshDone={() => setShouldRefresh(false)}
            >
                <div className="relative z-10 flex flex-col items-center justify-center h-dvh space-y-6 px-4 text-center">
                    <h1 className="text-white text-6xl font-bold">Cole Corbett</h1>
                </div>
            </ParticlesBackground>

            {/* Sidebar is outside and not affected by the transform */}
            <aside className="fixed top-0 left-0 h-full z-20">
                <Sidebar
                    config={config}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    setConfig={(cfg) => {
                        setConfig(cfg);            // <-- Now actually updates config
                        setShouldRefresh(true);
                    }}
                />
            </aside>
        </>
    );
}
