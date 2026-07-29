'use client';
import { useRef } from 'react';

// Wrap any card content to get a subtle 3D tilt that follows the cursor.
// Transform is written directly to the DOM node (no setState), so hovering
// doesn't cost a React render per mouse move.
export default function TiltCard({ children, className = '' }) {
  const innerRef = useRef(null);

  const handleMove = (e) => {
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rotateY = px * 10; // left/right tilt
    const rotateX = -py * 10; // up/down tilt
    el.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
    el.style.boxShadow = `${-px * 18}px ${py * 18 + 10}px 30px rgba(30,41,59,0.10)`;
  };

  const handleLeave = () => {
    const el = innerRef.current;
    if (!el) return;
    el.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
    el.style.boxShadow = '';
  };

  return (
    <div className={`tilt-wrap ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div ref={innerRef} className="tilt-inner h-full">
        {children}
      </div>
    </div>
  );
}
