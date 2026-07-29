'use client';
import { useEffect, useRef } from 'react';

// Follows the cursor with a soft glow. Uses refs + rAF instead of React state,
// so mouse movement never triggers a re-render — just a direct style mutation.
export default function CursorGlow() {
  const dotRef = useRef(null);
  const pos = useRef({ x: -500, y: -500 });
  const eased = useRef({ x: -500, y: -500 });
  const rafId = useRef(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const handleMove = (e) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMove, { passive: true });

    const tick = () => {
      // Simple lerp for a soft trailing feel, cheap per-frame math only.
      eased.current.x += (pos.current.x - eased.current.x) * 0.15;
      eased.current.y += (pos.current.y - eased.current.y) * 0.15;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${eased.current.x}px, ${eased.current.y}px, 0)`;
      }
      rafId.current = requestAnimationFrame(tick);
    };
    rafId.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return <div ref={dotRef} className="cursor-glow" aria-hidden />;
}
