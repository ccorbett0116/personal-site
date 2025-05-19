// ✅ ParticlesBackground.tsx
"use client";
import { useEffect, useRef } from "react";
import { tsParticles } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";
import { ParticleConfig } from "@/types";

type Props = {
    config: ParticleConfig;
    sidebarOpen: boolean;
    shouldRefresh: boolean;
    onRefreshDone: () => void;
};

export default function ParticlesBackground({ config, sidebarOpen, shouldRefresh, onRefreshDone }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);

    // Load particles once
    useEffect(() => {
        loadSlim(tsParticles).then(() => {
            tsParticles.load({
                id: "tsparticles",
                options: {
                    fullScreen: { enable: true, zIndex: -1 },
                    background: { color: { value: "#000000" } },
                    particles: {
                        number: {
                            value: config.particleCount,
                            density: { enable: true, width: 800, height: 800 },
                        },
                        color: {
                            value: {
                                h: { min: config.hueMin, max: config.hueMax },
                                s: { min: config.saturationMin, max: config.saturationMax },
                                l: { min: config.lightnessMin, max: config.lightnessMax },
                            },
                        },
                        shape: { type: "circle" },
                        opacity: { value: 0.8 },
                        size: {
                            value: { min: config.minSize, max: config.maxSize },
                        },
                        move: {
                            enable: true,
                            speed: config.particleSpeed,
                            random: true,
                            direction: "none",
                            outModes: { default: "bounce" },
                            gravity: {
                                enable: config.gravity > 0,
                                acceleration: config.gravity,
                            },
                        },
                        collisions: {
                            enable: config.enableCollisions,
                            mode: "bounce",
                            overlap: { enable: false },
                            bounce: {
                                horizontal: { value: config.bounceStrength },
                                vertical: { value: config.bounceStrength },
                            },
                        },
                    },
                    interactivity: {
                        detectsOn: "canvas",
                        events: {
                            onHover: { enable: true, mode: "repulse" },
                            onClick: { enable: true, mode: "push" },
                        },
                        modes: {
                            repulse: {
                                distance: 100,
                                speed: config.repulsionSpeed,
                                factor: config.repulsionStrength,
                                maxSpeed: 60,
                                easing: "ease-out-quad",
                            },
                            push: { quantity: 4 },
                        },
                    },
                    detectRetina: true,
                },
            });
        });
    }, []);

    // Animate background squish in sync
    useEffect(() => {
        const wrapper = containerRef.current;
        if (!wrapper) return;

        const screenWidth = window.innerWidth;
        const sidebarWidth = sidebarOpen ? 256 : 0; // 16rem = 256px
        const scaleX = (screenWidth - sidebarWidth) / screenWidth;

        wrapper.style.transition = "transform 300ms ease-in-out";
        wrapper.style.transformOrigin = "right";
        wrapper.style.transform = `scaleX(${scaleX})`;
    }, [sidebarOpen]);

    // Refresh particles only when requested
    useEffect(() => {
        if (!shouldRefresh) return;

        const container = tsParticles.domItem(0);
        if (!container) return;

        const opts = container.options;
        opts.particles.number.value = config.particleCount;
        opts.particles.size.value = { min: config.minSize, max: config.maxSize };
        opts.particles.move.speed = config.particleSpeed;
        opts.particles.color.value = {
            h: { min: config.hueMin, max: config.hueMax },
            s: { min: config.saturationMin, max: config.saturationMax },
            l: { min: config.lightnessMin, max: config.lightnessMax },
        };
        opts.particles.collisions.enable = config.enableCollisions;
        opts.particles.collisions.bounce.horizontal.value = config.bounceStrength;
        opts.particles.collisions.bounce.vertical.value = config.bounceStrength;
        opts.particles.move.gravity.enable = config.gravity > 0;
        opts.particles.move.gravity.acceleration = config.gravity;
        // Force cast to safe shape manually
        const repulse = opts.interactivity.modes.repulse as {
            speed: number;
            factor: number;
        };

        repulse.speed = config.repulsionSpeed;
        repulse.factor = config.repulsionStrength;



        container.refresh();
        onRefreshDone();
    }, [shouldRefresh]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-[-1]"
            id="tsparticles-wrapper"
        >
            <div className="fixed inset-0 z-[-2] bg-black" aria-hidden="true" />
            <div id="tsparticles" />
        </div>
    );
}