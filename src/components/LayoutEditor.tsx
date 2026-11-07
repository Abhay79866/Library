import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Rect, Text, Group, Line } from 'react-konva';
import { LibraryLayoutElement } from '../types';
import { DEFAULT_LAYOUT_ELEMENTS } from '../data/defaultLayout';
import {
  saveLayoutToFirestore,
  loadLayoutFromFirestore,
  syncLayoutSeatsToSeatMap,
} from '../services/firestoreService';
import {
  Armchair,
  Square,
  Columns,
  BookMarked,
  DoorOpen,
  Save,
  RotateCcw,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Sparkles,
  Grid,
  ArrowRight,
  Eraser,
  List,
  Sliders,
  AlertTriangle,
  X,
} from 'lucide-react';

interface LayoutEditorProps {
  onReturnToMap: () => void;
  onLayoutSyncedToMap: (elements: LibraryLayoutElement[]) => void;
  initialElements?: LibraryLayoutElement[];
}

export const LayoutEditor: React.FC<LayoutEditorProps> = ({
  onReturnToMap,
  onLayoutSyncedToMap,
  initialElements,
}) => {
  const [elements, setElements] = useState<LibraryLayoutElement[]>(
    initialElements && initialElements.length > 0 ? initialElements : DEFAULT_LAYOUT_ELEMENTS
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEraserMode, setIsEraserMode] = useState<boolean>(false);
  const [sidebarTab, setSidebarTab] = useState<'inspector' | 'items'>('inspector');
  const [zoom, setZoom] = useState<number>(1);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [editorToast, setEditorToast] = useState<string | null>(null);

  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [stageSize, setStageSize] = useState({ width: 900, height: 600 });

  const showNotification = (msg: string) => {
    setEditorToast(msg);
    setTimeout(() => setEditorToast(null), 3500);
  };

  // Resize canvas to container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setStageSize({
          width: Math.max(680, containerRef.current.offsetWidth - 24),
          height: 620,
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Keyboard shortcut listener: Delete / Backspace deletes selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault();
        handleDeleteElement(selectedId);
      }
      if (e.key === 'Escape') {
        setSelectedId(null);
        setIsEraserMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, elements]);

  // Load layout from Firestore on mount if available
  useEffect(() => {
    async function fetchSaved() {
      try {
        const saved = await loadLayoutFromFirestore();
        if (saved && saved.length > 0) {
          setElements(saved);
        }
      } catch (err) {
        console.warn('Notice loading layout:', err);
      }
    }
    fetchSaved();
  }, []);

  const selectedElement = elements.find((el) => el.id === selectedId);

  // Helper for grid snapping (20px)
  const snapVal = (val: number) => {
    if (!snapToGrid) return Math.round(val);
    const GRID = 20;
    return Math.round(val / GRID) * GRID;
  };

  // Add new element to canvas
  const handleAddElement = (type: LibraryLayoutElement['type']) => {
    const id = `${type}-${Date.now().toString().slice(-6)}`;
    let newElement: LibraryLayoutElement;

    const spawnX = snapVal(250 + Math.random() * 80);
    const spawnY = snapVal(180 + Math.random() * 80);

    switch (type) {
      case 'seat': {
        const existingSeats = elements.filter((e) => e.type === 'seat');
        const nextNum = existingSeats.length + 1;
        const rowChar = String.fromCharCode(65 + Math.floor((nextNum - 1) / 8));
        const numInRow = ((nextNum - 1) % 8) + 1;
        const code = `${rowChar}-${String(numInRow).padStart(2, '0')}`;

        newElement = {
          id,
          type: 'seat',
          x: spawnX,
          y: spawnY,
          width: 50,
          height: 46,
          seatCode: code,
          row: rowChar,
          label: code,
        };
        break;
      }
      case 'wall':
        newElement = {
          id,
          type: 'wall',
          x: spawnX,
          y: spawnY,
          width: 160,
          height: 16,
          label: 'Divider Wall',
        };
        break;
      case 'pillar':
        newElement = {
          id,
          type: 'pillar',
          x: spawnX,
          y: spawnY,
          width: 28,
          height: 28,
          label: 'Pillar',
        };
        break;
      case 'bookshelf':
        newElement = {
          id,
          type: 'bookshelf',
          x: spawnX,
          y: spawnY,
          width: 44,
          height: 140,
          label: 'Book Stacks',
        };
        break;
      case 'door':
        newElement = {
          id,
          type: 'door',
          x: spawnX,
          y: spawnY,
          width: 100,
          height: 28,
          label: 'Entrance Door',
        };
        break;
    }

    setElements((prev) => [...prev, newElement]);
    setSelectedId(id);
    setSidebarTab('inspector');
    showNotification(`Added new ${type} to canvas`);
  };

  // Delete an element by ID
  const handleDeleteElement = (idToDelete: string) => {
    const el = elements.find((e) => e.id === idToDelete);
    setElements((prev) => prev.filter((item) => item.id !== idToDelete));
    if (selectedId === idToDelete) {
      setSelectedId(null);
    }
    showNotification(`✓ Deleted ${el?.label || el?.type || 'element'}`);
  };

  // Click handler on element (normal select or instant eraser delete)
  const handleElementClick = (el: LibraryLayoutElement) => {
    if (isEraserMode) {
      handleDeleteElement(el.id);
    } else {
      setSelectedId(el.id);
      setSidebarTab('inspector');
    }
  };

  // Save layout to Firestore
  const handleSaveToFirestore = async () => {
    setIsSaving(true);
    try {
      await saveLayoutToFirestore(elements);
      showNotification('✓ Layout successfully saved to Firestore (/layouts/floor-1)');
    } catch (err) {
      console.error(err);
      showNotification('Failed to save layout to Firestore');
    } finally {
      setIsSaving(false);
    }
  };

  // Synchronize layout seats with the live seat map database
  const handleSyncToLiveMap = async () => {
    setIsSyncing(true);
    try {
      await saveLayoutToFirestore(elements);
      const syncedCount = await syncLayoutSeatsToSeatMap(elements);
      showNotification(`✓ Synchronized ${syncedCount} seats with live BookMyShow map!`);
      onLayoutSyncedToMap(elements);
    } catch (err) {
      console.error(err);
      showNotification('Failed to sync layout seats to database');
    } finally {
      setIsSyncing(false);
    }
  };

  // Duplicate selected element
  const handleDuplicateSelected = () => {
    if (!selectedElement) return;
    const duplicated: LibraryLayoutElement = {
      ...selectedElement,
      id: `${selectedElement.type}-${Date.now().toString().slice(-6)}`,
      x: snapVal(selectedElement.x + 30),
      y: snapVal(selectedElement.y + 30),
      seatCode:
        selectedElement.type === 'seat'
          ? `${selectedElement.row || 'A'}-${Math.floor(Math.random() * 90 + 10)}`
          : undefined,
    };
    setElements((prev) => [...prev, duplicated]);
    setSelectedId(duplicated.id);
    showNotification('Element duplicated');
  };

  // Update selected element property
  const handleUpdateSelected = (patch: Partial<LibraryLayoutElement>) => {
    if (!selectedId) return;
    setElements((prev) =>
      prev.map((el) => (el.id === selectedId ? { ...el, ...patch } : el))
    );
  };

  // Group elements for the "All Floor Items" sidebar tab
  const walls = elements.filter((e) => e.type === 'wall');
  const pillars = elements.filter((e) => e.type === 'pillar');
  const bookshelves = elements.filter((e) => e.type === 'bookshelf');
  const doors = elements.filter((e) => e.type === 'door');
  const seats = elements.filter((e) => e.type === 'seat');

  return (
    <div className="space-y-4">
      
      {/* Toast Feedback */}
      {editorToast && (
        <div className="fixed top-20 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="px-4 py-3 rounded-2xl backdrop-blur-md bg-[#2C2C2C] text-[#FAF9F6] shadow-xl text-xs font-semibold flex items-center space-x-2 border border-white/20">
            <CheckCircle2 className="w-4 h-4 text-[#E2A9A1]" />
            <span>{editorToast}</span>
          </div>
        </div>
      )}

      {/* Eraser Tool Active Banner */}
      {isEraserMode && (
        <div className="p-3 rounded-2xl bg-[#FDF2F2] border border-[#F8B4B4] text-xs text-[#9B1C1C] flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center space-x-2">
            <Eraser className="w-4 h-4 text-[#E02424] animate-bounce" />
            <span className="font-bold">
              Eraser / Delete Mode Active: Click ANY wall, pillar, bookshelf, or desk on the canvas to delete it instantly!
            </span>
          </div>
          <button
            onClick={() => setIsEraserMode(false)}
            className="px-3 py-1 rounded-lg bg-white border border-[#F8B4B4] text-xs font-bold text-[#9B1C1C] hover:bg-[#FDF2F2]"
          >
            Exit Delete Mode
          </button>
        </div>
      )}

      {/* Top Controls Toolbar */}
      <div className="backdrop-blur-md bg-white/70 border border-white/40 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Component Palette Quick-Add */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#706B65] mr-1">
            Add Elements:
          </span>
          <button
            onClick={() => handleAddElement('seat')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#F3F0EA] hover:bg-white border border-[#E5E1D8] text-[#2C2C2C] font-semibold transition-all shadow-2xs hover:scale-105 active:scale-95"
          >
            <Armchair className="w-3.5 h-3.5 text-[#A87B42]" />
            <span>+ Desk / Seat</span>
          </button>
          <button
            onClick={() => handleAddElement('wall')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-[#E5E1D8] text-[#2C2C2C] font-semibold transition-all shadow-2xs hover:scale-105 active:scale-95"
          >
            <Square className="w-3.5 h-3.5 text-[#2C2C2C]" />
            <span>+ Wall</span>
          </button>
          <button
            onClick={() => handleAddElement('pillar')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-[#E5E1D8] text-[#2C2C2C] font-semibold transition-all shadow-2xs hover:scale-105 active:scale-95"
          >
            <Columns className="w-3.5 h-3.5 text-[#706B65]" />
            <span>+ Pillar</span>
          </button>
          <button
            onClick={() => handleAddElement('bookshelf')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-[#E5E1D8] text-[#2C2C2C] font-semibold transition-all shadow-2xs hover:scale-105 active:scale-95"
          >
            <BookMarked className="w-3.5 h-3.5 text-[#A87B42]" />
            <span>+ Bookshelf</span>
          </button>
          <button
            onClick={() => handleAddElement('door')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/80 hover:bg-white border border-[#E5E1D8] text-[#2C2C2C] font-semibold transition-all shadow-2xs hover:scale-105 active:scale-95"
          >
            <DoorOpen className="w-3.5 h-3.5 text-[#4A7C59]" />
            <span>+ Door</span>
          </button>
        </div>

        {/* Right: Actions (Eraser Tool, Grid, Zoom, Save, Sync) */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          
          {/* Dedicated Eraser / Delete Tool */}
          <button
            onClick={() => {
              setIsEraserMode(!isEraserMode);
              if (!isEraserMode) {
                showNotification('Eraser Mode enabled: Click any wall, pillar, or desk to delete it.');
              }
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all ${
              isEraserMode
                ? 'bg-[#E02424] text-white border-[#E02424] shadow-md animate-pulse'
                : 'bg-white text-[#9B1C1C] border-[#F8B4B4] hover:bg-[#FDF2F2]'
            }`}
            title="Toggle Eraser: Click any element to remove"
          >
            <Eraser className="w-4 h-4" />
            <span>{isEraserMode ? 'Exit Eraser' : 'Delete / Eraser Tool'}</span>
          </button>

          {/* Snap Grid Toggle */}
          <button
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`p-2 rounded-xl border transition-all ${
              snapToGrid
                ? 'bg-[#2C2C2C] text-white border-[#2C2C2C]'
                : 'bg-white text-[#706B65] border-[#E5E1D8]'
            }`}
            title="Toggle 20px Grid Snapping"
          >
            <Grid className="w-4 h-4" />
          </button>

          {/* Zoom Controls */}
          <div className="inline-flex rounded-xl bg-white border border-[#E5E1D8] p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 text-[#706B65] hover:text-[#2C2C2C]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 py-1 text-[11px] font-mono text-[#2C2C2C]">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.6, z + 0.1))}
              className="p-1.5 text-[#706B65] hover:text-[#2C2C2C]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1.5 text-[#706B65] hover:text-[#2C2C2C] border-l border-[#E5E1D8]"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Reset Layout */}
          <button
            onClick={() => {
              if (confirm('Reset layout to default floor blueprint?')) {
                setElements(DEFAULT_LAYOUT_ELEMENTS);
                setSelectedId(null);
                showNotification('Reset to template layout');
              }
            }}
            className="p-2 rounded-xl bg-white border border-[#E5E1D8] text-[#706B65] hover:text-[#2C2C2C]"
            title="Reset to Template"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Save Layout to Firebase */}
          <button
            onClick={handleSaveToFirestore}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#2C2C2C] hover:bg-[#1E1E1E] text-white font-bold transition-all shadow-xs disabled:opacity-75"
          >
            <Save className="w-3.5 h-3.5 text-[#A87B42]" />
            <span>{isSaving ? 'Saving...' : 'Save to Firebase'}</span>
          </button>

          {/* Sync to Live Seat Map */}
          <button
            onClick={handleSyncToLiveMap}
            disabled={isSyncing}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#E2A9A1] hover:bg-[#D99B93] text-[#2C2C2C] font-bold transition-all shadow-xs disabled:opacity-75"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isSyncing ? 'Syncing...' : 'Sync to Live Map'}</span>
          </button>
        </div>

      </div>

      {/* Main Work Area: Canvas on Left, Multi-Tab Inspector & Item Manager on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Canvas Stage (3 Cols) */}
        <div
          ref={containerRef}
          className="lg:col-span-3 backdrop-blur-md bg-white/70 border border-white/40 rounded-3xl p-3 shadow-xs relative overflow-hidden select-none"
        >
          {/* Canvas Blueprint Grid Backdrop */}
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(#2C2C2C 0.8px, transparent 0.8px), radial-gradient(#2C2C2C 0.8px, #FAF9F6 0.8px)',
              backgroundSize: '20px 20px',
              backgroundPosition: '0 0, 10px 10px',
            }}
          />

          {/* Floating On-Canvas Quick Action Toolbar when an element is selected */}
          {selectedElement && !isEraserMode && (
            <div className="absolute top-6 left-6 z-20 backdrop-blur-md bg-white/95 border border-[#E5E1D8] shadow-lg rounded-2xl px-3.5 py-2 flex items-center space-x-3 text-xs animate-in fade-in duration-150">
              <span className="font-bold text-[#2C2C2C] capitalize flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A87B42]" />
                {selectedElement.label || selectedElement.seatCode || selectedElement.type}
              </span>
              <div className="h-4 border-r border-[#E5E1D8]" />
              
              {/* Prominent Quick Delete Button */}
              <button
                onClick={() => handleDeleteElement(selectedElement.id)}
                className="px-2.5 py-1 rounded-lg bg-[#FDF2F2] hover:bg-[#FDE8E8] text-[#9B1C1C] border border-[#F8B4B4] font-bold flex items-center space-x-1 transition-all"
                title="Delete this element (Delete key)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>

              <button
                onClick={handleDuplicateSelected}
                className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] hover:bg-[#F3F0EA] text-[#2C2C2C] border border-[#E5E1D8] font-semibold flex items-center space-x-1 transition-all"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>

              <button
                onClick={() => setSelectedId(null)}
                className="p-1 text-[#8C857B] hover:text-[#2C2C2C]"
                title="Deselect"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            scaleX={zoom}
            scaleY={zoom}
            onMouseDown={(e) => {
              if (e.target === e.target.getStage()) {
                setSelectedId(null);
              }
            }}
            className={`rounded-2xl bg-[#FAF9F6] border border-[#E5E1D8]/60 overflow-hidden shadow-inner ${
              isEraserMode ? 'cursor-pointer' : 'cursor-crosshair'
            }`}
          >
            <Layer>
              {elements.map((el) => {
                const isSelected = el.id === selectedId;

                return (
                  <Group
                    key={el.id}
                    id={el.id}
                    x={el.x}
                    y={el.y}
                    draggable={!isEraserMode}
                    onClick={() => handleElementClick(el)}
                    onTap={() => handleElementClick(el)}
                    onDragEnd={(e) => {
                      const newX = snapVal(e.target.x());
                      const newY = snapVal(e.target.y());
                      e.target.position({ x: newX, y: newY });
                      setElements((prev) =>
                        prev.map((item) =>
                          item.id === el.id ? { ...item, x: newX, y: newY } : item
                        )
                      );
                    }}
                  >
                    {/* Generous transparent hitbox for easy clicking/tapping (especially on thin walls) */}
                    <Rect
                      x={-6}
                      y={-6}
                      width={el.width + 12}
                      height={el.height + 12}
                      fill="transparent"
                      stroke={isEraserMode ? '#E02424' : 'transparent'}
                      strokeWidth={isEraserMode ? 1 : 0}
                      dash={isEraserMode ? [4, 4] : undefined}
                    />

                    {/* SEAT */}
                    {el.type === 'seat' && (
                      <>
                        <Rect
                          width={el.width}
                          height={el.height}
                          fill="#F3F0EA"
                          stroke={isSelected ? '#2C2C2C' : '#E5E1D8'}
                          strokeWidth={isSelected ? 2.5 : 1}
                          cornerRadius={8}
                          shadowColor="#2C2C2C"
                          shadowBlur={isSelected ? 8 : 2}
                          shadowOpacity={isSelected ? 0.2 : 0.05}
                          shadowOffsetY={1}
                        />
                        <Rect
                          x={6}
                          y={4}
                          width={el.width - 12}
                          height={3}
                          fill="#D1CCC1"
                          cornerRadius={2}
                        />
                        <Text
                          x={0}
                          y={el.height / 2 - 4}
                          width={el.width}
                          text={el.seatCode || el.label || 'Desk'}
                          fontSize={11}
                          fontFamily="Plus Jakarta Sans, sans-serif"
                          fontStyle="bold"
                          fill="#2C2C2C"
                          align="center"
                        />
                      </>
                    )}

                    {/* WALL */}
                    {el.type === 'wall' && (
                      <Rect
                        width={el.width}
                        height={el.height}
                        fill="#2C2C2C"
                        stroke={isSelected ? '#A87B42' : '#1A1A1A'}
                        strokeWidth={isSelected ? 2 : 0}
                        cornerRadius={3}
                      />
                    )}

                    {/* PILLAR */}
                    {el.type === 'pillar' && (
                      <>
                        <Rect
                          width={el.width}
                          height={el.height}
                          fill="#8C857B"
                          stroke={isSelected ? '#2C2C2C' : '#6B665E'}
                          strokeWidth={isSelected ? 2 : 1}
                          cornerRadius={4}
                        />
                        <Line
                          points={[0, 0, el.width, el.height]}
                          stroke="#FAF9F6"
                          strokeWidth={1}
                          opacity={0.5}
                        />
                        <Line
                          points={[el.width, 0, 0, el.height]}
                          stroke="#FAF9F6"
                          strokeWidth={1}
                          opacity={0.5}
                        />
                      </>
                    )}

                    {/* BOOKSHELF */}
                    {el.type === 'bookshelf' && (
                      <>
                        <Rect
                          width={el.width}
                          height={el.height}
                          fill="#D4B996"
                          stroke={isSelected ? '#2C2C2C' : '#BFA482'}
                          strokeWidth={isSelected ? 2 : 1}
                          cornerRadius={4}
                        />
                        {Array.from({ length: Math.floor(el.height / 25) }).map((_, i) => (
                          <Line
                            key={i}
                            points={[0, (i + 1) * 25, el.width, (i + 1) * 25]}
                            stroke="#8C7355"
                            strokeWidth={1}
                          />
                        ))}
                      </>
                    )}

                    {/* DOOR */}
                    {el.type === 'door' && (
                      <>
                        <Rect
                          width={el.width}
                          height={el.height}
                          fill="#FAF9F6"
                          stroke="#4A7C59"
                          strokeWidth={2}
                          dash={[6, 4]}
                          cornerRadius={4}
                        />
                        <Text
                          x={0}
                          y={el.height / 2 - 5}
                          width={el.width}
                          text={el.label || 'Entrance'}
                          fontSize={10}
                          fontFamily="Plus Jakarta Sans, sans-serif"
                          fontStyle="bold"
                          fill="#4A7C59"
                          align="center"
                        />
                      </>
                    )}

                    {/* Selection highlight frame */}
                    {isSelected && (
                      <Rect
                        x={-4}
                        y={-4}
                        width={el.width + 8}
                        height={el.height + 8}
                        stroke="#A87B42"
                        strokeWidth={1.5}
                        dash={[4, 4]}
                        cornerRadius={6}
                      />
                    )}
                  </Group>
                );
              })}
            </Layer>
          </Stage>

          {/* Quick guide watermark */}
          <div className="mt-2 text-center text-[11px] text-[#8C857B] flex items-center justify-center gap-3">
            <span>Click any item to select or drag</span>
            <span>•</span>
            <span className="text-[#9B1C1C] font-semibold">Press Backspace / Delete key to remove</span>
            <span>•</span>
            <span>Snap: 20px grid</span>
          </div>
        </div>

        {/* Selected Element Inspector & All Elements Manager Sidebar (1 Col) */}
        <div className="backdrop-blur-md bg-white/70 border border-white/40 rounded-3xl p-5 shadow-xs flex flex-col justify-between max-h-[640px]">
          <div>
            
            {/* Sidebar Tabs: Inspector vs All Items List */}
            <div className="flex items-center space-x-1 p-1 rounded-xl bg-[#EFECE6] border border-[#E5E1D8] mb-4">
              <button
                onClick={() => setSidebarTab('inspector')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  sidebarTab === 'inspector'
                    ? 'bg-white text-[#2C2C2C] shadow-xs'
                    : 'text-[#706B65] hover:text-[#2C2C2C]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Inspector</span>
              </button>

              <button
                onClick={() => setSidebarTab('items')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-all ${
                  sidebarTab === 'items'
                    ? 'bg-white text-[#2C2C2C] shadow-xs'
                    : 'text-[#706B65] hover:text-[#2C2C2C]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>All Items ({elements.length})</span>
              </button>
            </div>

            {/* TAB 1: INSPECTOR */}
            {sidebarTab === 'inspector' && (
              <>
                {selectedElement ? (
                  <div className="space-y-3.5 text-xs">
                    {/* Element Type badge */}
                    <div className="flex items-center justify-between pb-2 border-b border-[#EAE6DF]">
                      <span className="text-[#706B65]">Selected Element:</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-[#2C2C2C] text-white font-bold capitalize">
                        {selectedElement.type}
                      </span>
                    </div>

                    {/* Seat Code / Label */}
                    {selectedElement.type === 'seat' ? (
                      <>
                        <div>
                          <label className="block text-[#59524A] font-semibold mb-1">
                            Seat ID / Code:
                          </label>
                          <input
                            type="text"
                            value={selectedElement.seatCode || ''}
                            onChange={(e) =>
                              handleUpdateSelected({
                                seatCode: e.target.value.toUpperCase(),
                                label: e.target.value.toUpperCase(),
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-bold text-[#2C2C2C]"
                          />
                        </div>

                        <div>
                          <label className="block text-[#59524A] font-semibold mb-1">
                            Row Letter:
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            value={selectedElement.row || ''}
                            onChange={(e) =>
                              handleUpdateSelected({
                                row: e.target.value.toUpperCase(),
                              })
                            }
                            className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-bold text-[#2C2C2C]"
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-[#59524A] font-semibold mb-1">
                          Label / Name:
                        </label>
                        <input
                          type="text"
                          value={selectedElement.label || ''}
                          onChange={(e) =>
                            handleUpdateSelected({ label: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs font-medium text-[#2C2C2C]"
                        />
                      </div>
                    )}

                    {/* Dimensions */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[#706B65] text-[10px] mb-1">
                          Width (px)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={800}
                          value={selectedElement.width}
                          onChange={(e) =>
                            handleUpdateSelected({ width: parseInt(e.target.value, 10) || 20 })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E1D8] text-xs font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[#706B65] text-[10px] mb-1">
                          Height (px)
                        </label>
                        <input
                          type="number"
                          min={10}
                          max={800}
                          value={selectedElement.height}
                          onChange={(e) =>
                            handleUpdateSelected({ height: parseInt(e.target.value, 10) || 20 })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[#E5E1D8] text-xs font-mono"
                        />
                      </div>
                    </div>

                    {/* Coordinates */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E1D8]">
                      <div>
                        <span className="block text-[#706B65] text-[10px]">Position X:</span>
                        <span className="font-mono text-xs font-semibold text-[#2C2C2C]">
                          {Math.round(selectedElement.x)}px
                        </span>
                      </div>
                      <div>
                        <span className="block text-[#706B65] text-[10px]">Position Y:</span>
                        <span className="font-mono text-xs font-semibold text-[#2C2C2C]">
                          {Math.round(selectedElement.y)}px
                        </span>
                      </div>
                    </div>

                    {/* Big Prominent Action Buttons */}
                    <div className="pt-2 space-y-2">
                      <button
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#FDF2F2] hover:bg-[#FDE8E8] border border-[#F8B4B4] text-[#9B1C1C] font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete This {selectedElement.type.toUpperCase()}</span>
                      </button>

                      <button
                        onClick={handleDuplicateSelected}
                        className="w-full py-2 px-3 rounded-xl bg-white hover:bg-[#F3F0EA] border border-[#E5E1D8] font-bold text-[#2C2C2C] flex items-center justify-center space-x-1.5 transition-all shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#FAF9F6] border border-[#E5E1D8] text-center text-xs text-[#8C857B]">
                    <p className="font-bold text-[#2C2C2C] mb-1">No Element Selected</p>
                    <p>Click any wall, pillar, bookshelf, or desk on the canvas to inspect or delete it.</p>
                  </div>
                )}
              </>
            )}

            {/* TAB 2: ALL FLOOR ITEMS LIST (Direct 1-Click Delete for any wall/pillar/desk) */}
            {sidebarTab === 'items' && (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1 text-xs">
                {/* Walls Category */}
                <div>
                  <div className="flex items-center justify-between font-bold text-[#2C2C2C] mb-1">
                    <span className="flex items-center gap-1">
                      <Square className="w-3 h-3" />
                      Walls ({walls.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {walls.map((w) => (
                      <div
                        key={w.id}
                        onClick={() => setSelectedId(w.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          selectedId === w.id
                            ? 'bg-[#2C2C2C] text-white border-[#2C2C2C]'
                            : 'bg-white hover:bg-[#FAF9F6] text-[#2C2C2C] border-[#E5E1D8]'
                        }`}
                      >
                        <span className="truncate max-w-[120px] font-medium">
                          {w.label || 'Wall'} ({w.width}×{w.height})
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(w.id);
                          }}
                          className="p-1 rounded-md hover:bg-[#FDF2F2] text-[#9B1C1C] hover:text-[#771D1D]"
                          title="Delete wall"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pillars Category */}
                <div>
                  <div className="flex items-center justify-between font-bold text-[#2C2C2C] mb-1">
                    <span className="flex items-center gap-1">
                      <Columns className="w-3 h-3 text-[#706B65]" />
                      Pillars ({pillars.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {pillars.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => setSelectedId(p.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          selectedId === p.id
                            ? 'bg-[#2C2C2C] text-white border-[#2C2C2C]'
                            : 'bg-white hover:bg-[#FAF9F6] text-[#2C2C2C] border-[#E5E1D8]'
                        }`}
                      >
                        <span className="truncate font-medium">{p.label || 'Pillar'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(p.id);
                          }}
                          className="p-1 rounded-md hover:bg-[#FDF2F2] text-[#9B1C1C]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bookshelves Category */}
                <div>
                  <div className="flex items-center justify-between font-bold text-[#2C2C2C] mb-1">
                    <span className="flex items-center gap-1">
                      <BookMarked className="w-3 h-3 text-[#A87B42]" />
                      Bookshelves ({bookshelves.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {bookshelves.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedId(b.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                          selectedId === b.id
                            ? 'bg-[#2C2C2C] text-white border-[#2C2C2C]'
                            : 'bg-white hover:bg-[#FAF9F6] text-[#2C2C2C] border-[#E5E1D8]'
                        }`}
                      >
                        <span className="truncate font-medium">{b.label || 'Bookshelf'}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(b.id);
                          }}
                          className="p-1 rounded-md hover:bg-[#FDF2F2] text-[#9B1C1C]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desks / Seats Category */}
                <div>
                  <div className="flex items-center justify-between font-bold text-[#2C2C2C] mb-1">
                    <span className="flex items-center gap-1">
                      <Armchair className="w-3 h-3 text-[#A87B42]" />
                      Desks ({seats.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    {seats.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => setSelectedId(s.id)}
                        className={`p-1.5 rounded-lg border flex items-center justify-between transition-all cursor-pointer ${
                          selectedId === s.id
                            ? 'bg-[#2C2C2C] text-white border-[#2C2C2C]'
                            : 'bg-white hover:bg-[#FAF9F6] text-[#2C2C2C] border-[#E5E1D8]'
                        }`}
                      >
                        <span className="font-bold text-[11px]">{s.seatCode}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteElement(s.id);
                          }}
                          className="p-1 rounded-md hover:bg-[#FDF2F2] text-[#9B1C1C]"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Quick Return to Map Button */}
          <div className="pt-4 border-t border-[#EAE6DF] mt-4">
            <button
              onClick={onReturnToMap}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2C2C2C] hover:bg-[#1E1E1E] text-white text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-xs"
            >
              <span>Back to Live Seat Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
