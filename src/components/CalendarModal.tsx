import React, { useState } from 'react';
import { MonthOption } from '../types';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Clock } from 'lucide-react';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  months: MonthOption[];
  selectedMonth: string;
  onSelectMonth: (monthId: string) => void;
}

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  months,
  selectedMonth,
  onSelectMonth,
}) => {
  // Current viewing month index in the months array (defaults to selected or Nov 2026)
  const initialIndex = Math.max(
    0,
    months.findIndex((m) => m.id === selectedMonth)
  );
  const [viewingMonthIndex, setViewingMonthIndex] = useState(initialIndex);

  if (!isOpen) return null;

  const currentMonthObj = months[viewingMonthIndex] || months[0];
  const year = currentMonthObj.year;
  const month = currentMonthObj.monthIndex; // 0-indexed (10 = Nov)

  // Calculate calendar days
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Days array with leading empty slots
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const handlePrev = () => {
    if (viewingMonthIndex > 0) {
      setViewingMonthIndex(viewingMonthIndex - 1);
    }
  };

  const handleNext = () => {
    if (viewingMonthIndex < months.length - 1) {
      setViewingMonthIndex(viewingMonthIndex + 1);
    }
  };

  const handleApplyMonth = (monthId: string) => {
    onSelectMonth(monthId);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#2C2C2C]/30 backdrop-blur-xs z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-lg backdrop-blur-md bg-white/90 border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#EAE6DF]/70">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E5E1D8] flex items-center justify-center text-[#2C2C2C]">
                <CalendarIcon className="w-5 h-5 text-[#A87B42]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C2C2C]">
                  Sucess kar Library • Billing Calendar
                </h3>
                <p className="text-xs text-[#706B65]">
                  Select monthly billing window (Starting Nov 2026)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F3F0EA] text-[#706B65] hover:text-[#2C2C2C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Month Navigation Controls */}
          <div className="mt-4 flex items-center justify-between px-2">
            <button
              onClick={handlePrev}
              disabled={viewingMonthIndex === 0}
              className="p-2 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F3F0EA] text-[#2C2C2C] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h4 className="text-sm font-bold text-[#2C2C2C]">
                {currentMonthObj.label}
              </h4>
              <span className="text-[11px] text-[#8C857B]">
                {daysInMonth} Days • Standard 30-Day Billing
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={viewingMonthIndex === months.length - 1}
              className="p-2 rounded-xl border border-[#E5E1D8] bg-white hover:bg-[#F3F0EA] text-[#2C2C2C] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="mt-4 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1D8]">
            {/* Weekday Row */}
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-[#8C857B] mb-2 uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-8" />;
                }

                // Check if 7th or today (November 6 / 7 2026)
                const isCurrentSimulated = year === 2026 && month === 10 && (day === 6 || day === 7);

                return (
                  <div
                    key={`day-${day}`}
                    className={`h-8 rounded-lg flex flex-col items-center justify-center font-medium transition-all ${
                      isCurrentSimulated
                        ? 'bg-[#2C2C2C] text-[#FAF9F6] font-bold shadow-2xs'
                        : 'bg-white hover:bg-[#F3F0EA] text-[#2C2C2C] border border-[#E5E1D8]/60'
                    }`}
                  >
                    <span>{day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Select Month Carousel */}
          <div className="mt-4">
            <span className="block text-[11px] font-bold uppercase text-[#706B65] tracking-wider mb-2">
              Quick Select Month:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {months.map((m, idx) => {
                const isSelected = m.id === selectedMonth;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      setViewingMonthIndex(idx);
                      handleApplyMonth(m.id);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center space-x-1 ${
                      isSelected
                        ? 'bg-[#2C2C2C] text-[#FAF9F6] border-[#2C2C2C] shadow-xs'
                        : 'bg-white hover:bg-[#F3F0EA] text-[#59524A] border-[#E5E1D8]'
                    }`}
                  >
                    <span>{m.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-[#E2A9A1]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 pt-3 border-t border-[#EAE6DF] flex items-center justify-between text-xs">
            <span className="text-[#8C857B]">
              Selected: <strong className="text-[#2C2C2C]">{currentMonthObj.label}</strong>
            </span>
            <button
              onClick={() => handleApplyMonth(currentMonthObj.id)}
              className="px-4 py-2 rounded-xl bg-[#2C2C2C] hover:bg-[#1E1E1E] text-white font-bold transition-all shadow-xs"
            >
              Apply to Seat Map
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
