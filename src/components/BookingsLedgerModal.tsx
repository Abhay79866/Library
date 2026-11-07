import React, { useState } from 'react';
import { Booking } from '../types';
import { X, Receipt, Search, Calendar, Phone, CreditCard, Banknote, CheckCircle2, AlertCircle } from 'lucide-react';

interface BookingsLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  onVacateBooking: (seatId: string, bookingId: string) => void;
}

export const BookingsLedgerModal: React.FC<BookingsLedgerModalProps> = ({
  isOpen,
  onClose,
  bookings,
  onVacateBooking,
}) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = bookings.filter(
    (b) =>
      b.studentName.toLowerCase().includes(search.toLowerCase()) ||
      b.seatCode.toLowerCase().includes(search.toLowerCase()) ||
      b.studentPhone.includes(search)
  );

  return (
    <>
      <div
        className="fixed inset-0 bg-[#2C2C2C]/30 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl max-h-[85vh] flex flex-col backdrop-blur-md bg-white/90 border border-white/60 shadow-2xl rounded-3xl p-6 sm:p-7 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#EAE6DF]/70">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF9F6] border border-[#E5E1D8] flex items-center justify-center text-[#2C2C2C]">
                <Receipt className="w-5 h-5 text-[#A87B42]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#2C2C2C]">
                  Sucess kar Library • Bookings Ledger
                </h3>
                <p className="text-xs text-[#706B65]">
                  Live records in <code className="bg-[#F3F0EA] px-1 py-0.5 rounded text-[#2C2C2C]">/bookings</code> collection ({bookings.length} total)
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

          {/* Search bar */}
          <div className="mt-4 relative">
            <Search className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student, seat ID, or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#2C2C2C] placeholder-[#8C857B] focus:outline-hidden focus:ring-2 focus:ring-[#2C2C2C]/20"
            />
          </div>

          {/* Bookings Table / List */}
          <div className="mt-4 flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#8C857B] rounded-2xl bg-[#FAF9F6] border border-[#E5E1D8]">
                No booking records match your search criteria.
              </div>
            ) : (
              filtered.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-2xl bg-white border border-[#E5E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-[#D1CCC1] transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <span className="w-11 h-11 rounded-xl bg-[#E2A9A1] text-[#2C2C2C] font-bold text-xs flex items-center justify-center shrink-0 border border-[#D5988F]">
                      {b.seatCode}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-[#2C2C2C]">
                          {b.studentName}
                        </h4>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            b.status === 'active'
                              ? 'bg-[#EBF5EE] text-[#2D6A4F]'
                              : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#706B65] mt-1">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {b.studentPhone}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#A87B42]" />
                          Until {b.endDate}
                        </span>
                        <span>•</span>
                        <span className="capitalize">{b.shift.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EAE6DF]">
                    <div className="text-right">
                      <span className="text-xs font-bold text-[#2C2C2C] block">
                        ₹{b.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-[#706B65] uppercase flex items-center gap-1 justify-end font-semibold">
                        {b.paymentMethod === 'upi' ? (
                          <CreditCard className="w-3 h-3 text-[#4A7C59]" />
                        ) : (
                          <Banknote className="w-3 h-3 text-[#A87B42]" />
                        )}
                        {b.paymentMethod}
                      </span>
                    </div>

                    {b.status === 'active' && (
                      <button
                        onClick={() => onVacateBooking(b.seatId, b.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#FAF9F6] hover:bg-[#FDF2F2] border border-[#E5E1D8] hover:border-[#F8B4B4] text-[11px] font-semibold text-[#9B1C1C] transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer stats */}
          <div className="mt-4 pt-3 border-t border-[#EAE6DF] flex items-center justify-between text-xs text-[#706B65]">
            <span>
              Total Collected: <strong className="text-[#2C2C2C]">₹{bookings.reduce((acc, curr) => acc + (curr.status === 'active' ? curr.amount : 0), 0).toLocaleString('en-IN')}</strong>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#2C2C2C] text-white font-semibold text-xs"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </>
  );
};
