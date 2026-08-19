import React, { useRef } from 'react';
import { Shield } from 'lucide-react';
import { touchInput } from '../game/TouchInputState';
import { useIsMobileLayout } from './useIsMobileLayout';

// Touch controls for mobile: just a virtual joystick to move, and a dash
// button. The bow auto-aims and fires at the nearest enemy on its own (see
// Player.update) - there's no fire button, the player only has to worry
// about positioning and dodging. Desktop keeps mouse aim + click to shoot.
export const TouchControls: React.FC = () => {
  const isMobile = useIsMobileLayout();
  const baseRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);

  const KNOB_RADIUS = 40; // max travel distance of the knob, in px

  const resetKnob = () => {
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    touchInput.moveX = 0;
    touchInput.moveY = 0;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    updateKnob(e);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    updateKnob(e);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
    resetKnob();
  };

  const updateKnob = (e: React.PointerEvent<HTMLDivElement>) => {
    const base = baseRef.current;
    if (!base) return;
    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = e.clientX - centerX;
    let dy = e.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    if (dist > KNOB_RADIUS) {
      dx = (dx / dist) * KNOB_RADIUS;
      dy = (dy / dist) * KNOB_RADIUS;
    }

    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
    }

    touchInput.moveX = dx / KNOB_RADIUS;
    touchInput.moveY = dy / KNOB_RADIUS;
  };

  if (!isMobile) return null;

  return (
    <div className="absolute inset-0 z-20">
      {/* Movement joystick - bottom left */}
      <div
        ref={baseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="pointer-events-auto absolute bottom-6 left-6 w-24 h-24 rounded-full bg-slate-950/70 border-4 border-black touch-none"
      >
        <div
          ref={knobRef}
          className="absolute top-1/2 left-1/2 w-10 h-10 -mt-5 -ml-5 rounded-full bg-slate-300 border-2 border-black pointer-events-none"
        />
      </div>

      {/* Dash button - bottom right */}
      <button
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          touchInput.dashRequested = true;
        }}
        className="pixel-btn pointer-events-auto absolute bottom-8 right-6 w-20 h-20 rounded-full bg-cyan-700 active:bg-cyan-600 text-slate-950 flex flex-col items-center justify-center touch-none"
      >
        <Shield className="w-7 h-7" />
        <span className="text-[9px] font-pixel mt-1">DASH</span>
      </button>
    </div>
  );
};
