import React, { useState, useEffect } from 'react';
import { Seat, ShiftOption, MonthOption } from '../types';
import { X, CheckCircle2, User, Phone, CreditCard, Banknote, ShieldCheck } from 'lucide-react';

interface BookingBottomSheetProps {
  seat: Seat | null;
  shift: ShiftOption;
  month: MonthOption;
  isOpen: boolean;
  onClose: () => void;
  onConfirmBooking: (bookingData: {
    studentName: string;
    studentPhone: string;
    paymentMethod: 'cash' | 'upi';
    amount: number;
  }) => void;
}

export const BookingBottomSheet: React.FC<BookingBottomSheetProps> = ({
  seat,
  shift,
  month,
  isOpen,
  onClose,
  onConfirmBooking,
}) => {
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('upi');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Reset form when opened for a new seat
  useEffect(() => {
    if (isOpen) {
      setStudentName('');
      setStudentPhone('');
      setPaymentMethod('upi');
      setFormError('');
      setIsSubmitting(false);
    }
  }, [isOpen, seat?.id]);

  if (!isOpen || !seat) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setFormError('Please enter the student\'s full name.');
      return;
    }
    if (!studentPhone.trim() || studentPhone.trim().length < 8) {
      setFormError('Please enter a valid phone number (at least 8 digits).');
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    // Simulate instant cash/UPI collection & booking write
    setTimeout(() => {
      onConfirmBooking({
        studentName: studentName.trim(),
        studentPhone: studentPhone.trim(),
        paymentMethod,
        amount: shift.price,
      });
      setIsSubmitting(false);
    }, 350);
  };

  return (
    <>
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-[#2C2C2C]/25 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Glassmorphic Sliding Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-0 sm:p-4 pointer-events-none">
        <div className="w-full max-w-xl pointer-events-auto backdrop-blur-md bg-white/80 border border-white/60 shadow-2xl rounded-t-3xl sm:rounded-3xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
          
          {/* Top handle on mobile */}
          <div className="w-12 h-1 bg-[#E5E1D8] rounded-full mx-auto mb-4 sm:hidden" />

          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#EAE6DF]/70">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#2C2C2C] text-[#FAF9F6] text-xs font-bold tracking-wide">
                  Seat {seat.seatCode}
                </span>
                <span className="text-xs font-semibold text-[#706B65]">
                  Row {seat.row} • Floor 1
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#2C2C2C] mt-1">
                Sucess kar Library • Seat Allocation
              </h3>
              <p className="text-xs text-[#706B65]">
                Assign to student for <strong className="text-[#2C2C2C]">{month.label}</strong> ({shift.label})
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F3F0EA] text-[#706B65] hover:text-[#2C2C2C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Pricing & Shift Breakdown Card */}
          <div className="mt-4 p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E5E1D8] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#E5E1D8] flex items-center justify-center text-[#2C2C2C] font-bold text-xs">
                {shift.shortTime}
              </div>
              <div>
                <span className="text-xs font-bold text-[#2C2C2C] block">
                  {shift.label}
                </span>
                <span className="text-[11px] text-[#706B65]">
                  {shift.time}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#706B65] block">Monthly Fee</span>
              <span className="text-base font-extrabold text-[#2C2C2C]">
                ₹{shift.price.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {formError && (
            <div className="mt-3 p-3 rounded-xl bg-[#FDF2F2] border border-[#F8B4B4] text-xs text-[#9B1C1C] flex items-center space-x-2">
              <span>⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-[#59524A] mb-1.5">
                Student Full Name <span className="text-[#C7867E]">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-[#2C2C2C] placeholder-[#A8A196] focus:outline-hidden focus:ring-2 focus:ring-[#2C2C2C]/20 text-sm font-medium"
                />
              </div>
            </div>

            {/* Student Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#59524A] mb-1.5">
                Phone Number (WhatsApp for Reminders) <span className="text-[#C7867E]">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C857B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={studentPhone}
                  onChange={(e) => setStudentPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-[#2C2C2C] placeholder-[#A8A196] focus:outline-hidden focus:ring-2 focus:ring-[#2C2C2C]/20 text-sm font-medium"
                />
              </div>
            </div>

            {/* Simulated Payment Mode */}
            <div>
              <label className="block text-xs font-semibold text-[#59524A] mb-1.5">
                Admin Payment Collection Method
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-[#2C2C2C] text-[#FAF9F6] border-[#2C2C2C] shadow-xs'
                      : 'bg-white text-[#59524A] border-[#E5E1D8] hover:bg-[#F3F0EA]'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>UPI / QR Scan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-[#2C2C2C] text-[#FAF9F6] border-[#2C2C2C] shadow-xs'
                      : 'bg-white text-[#59524A] border-[#E5E1D8] hover:bg-[#F3F0EA]'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Direct Cash</span>
                </button>
              </div>
            </div>

            {/* Note badge */}
            <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E1D8] text-xs text-[#706B65] flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#A87B42] shrink-0" />
              <span>
                Confirming immediately locks seat <strong className="text-[#2C2C2C]">{seat.seatCode}</strong> and changes status color to Booked (Red).
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 py-2.5 rounded-xl border border-[#E5E1D8] bg-white text-xs font-semibold text-[#706B65] hover:bg-[#F3F0EA] hover:text-[#2C2C2C] transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-2.5 rounded-xl bg-[#2C2C2C] hover:bg-[#1E1E1E] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md active:scale-[0.99] disabled:opacity-75"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'Confirming...' : `Confirm Booking (₹${shift.price})`}
                </span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </>
  );
};
