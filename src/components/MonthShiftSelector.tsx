import React, { useState } from 'react';
import { Calendar, Clock, Search, RotateCcw, CalendarDays } from 'lucide-react';
import { MonthOption, ShiftOption, ShiftType } from '../types';
import { CalendarModal } from './CalendarModal';

interface MonthShiftSelectorProps {
  months: MonthOption[];
  selectedMonth: string;
  onSelectMonth: (monthId: string) => void;
  shifts: ShiftOption[];
  selectedShift: ShiftType;
  onSelectShift: (shiftId: ShiftType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetFilters: () => void;
}

export const MonthShiftSelector: React.FC<MonthShiftSelectorProps> = ({
  months,
  selectedMonth,
  onSelectMonth,
  shifts,
  selectedShift,
  onSelectShift,
  searchQuery,
  onSearchChange,
  onResetFilters,
}) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  return (
    <>
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        months={months}
        selectedMonth={selectedMonth}
        onSelectMonth={onSelectMonth}
      />

      <div className="backdrop-blur-md bg-white/70 border border-white/40 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
        <div className="flex flex-col gap-4">
          
          {/* Row 1: Month Selection (Horizontal Scrollable Tabs with Calendar button) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#706B65]">
                <Calendar className="w-3.5 h-3.5 text-[#A87B42]" />
                <span>Select Billing Month (Starting Nov 2026)</span>
              </div>
              <button
                onClick={() => setIsCalendarOpen(true)}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/80 hover:bg-[#F3F0EA] border border-[#E5E1D8] text-[11px] font-bold text-[#2C2C2C] shadow-2xs transition-all"
                title="Open Calendar Date Picker"
              >
                <CalendarDays className="w-3.5 h-3.5 text-[#A87B42]" />
                <span>Open Calendar View</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-1.5 scrollbar-thin">
              {months.map((m) => {
                const isSelected = m.id === selectedMonth;
                return (
                  <button
                    key={m.id}
                    onClick={() => onSelectMonth(m.id)}
                    className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 border ${
                      isSelected
                        ? 'bg-[#2C2C2C] text-[#FAF9F6] border-[#2C2C2C] shadow-xs scale-[1.02]'
                        : 'bg-[#F3F0EA]/70 text-[#59524A] border-[#E5E1D8] hover:bg-white hover:text-[#2C2C2C]'
                    }`}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

        {/* Row 2: Shift Selection (Horizontal Scrollable Tabs with Time & Price) */}
        <div className="pt-2 border-t border-[#EAE6DF]/60">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs font-semibold tracking-wider uppercase text-[#706B65]">
              <Clock className="w-3.5 h-3.5 text-[#A87B42]" />
              <span>Select Library Shift</span>
            </div>
            <span className="text-[11px] text-[#8C857B]">
              Independent occupancy per slot
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {shifts.map((shift) => {
              const isSelected = shift.id === selectedShift;
              return (
                <button
                  key={shift.id}
                  onClick={() => onSelectShift(shift.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left border transition-all duration-200 ${
                    isSelected
                      ? 'bg-[#2C2C2C] text-[#FAF9F6] border-[#2C2C2C] shadow-xs'
                      : 'bg-white/80 text-[#2C2C2C] border-[#E5E1D8] hover:border-[#D1CCC1] hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#2C2C2C]'}`}>
                        {shift.label}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                          isSelected ? 'bg-white/20 text-[#FAF9F6]' : 'bg-[#F3F0EA] text-[#706B65]'
                        }`}
                      >
                        {shift.shortTime}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-[#8C857B]'}`}>
                      {shift.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-[#4A7C59]'}`}>
                      ₹{shift.price}
                    </span>
                    <span className={`block text-[10px] ${isSelected ? 'text-white/70' : 'text-[#8C857B]'}`}>
                      /month
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Search & Legend Bar */}
        <div className="pt-2 border-t border-[#EAE6DF]/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          {/* Quick Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-[#8C857B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search seat (e.g. A-02) or student name..."
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-white border border-[#E5E1D8] text-[#2C2C2C] placeholder-[#8C857B] focus:outline-hidden focus:ring-2 focus:ring-[#2C2C2C]/20 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C857B] hover:text-[#2C2C2C]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Seat Status Legend (Strict Colors from user specification) */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#59524A]">
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded-md bg-[#F3F0EA] border border-[#E5E1D8] shadow-2xs" />
              <span>Available</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded-md bg-[#E2A9A1] border border-[#D5988F] shadow-2xs" />
              <span>Booked (Monthly)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded-md bg-[#E5E7EB] border border-[#D1D5DB] shadow-2xs" />
              <span>Maintenance</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-4 h-4 rounded-md bg-[#F3F0EA] border-2 border-[#2C2C2C] ring-2 ring-[#2C2C2C]/20" />
              <span>Selected</span>
            </div>

            {(searchQuery || selectedMonth !== months[0].id) && (
              <button
                onClick={onResetFilters}
                className="inline-flex items-center space-x-1 text-[11px] text-[#8C857B] hover:text-[#2C2C2C] underline decoration-[#D1CCC1] underline-offset-2 ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  </>
  );
};
