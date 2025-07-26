import React, { useState } from 'react';

export default function CollapsibleKycButton({ onClick }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 px-4 py-3 rounded-full bg-yellow-400 text-gray-900 font-bold shadow-lg hover:bg-yellow-300 transition text-lg border-2 border-white"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="text-2xl">🛡️</span>
        <span className="hidden md:inline font-semibold">KYC</span>
        <span className="ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-gray-900 border border-yellow-400 rounded-lg shadow-2xl p-4 z-50 animate-fade-in">
          <div className="text-yellow-300 mb-2 font-bold">KYC Verification</div>
          <div className="text-sm text-gray-200 mb-3">Complete your KYC to unlock all features and increase your trust score.</div>
          <button
            className="w-full py-2 rounded bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300 transition"
            onClick={() => { setOpen(false); onClick && onClick(); }}
          >
            Go to KYC
          </button>
        </div>
      )}
    </div>
  );
}
