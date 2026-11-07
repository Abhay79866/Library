import { Booking } from '../types';

export interface WhatsAppReminderLog {
  id: string;
  studentName: string;
  studentPhone: string;
  seatCode: string;
  amount: number;
  endDate: string;
  message: string;
  sentAt: string;
}

/**
 * Automated WhatsApp Reminders (Simulated)
 * Checks the bookings collection for any endDate that is 3 days away.
 * Emits console.log in the exact requested format:
 * "Hi [Name], your seat [SeatCode] expires in 3 days. Please pay [Amount] to renew."
 */
export function checkAndSendExpiringBookingReminders(bookings: Booking[]): WhatsAppReminderLog[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const logs: WhatsAppReminderLog[] = [];

  bookings.forEach((booking) => {
    if (booking.status !== 'active') return;

    // Parse the endDate
    const endDate = new Date(booking.endDate);
    endDate.setHours(0, 0, 0, 0);

    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    // Specifically look for exactly 3 days away (or within 3 days window if testing)
    if (diffDays === 3) {
      const message = `Hi ${booking.studentName}, your seat ${booking.seatCode} expires in 3 days. Please pay ₹${booking.amount} to renew.`;
      
      // Strict required console.log format:
      console.log(message);

      logs.push({
        id: `reminder-${booking.id}-${Date.now()}`,
        studentName: booking.studentName,
        studentPhone: booking.studentPhone,
        seatCode: booking.seatCode,
        amount: booking.amount,
        endDate: booking.endDate,
        message,
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    }
  });

  return logs;
}
