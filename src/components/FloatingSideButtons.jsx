import React, { useState } from 'react';

const buttons = [
  { key: 'tickets', label: 'Support', icon: '💬', color: 'from-blue-500 to-blue-300' },
  { key: 'deposit', label: 'Deposit', icon: '💸', color: 'from-green-500 to-green-300' },
  { key: 'referral', label: 'Referral', icon: '🔗', color: 'from-yellow-400 to-accent' },
  { key: 'kyc', label: 'KYC', icon: '🛡️', color: 'from-yellow-400 to-yellow-200' },
];

export default function FloatingSideButtons({ onTab }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed z-50 right-6 bottom-8 flex flex-col items-end" style={{ pointerEvents: 'auto' }}>
      {/* Action Buttons */}
      <div className={`flex flex-col items-end gap-4 mb-2 transition-all duration-300 ${open ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'}`}>
        {buttons.map((btn, i) => (
          <button
            key={btn.key}
            onClick={() => { setOpen(false); onTab(btn.key); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-br ${btn.color} text-gray-900 font-bold shadow-2xl border-2 border-white hover:scale-110 transition-transform text-lg drop-shadow-lg`}
            style={{ transitionDelay: `${open ? i * 60 : 0}ms` }}
          >
            <span className="text-2xl">{btn.icon}</span>
            <span className="hidden md:inline font-semibold">{btn.label}</span>
          </button>
        ))}
      </div>
      {/* Main FAB */}
      <button
        className={`w-16 h-16 rounded-full bg-gradient-to-br from-accent to-sui shadow-2xl flex items-center justify-center text-3xl font-extrabold border-4 border-white hover:scale-110 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Actions"
      >
        {open ? '×' : '⚡'}
      </button>
    </div>
  );
}
