// pages/index.tsx
"use client";
import { useState } from "react";
import ParticlesBackground from "@/components/ParticlesBackground";
import Sidebar from "@/components/Sidebar";
import { ParticleConfig } from "@/types";

export default function Home() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [shouldRefresh, setShouldRefresh] = useState(false);

    const [config, setConfig] = useState<ParticleConfig>({
        particleCount: 50,
        particleSpeed: 2,
        bounceStrength: 0.5,
        enableCollisions: true,
        gravity: 0,
        minSize: 1,
        maxSize: 3,
        repulsionStrength: 50,
        repulsionSpeed: 0.5,
        hueMin: 0,
        hueMax: 360,
        saturationMin: 50,
        saturationMax: 100,
        lightnessMin: 40,
        lightnessMax: 80,
        enableRepulsion: true,
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
                {/* Use fixed positioning with flexbox - works on Samsung browser */}
                <div className="fixed inset-0 z-10 flex items-center justify-center px-4">
                    <h1 className="text-white text-6xl font-bold text-center w-4/5">
                        Cole Corbett
                    </h1>
                </div>
            </ParticlesBackground>

            {/* Sidebar is outside and not affected by the transform */}
            <aside className="fixed top-0 left-0 h-full z-20">
                <Sidebar
                    config={config}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                    setConfig={(cfg) => {
                        setConfig(cfg);
                        setShouldRefresh(true);
                    }}
                />
            </aside>
        </>
    );
}