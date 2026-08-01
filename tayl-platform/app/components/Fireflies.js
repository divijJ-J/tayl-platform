'use client';
import { useEffect, useRef } from 'react';

// Small firefly-shaped particles drifting behind the app content: a dark
// body, two fluttering grey wings, and a glowing tail light. Runs on a
// single canvas with requestAnimationFrame — no React state per frame.
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

    const GLOW_COLORS = ['#8FF7B0', '#B6FFCB', '#A78BFA']; // mostly green, a couple violet to tie into the theme
    const COUNT = 14;

    const flies = Array.from({ length: COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: 4.5 + Math.random() * 2.5,
      color: GLOW_COLORS[Math.floor(Math.random() * GLOW_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      flickerSpeed: 0.008 + Math.random() * 0.015,
      wingPhase: Math.random() * Math.PI * 2,
      wingSpeed: 0.35 + Math.random() * 0.25,
      wanderSeed: Math.random() * 1000,
      heading: Math.random() * Math.PI * 2,
    }));

    let raf;
    let t = 0;

    const tick = () => {
      t += 1;
      ctx.clearRect(0, 0, width, height);

      for (const f of flies) {
        f.vx += Math.sin((t + f.wanderSeed) * 0.01) * 0.006;
        f.vy += Math.cos((t + f.wanderSeed) * 0.013) * 0.006;

        const speed = Math.hypot(f.vx, f.vy);
        const maxSpeed = 0.55;
        if (speed > maxSpeed) {
          f.vx = (f.vx / speed) * maxSpeed;
          f.vy = (f.vy / speed) * maxSpeed;
        }

        f.x += f.vx;
        f.y += f.vy;

        if (f.x < 0) { f.x = 0; f.vx *= -1; }
        if (f.x > width) { f.x = width; f.vx *= -1; }
        if (f.y < 0) { f.y = 0; f.vy *= -1; }
        if (f.y > height) { f.y = height; f.vy *= -1; }

        // Smoothly turn to face the direction of travel instead of snapping.
        if (speed > 0.02) {
          const target = Math.atan2(f.vy, f.vx);
          let diff = target - f.heading;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          f.heading += diff * 0.08;
        }

        f.phase += f.flickerSpeed;
        f.wingPhase += f.wingSpeed;
        const glow = 0.5 + Math.sin(f.phase) * 0.35;
        const wingFlutter = Math.sin(f.wingPhase); // -1..1
        const s = f.size;

        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.heading);

        // Wings — small grey translucent ellipses, fluttering open/closed.
        ctx.fillStyle = 'rgba(200,200,210,0.35)';
        const wingSpread = 0.5 + Math.abs(wingFlutter) * 0.4;
        ctx.save();
        ctx.rotate(-wingSpread);
        ctx.beginPath();
        ctx.ellipse(-s * 0.1, 0, s * 0.9, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.rotate(wingSpread);
        ctx.beginPath();
        ctx.ellipse(-s * 0.1, 0, s * 0.9, s * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Body — small dark oval, head at the front (direction of travel).
        ctx.fillStyle = 'rgba(20,20,24,0.9)';
        ctx.beginPath();
        ctx.ellipse(0, 0, s * 0.55, s * 0.32, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing tail light at the rear.
        ctx.globalAlpha = Math.max(0.25, glow);
        ctx.shadowBlur = 10;
        ctx.shadowColor = f.color;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(-s * 0.55, 0, s * 0.28, 0, Math.PI * 2);
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
