'use client';
import { useEffect, useRef } from 'react';

// Small glowing "firefly" particles drifting behind the app content.
// Runs on a single canvas with requestAnimationFrame — no React state per
// frame, so this doesn't cost re-renders. Particles gently wander and bounce
// off the edges of the viewport.
export default function Fireflies() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const COLORS = ['#8FF7B0', '#B6FFCB', '#A78BFA']; // mostly green, a couple of violet ones to tie into the theme
    const COUNT = 14;

    const flies = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.4 + Math.random() * 1.6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      flickerSpeed: 0.008 + Math.random() * 0.015,
      wanderSeed: Math.random() * 1000,
    }));

    let raf;
    let t = 0;

    const tick = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);

      for (const f of flies) {
        // Gentle organic wander, layered on top of a base drift direction.
        f.vx += Math.sin((t + f.wanderSeed) * 0.01) * 0.006;
        f.vy += Math.cos((t + f.wanderSeed) * 0.013) * 0.006;

        // Cap speed so it stays gentle.
        const speed = Math.hypot(f.vx, f.vy);
        const maxSpeed = 0.6;
        if (speed > maxSpeed) {
          f.vx = (f.vx / speed) * maxSpeed;
          f.vy = (f.vy / speed) * maxSpeed;
        }

        f.x += f.vx;
        f.y += f.vy;

        // Bounce off the edges — the "colliding with the screen" effect.
        if (f.x < 0) { f.x = 0; f.vx *= -1; }
        if (f.x > width) { f.x = width; f.vx *= -1; }
        if (f.y < 0) { f.y = 0; f.vy *= -1; }
        if (f.y > height) { f.y = height; f.vy *= -1; }

        // Flicker glow intensity, like a real firefly.
        f.phase += f.flickerSpeed;
        const glow = 0.45 + Math.sin(f.phase) * 0.35;

        ctx.save();
        ctx.globalAlpha = Math.max(0.15, glow);
        ctx.shadowBlur = 12;
        ctx.shadowColor = f.color;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
