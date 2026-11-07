import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
  query,
  orderBy,
} from 'firebase/firestore';
import { db, COLLECTIONS, handleFirestoreError, OperationType } from '../firebase';
import { Seat, Booking } from '../types';
import { INITIAL_DUMMY_SEATS, INITIAL_DUMMY_BOOKINGS } from '../data/dummySeats';

/**
 * Initializes Firestore with base seats and bookings if empty
 */
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const seatsSnap = await getDocs(collection(db, COLLECTIONS.SEATS));
    if (seatsSnap.empty) {
      console.log('Seeding initial library seats into Firestore...');
      const batch = writeBatch(db);

      // Seed Seats
      INITIAL_DUMMY_SEATS.forEach((seat) => {
        const seatRef = doc(db, COLLECTIONS.SEATS, seat.id);
        batch.set(seatRef, seat);
      });

      // Seed Initial Bookings
      INITIAL_DUMMY_BOOKINGS.forEach((booking) => {
        const bookingRef = doc(db, COLLECTIONS.BOOKINGS, booking.id);
        batch.set(bookingRef, booking);
      });

      await batch.commit();
      console.log('Successfully seeded Firestore with initial library layout.');
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.SEATS);
  }
}

/**
 * Subscribes to real-time seats updates from Firestore
 */
export function subscribeToSeats(
  onUpdate: (seats: Seat[]) => void,
  onError?: (err: unknown) => void
) {
  const seatsCol = collection(db, COLLECTIONS.SEATS);
  return onSnapshot(
    seatsCol,
    (snapshot) => {
      const seats: Seat[] = [];
      snapshot.forEach((d) => {
        seats.push({ id: d.id, ...d.data() } as Seat);
      });
      onUpdate(seats);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.SEATS);
      if (onError) onError(error);
    }
  );
}

/**
 * Subscribes to real-time bookings updates from Firestore
 */
export function subscribeToBookings(
  onUpdate: (bookings: Booking[]) => void,
  onError?: (err: unknown) => void
) {
  const bookingsCol = collection(db, COLLECTIONS.BOOKINGS);
  return onSnapshot(
    bookingsCol,
    (snapshot) => {
      const bookings: Booking[] = [];
      snapshot.forEach((d) => {
        bookings.push({ id: d.id, ...d.data() } as Booking);
      });
      // Sort newest first
      bookings.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      onUpdate(bookings);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, COLLECTIONS.BOOKINGS);
      if (onError) onError(error);
    }
  );
}

/**
 * Atomically creates a new booking document and updates the corresponding seat to booked in Firestore
 */
export async function createBookingInFirestore(
  bookingData: Omit<Booking, 'id' | 'createdAt'>
): Promise<string> {
  const bookingId = `book-${Date.now()}`;
  const now = new Date().toISOString();

  const newBooking: Booking = {
    ...bookingData,
    id: bookingId,
    createdAt: now,
  };

  try {
    const batch = writeBatch(db);

    // 1. Create booking record in 'bookings' collection
    const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
    batch.set(bookingRef, newBooking);

    // 2. Update seat document in 'seats' collection
    const seatRef = doc(db, COLLECTIONS.SEATS, bookingData.seatId);
    batch.update(seatRef, {
      status: 'booked',
      studentName: bookingData.studentName,
      studentPhone: bookingData.studentPhone,
      expiryDate: bookingData.endDate,
      amount: bookingData.amount,
      shift: bookingData.shift,
      month: bookingData.month,
    });

    await batch.commit();
    return bookingId;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.BOOKINGS}/${bookingId}`);
    throw error;
  }
}

/**
 * Vacates an allocated seat and marks the associated active booking as cancelled in Firestore
 */
export async function vacateSeatInFirestore(
  seatId: string,
  bookingId?: string
): Promise<void> {
  try {
    const batch = writeBatch(db);

    // Reset seat in 'seats' collection
    const seatRef = doc(db, COLLECTIONS.SEATS, seatId);
    batch.update(seatRef, {
      status: 'available',
      studentName: null,
      studentPhone: null,
      expiryDate: null,
      amount: null,
    });

    // If bookingId provided, cancel that booking record
    if (bookingId) {
      const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
      batch.update(bookingRef, {
        status: 'cancelled',
      });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTIONS.SEATS}/${seatId}`);
    throw error;
  }
}

/**
 * Saves visual layout elements to Firestore /layouts/floor-1
 */
export async function saveLayoutToFirestore(
  elements: import('../types').LibraryLayoutElement[]
): Promise<void> {
  try {
    const layoutRef = doc(db, COLLECTIONS.LAYOUTS, 'floor-1');
    await setDoc(layoutRef, {
      elements,
      updatedAt: new Date().toISOString(),
      floorName: 'Sucess kar Library - Main Reading Hall (Floor 1)',
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${COLLECTIONS.LAYOUTS}/floor-1`);
    throw error;
  }
}

/**
 * Loads visual layout elements from Firestore /layouts/floor-1
 */
export async function loadLayoutFromFirestore(): Promise<import('../types').LibraryLayoutElement[] | null> {
  try {
    const layoutRef = doc(db, COLLECTIONS.LAYOUTS, 'floor-1');
    const snap = await getDocs(collection(db, COLLECTIONS.LAYOUTS));
    let elements: import('../types').LibraryLayoutElement[] | null = null;
    snap.forEach((d) => {
      if (d.id === 'floor-1') {
        const data = d.data();
        if (data && Array.isArray(data.elements)) {
          elements = data.elements;
        }
      }
    });
    return elements;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.LAYOUTS}/floor-1`);
    return null;
  }
}

/**
 * Subscribes to real-time visual layout changes from Firestore /layouts/floor-1
 */
export function subscribeToLayout(
  onUpdate: (elements: import('../types').LibraryLayoutElement[]) => void,
  onError?: (err: unknown) => void
) {
  const layoutRef = doc(db, COLLECTIONS.LAYOUTS, 'floor-1');
  return onSnapshot(
    layoutRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.elements)) {
          onUpdate(data.elements);
        }
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${COLLECTIONS.LAYOUTS}/floor-1`);
      if (onError) onError(error);
    }
  );
}

/**
 * Synchronizes seats created in the visual layout editor into the /seats collection in Firestore
 */
export async function syncLayoutSeatsToSeatMap(
  elements: import('../types').LibraryLayoutElement[]
): Promise<number> {
  try {
    const seatElements = elements.filter((el) => el.type === 'seat');
    const batch = writeBatch(db);

    // Get current seats to preserve existing bookings & delete removed ones
    const currentSeatsSnap = await getDocs(collection(db, COLLECTIONS.SEATS));
    const activeSeatIds = new Set(seatElements.map((s) => s.id));

    // Remove any seats in Firestore that are no longer in the layout editor
    currentSeatsSnap.forEach((d) => {
      if (!activeSeatIds.has(d.id)) {
        batch.delete(doc(db, COLLECTIONS.SEATS, d.id));
      }
    });

    let count = 0;
    seatElements.forEach((el, idx) => {
      const code = el.seatCode || el.label || `S-${String(idx + 1).padStart(2, '0')}`;
      const row = el.row || code.charAt(0).toUpperCase() || 'A';
      const numMatch = code.match(/\d+/);
      const number = numMatch ? parseInt(numMatch[0], 10) : idx + 1;

      const seatRef = doc(db, COLLECTIONS.SEATS, el.id);
      batch.set(
        seatRef,
        {
          id: el.id,
          seatCode: code,
          row: row,
          number: number,
          floorId: 'floor-1',
          status: 'available',
          shift: 'morning',
          month: '2024-11',
          x: el.x,
          y: el.y,
          width: el.width,
          height: el.height,
        },
        { merge: true }
      );
      count++;
    });

    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTIONS.SEATS);
    throw error;
  }
}


