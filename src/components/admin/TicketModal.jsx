import React, { useState, useEffect } from 'react';

export default function TicketModal({ open, onClose, onSave, initial, title, fields }) {
  const [form, setForm] = useState(initial || {});
  useEffect(() => { setForm(initial || {}); }, [initial, open]);
  if (!open) return null;
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSave(form);
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-4 border-2 border-accent" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-accent mb-2">{title}</h2>
        {fields.map(f => (
          <label key={f.name} className="flex flex-col gap-1">
            <span className="font-semibold text-accent">{f.label}</span>
            {f.type === 'textarea' ? (
              <textarea name={f.name} value={form[f.name]||''} onChange={handleChange} className="input text-black" rows={2} required={f.required} />
            ) : f.type === 'checkbox' ? (
              <input type="checkbox" name={f.name} checked={!!form[f.name]} onChange={handleChange} className="input" />
            ) : (
              <input type={f.type||'text'} name={f.name} value={form[f.name]||''} onChange={handleChange} className="input text-black" required={f.required} />
            )}
          </label>
        ))}
        <div className="flex gap-4 mt-4">
          <button type="button" onClick={onClose} className="btn flex-1 btn-gray">Cancel</button>
          <button type="submit" className="btn flex-1 btn-accent">Save</button>
        </div>
      </form>
    </div>
  );
}
