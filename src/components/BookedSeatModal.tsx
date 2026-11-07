import React from 'react';
import { Seat } from '../types';
import { X, User, Phone, Calendar, Clock, MessageSquare, Trash2, ShieldAlert } from 'lucide-react';

interface BookedSeatModalProps {
  seat: Seat | null;
  isOpen: boolean;
  onClose: () => void;
  onVacateSeat: (seatId: string) => void;
  onTriggerIndividualReminder: (seat: Seat) => void;
}

export const BookedSeatModal: React.FC<BookedSeatModalProps> = ({
  seat,
  isOpen,
  onClose,
  onVacateSeat,
  onTriggerIndividualReminder,
}) => {
  if (!isOpen || !seat) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-[#2C2C2C]/25 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-md bg-white/85 border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#EAE6DF]/70">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#E2A9A1] text-[#2C2C2C] text-xs font-bold tracking-wide border border-[#D5988F]">
                  Seat {seat.seatCode}
                </span>
                <span className="text-xs font-semibold text-[#8A5852] bg-[#FBEFEF] px-2 py-0.5 rounded-md">
                  Active Booking
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#2C2C2C] mt-1.5">
                Sucess kar Library • Seat Allocation Details
              </h3>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F3F0EA] text-[#706B65] hover:text-[#2C2C2C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Info Card */}
          <div className="mt-4 p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1D8] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-[#E2A9A1] text-[#2C2C2C] flex items-center justify-center font-bold text-xs">
                  {seat.studentName ? seat.studentName.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2C2C2C]">
                    {seat.studentName || 'Unknown Student'}
                  </h4>
                  <p className="text-xs text-[#706B65] flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {seat.studentPhone || 'No contact provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAE6DF] text-xs">
              <div>
                <span className="text-[11px] text-[#8C857B] block">Expires On</span>
                <span className="font-semibold text-[#2C2C2C] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#A87B42]" />
                  {seat.expiryDate || 'End of Month'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[#8C857B] block">Shift</span>
                <span className="font-semibold text-[#2C2C2C] flex items-center gap-1 capitalize">
                  <Clock className="w-3 h-3 text-[#A87B42]" />
                  {seat.shift.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-5 space-y-2.5">
            <button
              onClick={() => {
                onTriggerIndividualReminder(seat);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FAF9F6] hover:bg-[#F3F0EA] border border-[#E5E1D8] text-xs font-bold text-[#2C2C2C] flex items-center justify-center space-x-2 transition-all shadow-2xs"
            >
              <MessageSquare className="w-4 h-4 text-[#4A7C59]" />
              <span>Send WhatsApp Expiry Reminder</span>
            </button>

            <button
              onClick={() => {
                onVacateSeat(seat.id);
                onClose();
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FDF2F2] border border-[#F8B4B4] text-xs font-bold text-[#9B1C1C] flex items-center justify-center space-x-2 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Vacate & Mark Available</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
