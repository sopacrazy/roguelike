import React, { useRef, useState } from 'react';
import { Wind } from 'lucide-react';
import { touchInput } from '../game/TouchInputState';
import { useIsMobileLayout } from './useIsMobileLayout';

// Touch controls for mobile: a floating/dynamic joystick that spawns
// wherever the player first touches (instead of a fixed corner), so it
// works comfortably from anywhere on screen, plus a fixed dash button. The
// bow auto-aims and fires at the nearest enemy on its own (see
// Player.update) - there's no fire button, the player only has to worry
// about positioning and dodging. Desktop keeps mouse aim + click to shoot.
export const TouchControls: React.FC = () => {
  const isMobile = useIsMobileLayout();
  const knobRef = useRef<HTMLDivElement>(null);
  const activePointerId = useRef<number | null>(null);
  const centerRef = useRef<{ x: number; y: number } | null>(null);
  const [joystickCenter, setJoystickCenter] = useState<{ x: number; y: number } | null>(null);

  const KNOB_RADIUS = 40; // max travel distance of the knob, in px

  const handleZonePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== null) return; // one joystick touch at a time
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    const center = { x: e.clientX, y: e.clientY };
    centerRef.current = center;
    setJoystickCenter(center);
    touchInput.moveX = 0;
    touchInput.moveY = 0;
  };

  const handleZonePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId || !centerRef.current) return;

    let dx = e.clientX - centerRef.current.x;
    let dy = e.clientY - centerRef.current.y;
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

  const handleZonePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (activePointerId.current !== e.pointerId) return;
    activePointerId.current = null;
    centerRef.current = null;
    setJoystickCenter(null);
    touchInput.moveX = 0;
    touchInput.moveY = 0;
  };

  if (!isMobile) return null;

  return (
    <div className="absolute inset-0 z-20">
      {/* Movement zone - covers the whole screen; the joystick appears
          centered on wherever the player first touches. The dash button
          below sits later in the DOM so it wins hit-testing over this. */}
      <div
        onPointerDown={handleZonePointerDown}
        onPointerMove={handleZonePointerMove}
        onPointerUp={handleZonePointerUp}
        onPointerCancel={handleZonePointerUp}
        className="pointer-events-auto absolute inset-0 touch-none"
      />

      {/* Joystick visual - only rendered while a finger is actively holding it */}
      {joystickCenter && (
        <>
          <div
            className="pointer-events-none absolute w-24 h-24 -ml-12 -mt-12 rounded-full bg-slate-950/70 border-4 border-black"
            style={{ left: joystickCenter.x, top: joystickCenter.y }}
          />
          <div
            ref={knobRef}
            className="pointer-events-none absolute w-10 h-10 -ml-5 -mt-5 rounded-full bg-slate-300 border-2 border-black"
            style={{ left: joystickCenter.x, top: joystickCenter.y }}
          />
        </>
      )}

      {/* Dash button - fixed, bottom right */}
      <button
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          touchInput.dashRequested = true;
        }}
        className="pixel-btn pointer-events-auto absolute bottom-8 right-6 w-20 h-20 rounded-full bg-cyan-700 active:bg-cyan-600 text-slate-950 flex flex-col items-center justify-center touch-none"
      >
        <Wind className="w-7 h-7" />
        <span className="text-[9px] font-pixel mt-1">DASH</span>
      </button>
    </div>
  );
};
