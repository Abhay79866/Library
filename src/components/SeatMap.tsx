import React, { useState, useMemo } from 'react';
import { Seat, LibraryLayoutElement } from '../types';
import { SeatCard } from './SeatCard';
import { Sparkles, Map as MapIcon, LayoutGrid, DoorOpen, Columns, BookMarked } from 'lucide-react';

interface SeatMapProps {
  seats: Seat[];
  layoutElements?: LibraryLayoutElement[];
  selectedSeat: Seat | null;
  onSeatClick: (seat: Seat) => void;
  searchQuery: string;
  selectedMonthLabel: string;
  selectedShiftLabel: string;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  seats,
  layoutElements = [],
  selectedSeat,
  onSeatClick,
  searchQuery,
  selectedMonthLabel,
  selectedShiftLabel,
}) => {
  // View toggle: 'spatial' (matches the Konva drag-and-drop floor plan) vs 'grid' (row lists)
  // Default to 'spatial' so changes made in the editor are immediately visible!
  const [viewMode, setViewMode] = useState<'spatial' | 'grid'>('spatial');

  // Compute stats for current view
  const total = seats.length;
  const booked = seats.filter((s) => s.status === 'booked').length;
  const available = seats.filter((s) => s.status === 'available').length;
  const occupancyRate = total > 0 ? Math.round((booked / total) * 100) : 0;

  // Map seats by seatCode or id for spatial rendering
  const seatLookup = useMemo(() => {
    const lookup = new globalThis.Map<string, Seat>();
    seats.forEach((s) => {
      lookup.set(s.id, s);
      lookup.set(s.seatCode.toLowerCase(), s);
    });
    return lookup;
  }, [seats]);

  // Group seats by row for grid view
  const rows = useMemo(() => {
    const rowMap = new globalThis.Map<string, Seat[]>();
    seats.forEach((seat) => {
      const existing = rowMap.get(seat.row) || [];
      existing.push(seat);
      rowMap.set(seat.row, existing);
    });

    const sortedRowKeys = Array.from(rowMap.keys()).sort();
    return sortedRowKeys.map((rowKey: string) => {
      const rowSeats = (rowMap.get(rowKey) || []).sort((a: Seat, b: Seat) => a.number - b.number);
      return {
        row: rowKey,
        seats: rowSeats,
      };
    });
  }, [seats]);

  // Calculate bounding box for spatial floorplan view
  const floorplanBounds = useMemo(() => {
    if (!layoutElements || layoutElements.length === 0) {
      return { width: 800, height: 580 };
    }
    let maxX = 800;
    let maxY = 580;
    layoutElements.forEach((el) => {
      if (el.x + el.width > maxX) maxX = el.x + el.width + 40;
      if (el.y + el.height > maxY) maxY = el.y + el.height + 40;
    });
    return { width: maxX, height: maxY };
  }, [layoutElements]);

  return (
    <div className="backdrop-blur-md bg-white/70 border border-white/40 rounded-3xl p-5 sm:p-7 shadow-xs relative overflow-hidden">
      
      {/* Top Bar: Floor Information, Occupancy & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#EAE6DF]/70 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#4A7C59] animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold text-[#2C2C2C]">
              Main Reading Hall (Floor 1)
            </h2>
            <span className="px-2 py-0.5 rounded-md bg-[#F3F0EA] border border-[#E5E1D8] text-[11px] font-semibold text-[#706B65]">
              Live Map
            </span>
          </div>
          <p className="text-xs text-[#706B65] mt-0.5">
            Viewing layout for <strong className="text-[#2C2C2C]">{selectedMonthLabel}</strong> •{' '}
            <strong className="text-[#2C2C2C]">{selectedShiftLabel}</strong>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Switcher: Spatial Floorplan vs Row Grid */}
          <div className="inline-flex p-0.5 rounded-xl bg-[#EFECE6] border border-[#E5E1D8] text-xs">
            <button
              onClick={() => setViewMode('spatial')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'spatial'
                  ? 'bg-white text-[#2C2C2C] shadow-xs'
                  : 'text-[#706B65] hover:text-[#2C2C2C]'
              }`}
              title="Spatial Floor Plan layout from Editor"
            >
              <MapIcon className="w-3.5 h-3.5 text-[#A87B42]" />
              <span>Architectural Floorplan</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#2C2C2C] shadow-xs'
                  : 'text-[#706B65] hover:text-[#2C2C2C]'
              }`}
              title="Categorized Row list view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Row Pods</span>
            </button>
          </div>

          {/* Occupancy Indicator */}
          <div className="hidden md:flex items-center space-x-3 text-xs bg-[#FAF9F6] border border-[#E5E1D8] px-3 py-1.5 rounded-xl">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-[#8C857B]">Occupancy</span>
              <span className="font-bold text-[#2C2C2C]">
                {occupancyRate}% ({booked}/{total})
              </span>
            </div>
            <div className="w-14 h-2 bg-[#E5E1D8] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#E2A9A1] transition-all duration-500 rounded-full"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BookMyShow Style "Quiet Zone / Librarian Desk" Top Bar */}
      <div className="my-6 flex flex-col items-center">
        <div className="w-full max-w-xl h-2 bg-gradient-to-r from-transparent via-[#D1CCC1] to-transparent rounded-full shadow-2xs" />
        <div className="relative -top-1 px-4 py-0.5 rounded-full bg-[#FAF9F6] border border-[#E5E1D8] text-[11px] font-semibold tracking-wider uppercase text-[#706B65] shadow-2xs flex items-center space-x-1.5">
          <Sparkles className="w-3 h-3 text-[#A87B42]" />
          <span>Quiet Study Zone • Librarian Desk & Reference Stacks</span>
        </div>
      </div>

      {/* ================= VIEW 1: SPATIAL ARCHITECTURAL FLOORPLAN MAP ================= */}
      {viewMode === 'spatial' && layoutElements.length > 0 ? (
        <div className="overflow-x-auto pb-4">
          <div
            className="relative mx-auto rounded-2xl bg-[#FAF9F6] border border-[#E5E1D8] p-4 shadow-inner"
            style={{
              width: `${Math.max(floorplanBounds.width, 780)}px`,
              height: `${Math.max(floorplanBounds.height, 560)}px`,
              backgroundImage:
                'radial-gradient(#2C2C2C 0.6px, transparent 0.6px), radial-gradient(#2C2C2C 0.6px, #FAF9F6 0.6px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          >
            {/* 1. Render Structural Architectural Elements: Walls, Bookshelves, Pillars, Doors */}
            {layoutElements.map((el) => {
              if (el.type === 'seat') return null; // Seats handled separately below

              if (el.type === 'wall') {
                return (
                  <div
                    key={el.id}
                    className="absolute bg-[#2C2C2C] rounded-xs shadow-2xs pointer-events-none"
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                    }}
                    title={el.label || 'Wall'}
                  />
                );
              }

              if (el.type === 'pillar') {
                return (
                  <div
                    key={el.id}
                    className="absolute bg-[#8C857B] border border-[#6B665E] rounded-md shadow-xs flex items-center justify-center pointer-events-none"
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                    }}
                    title={el.label || 'Pillar'}
                  >
                    <Columns className="w-3.5 h-3.5 text-[#FAF9F6] opacity-70" />
                  </div>
                );
              }

              if (el.type === 'bookshelf') {
                return (
                  <div
                    key={el.id}
                    className="absolute bg-[#D4B996] border border-[#BFA482] rounded-md shadow-xs flex flex-col justify-around py-1 px-0.5 pointer-events-none overflow-hidden"
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                    }}
                    title={el.label || 'Bookshelf'}
                  >
                    <div className="flex items-center justify-center">
                      <BookMarked className="w-3 h-3 text-[#5A4A38] opacity-70" />
                    </div>
                    <div className="border-b border-[#8C7355]/40" />
                    <div className="border-b border-[#8C7355]/40" />
                    <div className="border-b border-[#8C7355]/40" />
                  </div>
                );
              }

              if (el.type === 'door') {
                return (
                  <div
                    key={el.id}
                    className="absolute bg-[#FAF9F6] border-2 border-dashed border-[#4A7C59] rounded-lg shadow-2xs flex items-center justify-center space-x-1.5 text-[10px] font-bold text-[#4A7C59] pointer-events-none"
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width}px`,
                      height: `${el.height}px`,
                    }}
                  >
                    <DoorOpen className="w-3.5 h-3.5" />
                    <span>{el.label || 'Entrance'}</span>
                  </div>
                );
              }

              return null;
            })}

            {/* 2. Render Interactive Desks / Seats in exact position as placed in editor */}
            {layoutElements
              .filter((el) => el.type === 'seat')
              .map((el) => {
                // Find matching seat data from Firestore state
                const code = el.seatCode || el.label || '';
                const liveSeat =
                  seatLookup.get(el.id) ||
                  seatLookup.get(code.toLowerCase()) || {
                    id: el.id,
                    seatCode: code,
                    row: el.row || code.charAt(0) || 'A',
                    number: 1,
                    floorId: 'floor-1',
                    status: 'available' as const,
                    shift: 'morning' as const,
                    month: '2024-11',
                  };

                const isQueryMatch =
                  searchQuery.trim().length > 0 &&
                  (liveSeat.seatCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (liveSeat.studentName &&
                      liveSeat.studentName.toLowerCase().includes(searchQuery.toLowerCase())));

                return (
                  <div
                    key={el.id}
                    className="absolute transition-transform duration-200"
                    style={{
                      left: `${el.x}px`,
                      top: `${el.y}px`,
                      width: `${el.width || 50}px`,
                      height: `${el.height || 46}px`,
                    }}
                  >
                    <SeatCard
                      seat={liveSeat}
                      isSelected={selectedSeat?.id === liveSeat.id}
                      onSelect={onSeatClick}
                      isHighlighted={Boolean(isQueryMatch)}
                    />
                  </div>
                );
              })}
          </div>
        </div>
      ) : (
        /* ================= VIEW 2: CATEGORIZED ROW PODS VIEW ================= */
        <div className="overflow-x-auto pb-4">
          <div className="min-w-[620px] max-w-4xl mx-auto flex flex-col gap-4">
            {rows.map(({ row, seats: rowSeats }) => {
              const leftPod = rowSeats.filter((s) => s.number <= 4);
              const rightPod = rowSeats.filter((s) => s.number > 4);

              return (
                <div key={row} className="flex items-center justify-between gap-3 sm:gap-6">
                  {/* Left Row Identifier */}
                  <div className="w-7 h-7 rounded-lg bg-[#F3F0EA] border border-[#E5E1D8] flex items-center justify-center text-xs font-bold text-[#706B65] shrink-0">
                    {row}
                  </div>

                  {/* Left Pod */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
                    {leftPod.map((seat) => {
                      const isQueryMatch =
                        searchQuery.trim().length > 0 &&
                        (seat.seatCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (seat.studentName &&
                            seat.studentName.toLowerCase().includes(searchQuery.toLowerCase())));

                      return (
                        <SeatCard
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeat?.id === seat.id}
                          onSelect={onSeatClick}
                          isHighlighted={Boolean(isQueryMatch)}
                        />
                      );
                    })}
                  </div>

                  {/* Central Walkway */}
                  <div className="w-8 sm:w-12 shrink-0 flex items-center justify-center">
                    <div className="h-8 border-r border-dashed border-[#D1CCC1]/60" />
                  </div>

                  {/* Right Pod */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-start">
                    {rightPod.map((seat) => {
                      const isQueryMatch =
                        searchQuery.trim().length > 0 &&
                        (seat.seatCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (seat.studentName &&
                            seat.studentName.toLowerCase().includes(searchQuery.toLowerCase())));

                      return (
                        <SeatCard
                          key={seat.id}
                          seat={seat}
                          isSelected={selectedSeat?.id === seat.id}
                          onSelect={onSeatClick}
                          isHighlighted={Boolean(isQueryMatch)}
                        />
                      );
                    })}
                  </div>

                  {/* Right Row Identifier */}
                  <div className="w-7 h-7 rounded-lg bg-[#F3F0EA] border border-[#E5E1D8] flex items-center justify-center text-xs font-bold text-[#706B65] shrink-0">
                    {row}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Walkway / Navigation Guide */}
      <div className="mt-6 pt-4 border-t border-[#EAE6DF]/70 text-center text-xs text-[#8C857B] flex flex-wrap items-center justify-center gap-2">
        <span>Main Reading Hall</span>
        <span>•</span>
        <span>Click any desk to book (Available = Beige, Booked = Clay/Red)</span>
        <span>•</span>
        <span>Arranged via Visual Canvas Editor</span>
      </div>

    </div>
  );
};
