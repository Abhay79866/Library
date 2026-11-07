import React, { useState, useEffect, useMemo } from 'react';
import { Seat, Booking, ShiftType, LibraryLayoutElement } from './types';
import {
  INITIAL_DUMMY_SEATS,
  INITIAL_DUMMY_BOOKINGS,
  MONTH_OPTIONS,
  SHIFT_OPTIONS,
} from './data/dummySeats';
import { DEFAULT_LAYOUT_ELEMENTS } from './data/defaultLayout';
import { Header } from './components/Header';
import { MonthShiftSelector } from './components/MonthShiftSelector';
import { SeatMap } from './components/SeatMap';
import { LayoutEditor } from './components/LayoutEditor';
import { BookingBottomSheet } from './components/BookingBottomSheet';
import { BookedSeatModal } from './components/BookedSeatModal';
import { BookingsLedgerModal } from './components/BookingsLedgerModal';
import { RemindersDrawer } from './components/RemindersDrawer';
import { checkAndSendExpiringBookingReminders, WhatsAppReminderLog } from './utils/reminders';
import {
  seedFirestoreIfEmpty,
  subscribeToSeats,
  subscribeToBookings,
  subscribeToLayout,
  createBookingInFirestore,
  vacateSeatInFirestore,
} from './services/firestoreService';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation: 'map' = BookMyShow style allocation view, 'editor' = Drag & Drop Canvas
  const [activeTab, setActiveTab] = useState<'map' | 'editor'>('map');

  // Month & Shift state
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [selectedShift, setSelectedShift] = useState<ShiftType>('morning');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Primary data states synced with Firestore
  const [allSeats, setAllSeats] = useState<Seat[]>(INITIAL_DUMMY_SEATS);
  const [bookings, setBookings] = useState<Booking[]>(INITIAL_DUMMY_BOOKINGS);
  const [layoutElements, setLayoutElements] = useState<LibraryLayoutElement[]>(DEFAULT_LAYOUT_ELEMENTS);
  const [isFirestoreLive, setIsFirestoreLive] = useState<boolean>(false);

  // Modals & Bottom Sheet
  const [selectedSeatForBooking, setSelectedSeatForBooking] = useState<Seat | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  const [inspectedSeat, setInspectedSeat] = useState<Seat | null>(null);
  const [isInspectedModalOpen, setIsInspectedModalOpen] = useState(false);

  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isRemindersOpen, setIsRemindersOpen] = useState(false);
  const [reminderLogs, setReminderLogs] = useState<WhatsAppReminderLog[]>([]);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 1. Initialize Firestore & Subscribe to Real-Time Data (Seats, Bookings, Layouts)
  useEffect(() => {
    let unsubscribeSeats: (() => void) | undefined;
    let unsubscribeBookings: (() => void) | undefined;
    let unsubscribeLayout: (() => void) | undefined;

    async function initFirestore() {
      try {
        await seedFirestoreIfEmpty();
        setIsFirestoreLive(true);

        // Real-time seat updates
        unsubscribeSeats = subscribeToSeats(
          (liveSeats) => {
            if (liveSeats && liveSeats.length > 0) {
              setAllSeats(liveSeats);
              setIsFirestoreLive(true);
            }
          },
          (err) => {
            console.error('Failed to subscribe to seats in Firestore:', err);
          }
        );

        // Real-time bookings updates
        unsubscribeBookings = subscribeToBookings(
          (liveBookings) => {
            if (liveBookings) {
              setBookings(liveBookings);
              // Run automated 3-day WhatsApp expiry check
              const logs = checkAndSendExpiringBookingReminders(liveBookings);
              if (logs.length > 0) {
                setReminderLogs(logs);
              }
            }
          },
          (err) => {
            console.error('Failed to subscribe to bookings in Firestore:', err);
          }
        );

        // Real-time visual floor plan layout updates from Firestore
        unsubscribeLayout = subscribeToLayout(
          (liveElements) => {
            if (liveElements && liveElements.length > 0) {
              setLayoutElements(liveElements);
            }
          },
          (err) => {
            console.warn('Layout subscription notice:', err);
          }
        );
      } catch (err) {
        console.warn('Firestore initialization notice:', err);
      }
    }

    initFirestore();

    return () => {
      if (unsubscribeSeats) unsubscribeSeats();
      if (unsubscribeBookings) unsubscribeBookings();
      if (unsubscribeLayout) unsubscribeLayout();
    };
  }, []);

  // Filter seats for the active Month & Shift, directly honoring the Konva visual layout
  const currentViewSeats = useMemo(() => {
    const layoutSeatElements = layoutElements.filter((el) => el.type === 'seat');

    // If layout has seat elements, use them as primary spatial and numbering source
    if (layoutSeatElements.length > 0) {
      return layoutSeatElements.map((el, idx) => {
        const code = el.seatCode || el.label || `S-${String(idx + 1).padStart(2, '0')}`;
        const row = el.row || code.charAt(0).toUpperCase() || 'A';
        const numMatch = code.match(/\d+/);
        const number = numMatch ? parseInt(numMatch[0], 10) : idx + 1;

        // Check active booking by ID or seatCode
        const activeBooking = bookings.find(
          (b) =>
            (b.seatId === el.id || b.seatCode.toLowerCase() === code.toLowerCase()) &&
            b.month === selectedMonth &&
            b.shift === selectedShift &&
            b.status === 'active'
        );

        // Check if marked as maintenance
        const existingSeat = allSeats.find(
          (s) => s.id === el.id || s.seatCode.toLowerCase() === code.toLowerCase()
        );

        if (activeBooking) {
          return {
            id: el.id,
            seatCode: code,
            row,
            number,
            floorId: 'floor-1',
            status: 'booked' as const,
            shift: selectedShift,
            month: selectedMonth,
            studentName: activeBooking.studentName,
            studentPhone: activeBooking.studentPhone,
            expiryDate: activeBooking.endDate,
            amount: activeBooking.amount,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
          };
        }

        if (existingSeat?.status === 'maintenance') {
          return {
            ...existingSeat,
            id: el.id,
            seatCode: code,
            row,
            number,
            x: el.x,
            y: el.y,
            width: el.width,
            height: el.height,
          };
        }

        return {
          id: el.id,
          seatCode: code,
          row,
          number,
          floorId: 'floor-1',
          status: 'available' as const,
          shift: selectedShift,
          month: selectedMonth,
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
        };
      });
    }

    // Fallback if layout has no seat elements
    return allSeats.map((seat) => {
      const activeBooking = bookings.find(
        (b) =>
          b.seatId === seat.id &&
          b.month === selectedMonth &&
          b.shift === selectedShift &&
          b.status === 'active'
      );

      if (activeBooking) {
        return {
          ...seat,
          status: 'booked' as const,
          shift: selectedShift,
          month: selectedMonth,
          studentName: activeBooking.studentName,
          studentPhone: activeBooking.studentPhone,
          expiryDate: activeBooking.endDate,
          amount: activeBooking.amount,
        };
      }

      if (seat.status === 'maintenance') {
        return { ...seat, shift: selectedShift, month: selectedMonth };
      }

      return {
        ...seat,
        status: 'available' as const,
        shift: selectedShift,
        month: selectedMonth,
      };
    });
  }, [allSeats, bookings, selectedMonth, selectedShift, layoutElements]);

  // Seat click handler
  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'available') {
      setSelectedSeatForBooking(seat);
      setIsBottomSheetOpen(true);
    } else if (seat.status === 'booked') {
      setInspectedSeat(seat);
      setIsInspectedModalOpen(true);
    }
  };

  // Confirm booking action from Glassmorphic Bottom Sheet
  const handleConfirmBooking = async (bookingData: {
    studentName: string;
    studentPhone: string;
    paymentMethod: 'cash' | 'upi';
    amount: number;
  }) => {
    if (!selectedSeatForBooking) return;

    const now = new Date();
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);

    const bookingPayload = {
      seatId: selectedSeatForBooking.id,
      seatCode: selectedSeatForBooking.seatCode,
      studentName: bookingData.studentName,
      studentPhone: bookingData.studentPhone,
      shift: selectedShift,
      month: selectedMonth,
      amount: bookingData.amount,
      paymentMethod: bookingData.paymentMethod,
      startDate: now.toISOString().split('T')[0],
      endDate: expiry.toISOString().split('T')[0],
      status: 'active' as const,
    };

    try {
      await createBookingInFirestore(bookingPayload);

      // Optimistic update
      setAllSeats((prev) =>
        prev.map((s) =>
          s.id === selectedSeatForBooking.id
            ? {
                ...s,
                status: 'booked',
                shift: selectedShift,
                month: selectedMonth,
                studentName: bookingData.studentName,
                studentPhone: bookingData.studentPhone,
                expiryDate: expiry.toISOString().split('T')[0],
                amount: bookingData.amount,
              }
            : s
        )
      );

      setIsBottomSheetOpen(false);
      setSelectedSeatForBooking(null);

      showToast(
        `✓ Seat ${selectedSeatForBooking.seatCode} saved to Firestore for ${bookingData.studentName} (₹${bookingData.amount})`
      );
    } catch (error) {
      console.error('Error saving booking to Firestore:', error);
      showToast(`Error saving booking to Firestore.`);
    }
  };

  // Vacate / cancel a seat booking in Firestore
  const handleVacateSeat = async (seatId: string) => {
    try {
      const activeBooking = bookings.find(
        (b) => b.seatId === seatId && b.month === selectedMonth && b.shift === selectedShift
      );

      await vacateSeatInFirestore(seatId, activeBooking?.id);

      setAllSeats((prev) =>
        prev.map((s) =>
          s.id === seatId
            ? {
                ...s,
                status: 'available',
                studentName: undefined,
                studentPhone: undefined,
                expiryDate: undefined,
              }
            : s
        )
      );

      showToast(`Seat vacated in Firestore and restored to Available.`);
    } catch (error) {
      console.error('Error vacating seat in Firestore:', error);
      showToast(`Failed to vacate seat in database.`);
    }
  };

  // Trigger individual WhatsApp reminder
  const handleTriggerIndividualReminder = (seat: Seat) => {
    const message = `Hi ${seat.studentName || 'Student'}, your seat ${seat.seatCode} expires soon. Please pay ₹${seat.amount || 1200} to renew.`;
    console.log(message);

    const newLog: WhatsAppReminderLog = {
      id: `manual-${Date.now()}`,
      studentName: seat.studentName || 'Student',
      studentPhone: seat.studentPhone || 'N/A',
      seatCode: seat.seatCode,
      amount: seat.amount || 1200,
      endDate: seat.expiryDate || 'N/A',
      message,
      sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setReminderLogs((prev) => [newLog, ...prev]);
    showToast(`Dispatched simulated WhatsApp reminder to ${seat.studentName}`);
  };

  // Active labels & stats
  const activeMonthObj = MONTH_OPTIONS.find((m) => m.id === selectedMonth) || MONTH_OPTIONS[0];
  const activeShiftObj = SHIFT_OPTIONS.find((s) => s.id === selectedShift) || SHIFT_OPTIONS[0];

  const totalSeats = currentViewSeats.length;
  const bookedCount = currentViewSeats.filter((s) => s.status === 'booked').length;
  const availableCount = currentViewSeats.filter((s) => s.status === 'available').length;
  const maintenanceCount = currentViewSeats.filter((s) => s.status === 'maintenance').length;
  const totalRevenue = bookings
    .filter((b) => b.month === selectedMonth && b.status === 'active')
    .reduce((sum, b) => sum + b.amount, 0);

  // Expiring in 3 days count
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiringCount = bookings.filter((b) => {
    if (b.status !== 'active') return false;
    const end = new Date(b.endDate);
    end.setHours(0, 0, 0, 0);
    const diff = Math.round((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff === 3;
  }).length;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2C2C2C] flex flex-col font-sans selection:bg-[#E2A9A1]/30">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-3 rounded-2xl backdrop-blur-md bg-[#2C2C2C] text-[#FAF9F6] shadow-xl text-xs font-semibold flex items-center space-x-2 border border-white/20">
            <CheckCircle2 className="w-4 h-4 text-[#E2A9A1]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Glassmorphic Header */}
      <Header
        totalSeats={totalSeats}
        availableCount={availableCount}
        bookedCount={bookedCount}
        maintenanceCount={maintenanceCount}
        revenue={totalRevenue}
        expiringCount={expiringCount}
        isFirestoreLive={isFirestoreLive}
        onOpenReminders={() => setIsRemindersOpen(true)}
        onOpenLedger={() => setIsLedgerOpen(true)}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {activeTab === 'map' ? (
          <>
            {/* Horizontal Tabs: Months, Shifts, and Filters */}
            <MonthShiftSelector
              months={MONTH_OPTIONS}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
              shifts={SHIFT_OPTIONS}
              selectedShift={selectedShift}
              onSelectShift={setSelectedShift}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onResetFilters={() => {
                setSelectedMonth('2026-11');
                setSelectedShift('morning');
                setSearchQuery('');
              }}
            />

            {/* The Visual Seat Map (Synchronized with Konva Visual Layout) */}
            <SeatMap
              seats={currentViewSeats}
              layoutElements={layoutElements}
              selectedSeat={selectedSeatForBooking}
              onSeatClick={handleSeatClick}
              searchQuery={searchQuery}
              selectedMonthLabel={activeMonthObj.label}
              selectedShiftLabel={activeShiftObj.label}
            />
          </>
        ) : (
          /* Visual Drag-and-Drop Layout Editor using react-konva */
          <LayoutEditor
            initialElements={layoutElements}
            onReturnToMap={() => setActiveTab('map')}
            onLayoutSyncedToMap={(updatedElements) => {
              setLayoutElements(updatedElements);
              showToast('✓ Floorplan layout synchronized with Live Seat Map!');
              setActiveTab('map');
            }}
          />
        )}

      </main>

      {/* Glassmorphic Sliding Bottom Sheet Checkout Form */}
      <BookingBottomSheet
        seat={selectedSeatForBooking}
        shift={activeShiftObj}
        month={activeMonthObj}
        isOpen={isBottomSheetOpen}
        onClose={() => {
          setIsBottomSheetOpen(false);
          setSelectedSeatForBooking(null);
        }}
        onConfirmBooking={handleConfirmBooking}
      />

      {/* Booked Seat Details Modal */}
      <BookedSeatModal
        seat={inspectedSeat}
        isOpen={isInspectedModalOpen}
        onClose={() => {
          setIsInspectedModalOpen(false);
          setInspectedSeat(null);
        }}
        onVacateSeat={handleVacateSeat}
        onTriggerIndividualReminder={handleTriggerIndividualReminder}
      />

      {/* Bookings Ledger Modal */}
      <BookingsLedgerModal
        isOpen={isLedgerOpen}
        onClose={() => setIsLedgerOpen(false)}
        bookings={bookings}
        onVacateBooking={(seatId, bookingId) => {
          handleVacateSeat(seatId);
          setIsLedgerOpen(false);
        }}
      />

      {/* Automated WhatsApp Reminders Drawer */}
      <RemindersDrawer
        isOpen={isRemindersOpen}
        onClose={() => setIsRemindersOpen(false)}
        bookings={bookings}
        logs={reminderLogs}
        onAddLogs={(newLogs) => setReminderLogs((prev) => [...newLogs, ...prev])}
      />

      {/* Subtle Admin Footer */}
      <footer className="py-4 border-t border-[#EAE6DF]/60 text-center text-xs text-[#8C857B]">
        <span>StudySpot Admin System • Live Cloud Firestore Sync • Konva Visual Floorplan • NO Student Logins</span>
      </footer>

    </div>
  );
}
