import React from 'react';
import { Armchair, ShieldCheck, Bell, Sparkles, Building2, Database, Receipt } from 'lucide-react';

interface HeaderProps {
  totalSeats: number;
  availableCount: number;
  bookedCount: number;
  maintenanceCount: number;
  revenue: number;
  expiringCount: number;
  isFirestoreLive: boolean;
  onOpenReminders: () => void;
  onOpenLedger: () => void;
  activeTab: 'map' | 'editor';
  onTabChange: (tab: 'map' | 'editor') => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalSeats,
  availableCount,
  bookedCount,
  maintenanceCount,
  revenue,
  expiringCount,
  isFirestoreLive,
  onOpenReminders,
  onOpenLedger,
  activeTab,
  onTabChange,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/70 border-b border-white/40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          
          {/* Brand & Admin Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#2C2C2C] text-[#FAF9F6] flex items-center justify-center shadow-xs">
                <Armchair className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-lg font-bold tracking-tight text-[#2C2C2C]">
                    StudySpot Library
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-[#F3F0EA] text-[#6E675F] border border-[#E5E1D8]">
                    <ShieldCheck className="w-3 h-3 text-[#A87B42]" />
                    Admin
                  </span>
                  {/* Firestore status indicator */}
                  <span
                    className={`hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isFirestoreLive
                        ? 'bg-[#F2F7F4] text-[#2F6B45] border-[#D4E7DC]'
                        : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isFirestoreLive ? 'bg-[#2F6B45] animate-pulse' : 'bg-[#92400E]'
                      }`}
                    />
                    <Database className="w-2.5 h-2.5" />
                    Firestore Live
                  </span>
                </div>
                <p className="text-xs text-[#706B65]">
                  Real-time seat allocation, cash/UPI payments & database sync
                </p>
              </div>
            </div>

            {/* Quick Mobile buttons */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={onOpenLedger}
                className="p-2 rounded-lg bg-white/80 border border-[#E5E1D8] text-[#2C2C2C]"
                title="Bookings Ledger"
              >
                <Receipt className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenReminders}
                className="relative p-2 rounded-lg bg-white/80 border border-[#E5E1D8] text-[#2C2C2C]"
                title="WhatsApp Reminders"
              >
                <Bell className="w-4 h-4" />
                {expiringCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E2A9A1] text-[#2C2C2C] text-[10px] font-bold flex items-center justify-center border border-white">
                    {expiringCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs">
            {/* Navigation Tabs */}
            <div className="inline-flex p-0.5 rounded-lg bg-[#EFECE6] border border-[#E5E1D8] mr-1">
              <button
                onClick={() => onTabChange('map')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  activeTab === 'map'
                    ? 'bg-white text-[#2C2C2C] shadow-xs'
                    : 'text-[#706B65] hover:text-[#2C2C2C]'
                }`}
              >
                Seat Map
              </button>
              <button
                onClick={() => onTabChange('editor')}
                className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 ${
                  activeTab === 'editor'
                    ? 'bg-white text-[#2C2C2C] shadow-xs'
                    : 'text-[#706B65] hover:text-[#2C2C2C]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Layout Editor (Phase 4)
              </button>
            </div>

            {/* Stat Pill: Available */}
            <div className="px-3 py-1.5 rounded-lg bg-[#F3F0EA] border border-[#E5E1D8] flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#F3F0EA] border border-[#A8A196]" />
              <span className="text-[#706B65]">Available:</span>
              <span className="font-semibold text-[#2C2C2C]">{availableCount}</span>
            </div>

            {/* Stat Pill: Booked */}
            <div className="px-3 py-1.5 rounded-lg bg-[#FBEFEF] border border-[#F0D5D1] flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#E2A9A1]" />
              <span className="text-[#8A5852]">Booked:</span>
              <span className="font-semibold text-[#66312B]">{bookedCount}</span>
            </div>

            {/* Stat Pill: Revenue */}
            <div className="hidden lg:flex px-3 py-1.5 rounded-lg bg-white/80 border border-[#E5E1D8] items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#A87B42]" />
              <span className="text-[#706B65]">Revenue:</span>
              <span className="font-bold text-[#2C2C2C]">₹{revenue.toLocaleString('en-IN')}</span>
            </div>

            {/* Bookings Ledger Button */}
            <button
              onClick={onOpenLedger}
              className="px-3 py-1.5 rounded-lg bg-white/90 hover:bg-[#F3F0EA] border border-[#E5E1D8] text-[#2C2C2C] font-medium flex items-center space-x-1.5 transition-all shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5 text-[#A87B42]" />
              <span>Bookings Ledger</span>
            </button>

            {/* WhatsApp Reminder Button */}
            <button
              onClick={onOpenReminders}
              className="relative px-3 py-1.5 rounded-lg bg-white/90 hover:bg-[#F3F0EA] border border-[#E5E1D8] text-[#2C2C2C] font-medium flex items-center space-x-1.5 transition-all shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5 text-[#4A7C59]" />
              <span>Expiry Reminders</span>
              {expiringCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#E2A9A1] text-[#2C2C2C] text-[10px] font-bold">
                  {expiringCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
