"use client";
import { useState, useEffect } from "react";
import { ParticleConfig } from "@/types";

type Props = {
    config: ParticleConfig;
    onChange?: (key: keyof ParticleConfig, value: any) => void; // ⬅️ make optional
    setConfig: (c: ParticleConfig) => void;
    sidebarOpen: boolean;
    setSidebarOpen: (v: boolean) => void;
};


export default function Sidebar({ config, setConfig, sidebarOpen, setSidebarOpen }: Props) {
    const [pendingConfig, setPendingConfig] = useState<ParticleConfig>(config);

    useEffect(() => {
        setPendingConfig(config); // Sync when config updates externally
    }, [config]);

    const updatePending = (key: keyof ParticleConfig, value: any) => {
        setPendingConfig(prev => ({ ...prev, [key]: value }));
    };

    const applyChanges = () => {
        setConfig(pendingConfig);
    };

    return (
        <>
            {/* Sidebar Panel */}
            <div
                id="sidebar"
                className="fixed top-0 left-0 h-full z-20 bg-gray-800 bg-opacity-90 text-white overflow-y-auto transition-all duration-300 ease-in-out"
                style={{
                    width: sidebarOpen ? "16rem" : "0rem",
                    minWidth: 0,
                    overflow: "hidden",
                }}
            >
                <div className={`p-4 ${!sidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
                    <h2 className="text-xl font-bold mb-4">Particle Controls</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Particle Count ({pendingConfig.particleCount})</label>
                            <input type="range" min="10" max="500" value={pendingConfig.particleCount} onChange={e => updatePending("particleCount", +e.target.value)} className="w-full" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Speed ({pendingConfig.particleSpeed})</label>
                            <input type="range" min="0.1" max="10" step="0.1" value={pendingConfig.particleSpeed} onChange={e => updatePending("particleSpeed", +e.target.value)} className="w-full" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Min Size</label>
                                <input type="range" min="1" max="30" value={pendingConfig.minSize} onChange={e => updatePending("minSize", +e.target.value)} className="w-full" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Max Size</label>
                                <input type="range" min="1" max="30" value={pendingConfig.maxSize} onChange={e => updatePending("maxSize", +e.target.value)} className="w-full" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs mb-1">Hue Min</label>
                                <input type="range" min="0" max="360" value={pendingConfig.hueMin} onChange={e => updatePending("hueMin", +e.target.value)} className="w-full" />
                            </div>
                            <div>
                                <label className="block text-xs mb-1">Hue Max</label>
                                <input type="range" min="0" max="360" value={pendingConfig.hueMax} onChange={e => updatePending("hueMax", +e.target.value)} className="w-full" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" checked={pendingConfig.enableCollisions} onChange={e => updatePending("enableCollisions", e.target.checked)} />
                                <span>Enable Collisions</span>
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={pendingConfig.enableRepulsion}
                                    onChange={e => updatePending("enableRepulsion", e.target.checked)}
                                />
                                <span>Enable Repulsion</span>
                            </label>

                            {pendingConfig.enableRepulsion && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">
                                        Repulsion Strength ({pendingConfig.repulsionStrength})
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="500"
                                        step="10"
                                        value={pendingConfig.repulsionStrength}
                                        onChange={e => updatePending("repulsionStrength", +e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Apply Button */}
                        <div>
                            <button
                                onClick={applyChanges}
                                className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 transition text-white font-medium rounded"
                            >
                                Apply Changes
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`
          fixed top-1/2 -translate-y-1/2 z-30
          ${sidebarOpen ? "left-64" : "left-0"}
          p-2 bg-gray-800 bg-opacity-90 text-white rounded-r-md hover:bg-gray-700
          transition-all duration-300 ease-in-out
        `}
                style={{ width: "2rem" }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform duration-300 ${!sidebarOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fillRule="evenodd"
                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                        clipRule="evenodd"
                    />
                </svg>
            </button>
        </>
    );
}
