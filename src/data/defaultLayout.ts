import { LibraryLayoutElement } from '../types';

export const DEFAULT_LAYOUT_ELEMENTS: LibraryLayoutElement[] = [
  // Outer perimeter walls
  { id: 'wall-top', type: 'wall', x: 40, y: 30, width: 720, height: 16, label: 'North Perimeter Wall' },
  { id: 'wall-bottom-left', type: 'wall', x: 40, y: 520, width: 300, height: 16, label: 'South Wall' },
  { id: 'door-main', type: 'door', x: 340, y: 512, width: 120, height: 32, label: 'Main Entrance & Gate' },
  { id: 'wall-bottom-right', type: 'wall', x: 460, y: 520, width: 300, height: 16, label: 'South Wall' },
  { id: 'wall-left', type: 'wall', x: 40, y: 30, width: 16, height: 506, label: 'West Wall' },
  { id: 'wall-right', type: 'wall', x: 744, y: 30, width: 16, height: 506, label: 'East Wall' },

  // Bookshelves on the sides
  { id: 'shelf-1', type: 'bookshelf', x: 76, y: 60, width: 44, height: 180, label: 'Reference Stacks' },
  { id: 'shelf-2', type: 'bookshelf', x: 76, y: 280, width: 44, height: 180, label: 'Journals & Periodicals' },
  { id: 'shelf-3', type: 'bookshelf', x: 680, y: 60, width: 44, height: 180, label: 'Fiction & Literature' },
  { id: 'shelf-4', type: 'bookshelf', x: 680, y: 280, width: 44, height: 180, label: 'Academic & Science' },

  // Structural Pillars
  { id: 'pillar-1', type: 'pillar', x: 270, y: 160, width: 28, height: 28, label: 'Pillar P1' },
  { id: 'pillar-2', type: 'pillar', x: 500, y: 160, width: 28, height: 28, label: 'Pillar P2' },
  { id: 'pillar-3', type: 'pillar', x: 270, y: 360, width: 28, height: 28, label: 'Pillar P3' },
  { id: 'pillar-4', type: 'pillar', x: 500, y: 360, width: 28, height: 28, label: 'Pillar P4' },

  // Pod 1 - Row A Desks (Left & Right)
  { id: 'seat-a-01', type: 'seat', x: 160, y: 80, width: 50, height: 46, seatCode: 'A-01', row: 'A', label: 'A-01' },
  { id: 'seat-a-02', type: 'seat', x: 220, y: 80, width: 50, height: 46, seatCode: 'A-02', row: 'A', label: 'A-02' },
  { id: 'seat-a-03', type: 'seat', x: 160, y: 136, width: 50, height: 46, seatCode: 'A-03', row: 'A', label: 'A-03' },
  { id: 'seat-a-04', type: 'seat', x: 220, y: 136, width: 50, height: 46, seatCode: 'A-04', row: 'A', label: 'A-04' },

  { id: 'seat-a-05', type: 'seat', x: 530, y: 80, width: 50, height: 46, seatCode: 'A-05', row: 'A', label: 'A-05' },
  { id: 'seat-a-06', type: 'seat', x: 590, y: 80, width: 50, height: 46, seatCode: 'A-06', row: 'A', label: 'A-06' },
  { id: 'seat-a-07', type: 'seat', x: 530, y: 136, width: 50, height: 46, seatCode: 'A-07', row: 'A', label: 'A-07' },
  { id: 'seat-a-08', type: 'seat', x: 590, y: 136, width: 50, height: 46, seatCode: 'A-08', row: 'A', label: 'A-08' },

  // Pod 2 - Row B Desks (Left & Right)
  { id: 'seat-b-01', type: 'seat', x: 160, y: 220, width: 50, height: 46, seatCode: 'B-01', row: 'B', label: 'B-01' },
  { id: 'seat-b-02', type: 'seat', x: 220, y: 220, width: 50, height: 46, seatCode: 'B-02', row: 'B', label: 'B-02' },
  { id: 'seat-b-03', type: 'seat', x: 160, y: 276, width: 50, height: 46, seatCode: 'B-03', row: 'B', label: 'B-03' },
  { id: 'seat-b-04', type: 'seat', x: 220, y: 276, width: 50, height: 46, seatCode: 'B-04', row: 'B', label: 'B-04' },

  { id: 'seat-b-05', type: 'seat', x: 530, y: 220, width: 50, height: 46, seatCode: 'B-05', row: 'B', label: 'B-05' },
  { id: 'seat-b-06', type: 'seat', x: 590, y: 220, width: 50, height: 46, seatCode: 'B-06', row: 'B', label: 'B-06' },
  { id: 'seat-b-07', type: 'seat', x: 530, y: 276, width: 50, height: 46, seatCode: 'B-07', row: 'B', label: 'B-07' },
  { id: 'seat-b-08', type: 'seat', x: 590, y: 276, width: 50, height: 46, seatCode: 'B-08', row: 'B', label: 'B-08' },

  // Pod 3 - Row C Desks
  { id: 'seat-c-01', type: 'seat', x: 160, y: 360, width: 50, height: 46, seatCode: 'C-01', row: 'C', label: 'C-01' },
  { id: 'seat-c-02', type: 'seat', x: 220, y: 360, width: 50, height: 46, seatCode: 'C-02', row: 'C', label: 'C-02' },
  { id: 'seat-c-03', type: 'seat', x: 160, y: 416, width: 50, height: 46, seatCode: 'C-03', row: 'C', label: 'C-03' },
  { id: 'seat-c-04', type: 'seat', x: 220, y: 416, width: 50, height: 46, seatCode: 'C-04', row: 'C', label: 'C-04' },

  { id: 'seat-c-05', type: 'seat', x: 530, y: 360, width: 50, height: 46, seatCode: 'C-05', row: 'C', label: 'C-05' },
  { id: 'seat-c-06', type: 'seat', x: 590, y: 360, width: 50, height: 46, seatCode: 'C-06', row: 'C', label: 'C-06' },
  { id: 'seat-c-07', type: 'seat', x: 530, y: 416, width: 50, height: 46, seatCode: 'C-07', row: 'C', label: 'C-07' },
  { id: 'seat-c-08', type: 'seat', x: 590, y: 416, width: 50, height: 46, seatCode: 'C-08', row: 'C', label: 'C-08' },
];
