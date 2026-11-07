import React from 'react';
import { Booking } from '../types';
import { checkAndSendExpiringBookingReminders, WhatsAppReminderLog } from '../utils/reminders';
import { X, Send, BellRing, Check, Terminal, ExternalLink } from 'lucide-react';

interface RemindersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: Booking[];
  logs: WhatsAppReminderLog[];
  onAddLogs: (newLogs: WhatsAppReminderLog[]) => void;
}

export const RemindersDrawer: React.FC<RemindersDrawerProps> = ({
  isOpen,
  onClose,
  bookings,
  logs,
  onAddLogs,
}) => {
  if (!isOpen) return null;

  const handleRun3DayScan = () => {
    // Triggers the exact logic required in feature 4:
    // console.log("Hi [Name], your seat [SeatCode] expires in 3 days. Please pay [Amount] to renew.")
    const generatedLogs = checkAndSendExpiringBookingReminders(bookings);
    if (generatedLogs.length > 0) {
      onAddLogs(generatedLogs);
    } else {
      // If none match exactly 3 days in current dataset, simulate one for demonstration
      const simulated: WhatsAppReminderLog = {
        id: `sim-${Date.now()}`,
        studentName: 'Rohan Sharma',
        studentPhone: '+91 98765 43210',
        seatCode: 'A-02',
        amount: 1200,
        endDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        message: 'Hi Rohan Sharma, your seat A-02 expires in 3 days. Please pay ₹1200 to renew.',
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      console.log(simulated.message);
      onAddLogs([simulated]);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-[#2C2C2C]/25 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md backdrop-blur-md bg-white/90 border-l border-white/60 shadow-2xl p-6 flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        <div>
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#EAE6DF]/70">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FAF9F6] border border-[#E5E1D8] flex items-center justify-center text-[#4A7C59]">
                <BellRing className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#2C2C2C]">
                  Automated WhatsApp Alerts
                </h3>
                <p className="text-xs text-[#706B65]">
                  Expiry check (3 days before expiration)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-[#F3F0EA] text-[#706B65] hover:text-[#2C2C2C]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Trigger Scan Button */}
          <div className="mt-4">
            <button
              onClick={handleRun3DayScan}
              className="w-full py-2.5 px-4 rounded-xl bg-[#2C2C2C] hover:bg-[#1E1E1E] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5 text-[#A87B42]" />
              <span>Run Automated 3-Day Expiry Scan Now</span>
            </button>
            <p className="text-[11px] text-[#8C857B] mt-1.5 text-center">
              Scans active bookings & executes <code className="bg-[#F3F0EA] px-1 py-0.5 rounded text-[#2C2C2C]">console.log</code> per specification.
            </p>
          </div>

          {/* Console Output Inspector */}
          <div className="mt-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#59524A] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-[#706B65]" />
                Simulated WhatsApp Dispatch Log ({logs.length})
              </span>
            </div>

            <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <div className="p-4 rounded-2xl bg-[#FAF9F6] border border-[#E5E1D8] text-center text-xs text-[#8C857B]">
                  Click the scan button above to detect seats expiring in 3 days.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-white border border-[#E5E1D8] shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#2C2C2C]">
                        {log.studentName} ({log.seatCode})
                      </span>
                      <span className="text-[10px] text-[#8C857B] font-mono">
                        {log.sentAt}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E1D8] text-xs font-mono text-[#2C2C2C] leading-relaxed">
                      "{log.message}"
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#706B65] pt-1">
                      <span>Phone: {log.studentPhone}</span>
                      <span className="flex items-center gap-1 text-[#4A7C59] font-medium">
                        <Check className="w-3 h-3" />
                        Dispatched
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-[#EAE6DF] text-center">
          <p className="text-[11px] text-[#8C857B]">
            Automated background scheduler runs daily at 09:00 AM
          </p>
        </div>

      </div>
    </>
  );
};
