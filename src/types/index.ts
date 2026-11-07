export type ShiftType = 'morning' | 'evening' | 'full_day';

export type SeatStatus = 'available' | 'booked' | 'maintenance';

export interface MonthOption {
  id: string; // e.g. "2024-11"
  label: string; // e.g. "Nov 2024"
  year: number;
  monthIndex: number;
}

export interface ShiftOption {
  id: ShiftType;
  label: string; // e.g. "Morning Shift"
  time: string; // e.g. "8:00 AM - 2:00 PM"
  shortTime: string; // "8 - 2"
  price: number; // e.g. 1200
}

export interface Seat {
  id: string;
  seatCode: string; // e.g., "A-01"
  row: string; // e.g., "A"
  number: number; // e.g., 1
  floorId: string; // e.g., "floor-1"
  status: SeatStatus;
  shift: ShiftType;
  month: string; // e.g. "2024-11"
  studentName?: string;
  studentPhone?: string;
  expiryDate?: string; // ISO date string or YYYY-MM-DD
  bookedAt?: string;
  amount?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface Booking {
  id: string;
  seatId: string;
  seatCode: string;
  studentName: string;
  studentPhone: string;
  shift: ShiftType;
  month: string;
  amount: number;
  paymentMethod: 'cash' | 'upi';
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface LibraryLayoutElement {
  id: string;
  type: 'seat' | 'wall' | 'pillar' | 'door' | 'bookshelf';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  label?: string;
  seatCode?: string;
  row?: string;
}
