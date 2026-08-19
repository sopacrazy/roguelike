import React from 'react';

// The pack's icon sheet is a 16x27 grid of 32px pixel-art icons
// (public/icons/rpg-icons.png, 512x867px). Renders one cell via
// background-position instead of managing dozens of cropped image files.
const SHEET_URL = '/icons/rpg-icons.png';
const CELL = 32;
const SHEET_WIDTH = 512;
const SHEET_HEIGHT = 867;

interface PixelIconProps {
  col: number;
  row: number;
  size?: number;
  className?: string;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ col, row, size = 32, className }) => {
  const scale = size / CELL;
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(${SHEET_URL})`,
        backgroundPosition: `-${col * CELL * scale}px -${row * CELL * scale}px`,
        backgroundSize: `${SHEET_WIDTH * scale}px ${SHEET_HEIGHT * scale}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};
