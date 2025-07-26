import React, { useState } from 'react';

export default function PlanModal({ open, onClose, onSave, plan }) {
  const [form, setForm] = useState(() => ({
    name: plan?.name || '',
    details: plan?.details || '',
    min: plan?.min || '',
    max: plan?.max || '',
    duration: plan?.duration || '',
    frequency: plan?.frequency || 'daily',
    roi: plan?.roi || '',
  }));
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setForm({
      name: plan?.name || '',
      details: plan?.details || '',
      min: plan?.min || '',
      max: plan?.max || '',
      duration: plan?.duration || '',
      frequency: plan?.frequency || 'daily',
      roi: plan?.roi || '',
    });
    setError(null);
  }, [open, plan]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.details.trim() || !form.min || !form.max || !form.duration || !form.roi) {
      setError('All fields are required.');
      return;
    }
    if (Number(form.min) > Number(form.max)) {
      setError('Min amount cannot be greater than Max amount.');
      return;
    }
    onSave({ ...plan, ...form });
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form
        className="bg-gray-900 rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-lg flex flex-col gap-4 border-2 border-accent"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-accent mb-2">{plan && plan.name ? 'Edit Plan' : 'Add Plan'}</h2>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">Plan Name</span>
          <input name="name" value={form.name} onChange={handleChange} className="input text-black" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">Short Details</span>
          <textarea name="details" value={form.details} onChange={handleChange} className="input text-black" rows={2} required />
        </label>
        <div className="flex flex-wrap gap-4">
          <label className="flex-1 min-w-[140px] flex flex-col gap-1">
            <span className="font-semibold text-accent">Min Amount</span>
            <input name="min" type="number" min="0" value={form.min} onChange={handleChange} className="input text-black" required />
          </label>
          <label className="flex-1 min-w-[140px] flex flex-col gap-1">
            <span className="font-semibold text-accent">Max Amount</span>
            <input name="max" type="number" min="0" value={form.max} onChange={handleChange} className="input text-black" required />
          </label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex-1 min-w-[140px] flex flex-col gap-1">
            <span className="font-semibold text-accent">Duration (days)</span>
            <input name="duration" type="number" min="1" value={form.duration} onChange={handleChange} className="input text-black" required />
          </label>
          <label className="flex-1 min-w-[140px] flex flex-col gap-1">
            <span className="font-semibold text-accent">ROI Frequency</span>
            <select name="frequency" value={form.frequency} onChange={handleChange} className="input text-black">
              <option value="daily">Daily</option>
              <option value="hourly">Hourly</option>
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">ROI (%)</span>
          <input name="roi" type="number" min="0" step="0.01" value={form.roi} onChange={handleChange} className="input text-black" required />
        </label>
        {error && <div className="text-red-400 font-semibold text-sm mt-2">{error}</div>}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <button type="button" onClick={onClose} className="btn flex-1 btn-gray">Cancel</button>
          <button type="submit" className="btn flex-1 btn-accent">Save</button>
        </div>
      </form>
    </div>
  );
}
