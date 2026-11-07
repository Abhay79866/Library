import React from 'react';
import { Seat } from '../types';
import { Wrench, UserCheck } from 'lucide-react';

interface SeatCardProps {
  seat: Seat;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
  isHighlighted?: boolean;
}

export const SeatCard: React.FC<SeatCardProps> = ({
  seat,
  isSelected,
  onSelect,
  isHighlighted = false,
}) => {
  // Determine styles strictly following specification:
  // Available: Warm white/beige (#F3F0EA, border #E5E1D8)
  // Booked (Monthly): Soft muted clay/red (#E2A9A1)
  // Maintenance: Light grey (#E5E7EB)
  let bgClass = '';
  let borderClass = '';
  let textClass = '';
  let hoverClass = '';

  if (seat.status === 'booked') {
    bgClass = 'bg-[#E2A9A1]';
    borderClass = 'border-[#D5988F]';
    textClass = 'text-[#2C2C2C] font-bold';
    hoverClass = 'hover:brightness-95 hover:shadow-xs';
  } else if (seat.status === 'maintenance') {
    bgClass = 'bg-[#E5E7EB]';
    borderClass = 'border-[#D1D5DB]';
    textClass = 'text-[#6B7280] font-medium';
    hoverClass = 'cursor-not-allowed opacity-80';
  } else {
    // Available
    bgClass = 'bg-[#F3F0EA]';
    borderClass = 'border-[#E5E1D8]';
    textClass = 'text-[#2C2C2C] font-semibold';
    hoverClass = 'hover:bg-white hover:border-[#C4BDB0] hover:shadow-xs hover:scale-105 active:scale-95';
  }

  const selectedRingClass = isSelected
    ? 'ring-2 ring-[#2C2C2C] ring-offset-2 border-[#2C2C2C] scale-105 shadow-xs'
    : '';

  const highlightClass = isHighlighted
    ? 'ring-3 ring-[#A87B42] scale-110 z-10 animate-pulse'
    : '';

  return (
    <button
      onClick={() => onSelect(seat)}
      disabled={seat.status === 'maintenance'}
      title={
        seat.status === 'booked'
          ? `${seat.seatCode} • Booked by ${seat.studentName || 'Student'} (${seat.studentPhone || 'No phone'})`
          : seat.status === 'maintenance'
          ? `${seat.seatCode} • Under Maintenance`
          : `${seat.seatCode} • Available (Click to assign)`
      }
      className={`group relative flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl border transition-all duration-200 select-none ${bgClass} ${borderClass} ${hoverClass} ${selectedRingClass} ${highlightClass}`}
    >
      {/* Top Desk Lip (BookMyShow / theater chair motif with subtle modern desk notch) */}
      <div
        className={`w-7 sm:w-8 h-1 rounded-full mb-1 transition-colors ${
          seat.status === 'booked'
            ? 'bg-[#C7867E]'
            : seat.status === 'maintenance'
            ? 'bg-[#CBD5E1]'
            : 'bg-[#E2DDD3] group-hover:bg-[#C4BDB0]'
        }`}
      />

      {/* ONLY display Seat ID as explicitly demanded in the prompt */}
      <span className={`text-[11px] sm:text-xs tracking-tight ${textClass}`}>
        {seat.seatCode}
      </span>

      {/* Subtle indicator icon on top right for booked / maintenance */}
      {seat.status === 'booked' && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#2C2C2C] text-[#FAF9F6] flex items-center justify-center shadow-xs">
          <UserCheck className="w-2 h-2" />
        </span>
      )}

      {seat.status === 'maintenance' && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#9CA3AF] text-white flex items-center justify-center shadow-xs">
          <Wrench className="w-2 h-2" />
        </span>
      )}
    </button>
  );
};
