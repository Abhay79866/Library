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
    <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 border-b border-white/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 gap-2.5 sm:gap-4">
          
          {/* Brand & Mobile Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#2C2C2C] text-[#FAF9F6] flex items-center justify-center shadow-xs shrink-0">
                <Armchair className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                  <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#2C2C2C] truncate">
                    Sucess kar Library
                  </h1>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-[#F3F0EA] text-[#6E675F] border border-[#E5E1D8]">
                    <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#A87B42]" />
                    Admin
                  </span>
                  {/* Firestore status indicator */}
                  <span
                    className={`inline-flex items-center gap-1 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold border ${
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
                    <Database className="w-2.5 h-2.5 hidden xs:inline" />
                    <span>Live Sync</span>
                  </span>
                </div>
                <p className="text-[11px] text-[#706B65] hidden sm:block truncate">
                  Seat management, shifts, bookings & visual canvas layout
                </p>
              </div>
            </div>

            {/* Mobile Header Quick Actions */}
            <div className="flex sm:hidden items-center space-x-1.5">
              <button
                onClick={onOpenLedger}
                className="p-1.5 rounded-lg bg-white border border-[#E5E1D8] text-[#2C2C2C]"
                title="Bookings Ledger"
              >
                <Receipt className="w-4 h-4 text-[#A87B42]" />
              </button>
              <button
                onClick={onOpenReminders}
                className="relative p-1.5 rounded-lg bg-white border border-[#E5E1D8] text-[#2C2C2C]"
                title="WhatsApp Reminders"
              >
                <Bell className="w-4 h-4 text-[#4A7C59]" />
                {expiringCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#E2A9A1] text-[#2C2C2C] text-[9px] font-bold flex items-center justify-center border border-white">
                    {expiringCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Navigation Tabs & Metrics */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5 sm:gap-2.5 text-xs">
            
            {/* View Navigation Switcher */}
            <div className="inline-flex p-0.5 rounded-xl bg-[#EFECE6] border border-[#E5E1D8]">
              <button
                onClick={() => onTabChange('map')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold transition-all text-xs ${
                  activeTab === 'map'
                    ? 'bg-white text-[#2C2C2C] shadow-xs'
                    : 'text-[#706B65] hover:text-[#2C2C2C]'
                }`}
              >
                Seat Map
              </button>
              <button
                onClick={() => onTabChange('editor')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 text-xs ${
                  activeTab === 'editor'
                    ? 'bg-white text-[#2C2C2C] shadow-xs'
                    : 'text-[#706B65] hover:text-[#2C2C2C]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-[#A87B42]" />
                <span>Layout Editor</span>
              </button>
            </div>

            {/* Quick Stat: Available */}
            <div className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#F3F0EA] border border-[#E5E1D8] flex items-center space-x-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#F3F0EA] border border-[#A8A196]" />
              <span className="text-[#706B65] hidden xs:inline">Available:</span>
              <span className="font-bold text-[#2C2C2C]">{availableCount}</span>
            </div>

            {/* Quick Stat: Booked */}
            <div className="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-[#FBEFEF] border border-[#F0D5D1] flex items-center space-x-1.5 text-xs">
              <div className="w-2 h-2 rounded-full bg-[#E2A9A1]" />
              <span className="text-[#8A5852] hidden xs:inline">Booked:</span>
              <span className="font-bold text-[#66312B]">{bookedCount}</span>
            </div>

            {/* Stat Pill: Revenue (Desktop & Tablet) */}
            <div className="hidden md:flex px-2.5 py-1.5 rounded-lg bg-white/80 border border-[#E5E1D8] items-center space-x-1.5 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#A87B42]" />
              <span className="text-[#706B65]">Est. Revenue:</span>
              <span className="font-bold text-[#2C2C2C]">₹{revenue.toLocaleString('en-IN')}</span>
            </div>

            {/* Desktop Action Buttons */}
            <div className="hidden sm:flex items-center space-x-1.5">
              <button
                onClick={onOpenLedger}
                className="px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-[#F3F0EA] border border-[#E5E1D8] text-[#2C2C2C] font-semibold flex items-center space-x-1.5 transition-all text-xs shadow-2xs"
              >
                <Receipt className="w-3.5 h-3.5 text-[#A87B42]" />
                <span>Ledger</span>
              </button>

              <button
                onClick={onOpenReminders}
                className="relative px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-[#F3F0EA] border border-[#E5E1D8] text-[#2C2C2C] font-semibold flex items-center space-x-1.5 transition-all text-xs shadow-2xs"
              >
                <Bell className="w-3.5 h-3.5 text-[#4A7C59]" />
                <span>Reminders</span>
                {expiringCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#E2A9A1] text-[#2C2C2C] text-[10px] font-bold">
                    {expiringCount}
                  </span>
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
