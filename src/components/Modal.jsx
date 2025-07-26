import React from 'react';

export default function Modal({ open, onClose, children, title, maxWidth = 'max-w-lg' }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className={`bg-gray-900 rounded-2xl shadow-2xl p-6 w-full ${maxWidth} relative animate-fadein`}>
        <button
          className="absolute top-3 right-4 text-accent text-2xl font-bold hover:text-sui focus:outline-none"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>
        {title && <h2 className="text-2xl font-extrabold mb-4 text-accent text-center">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}
