import React, { useEffect, useState } from 'react';

// Simulate fetching the current KYC form fields from admin
async function fetchKycForm() {
  // This would be replaced by an API call in production
  return [
    { id: 1, type: 'text', label: 'Full Name', required: true },
    { id: 2, type: 'number', label: 'Age', required: false },
    { id: 3, type: 'file', label: 'ID Document', required: true },
    { id: 4, type: 'select', label: 'Account Type', required: true, options: ['Personal', 'Business'] },
  ];
}

const ACCEPTED_FILE_TYPES = '.jpeg,.jpg,.png,.pdf,.txt,.doc,.docx';

export default function DashboardKyc({ user, onVerify }) {
  const [fields, setFields] = useState([]);
  const [form, setForm] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchKycForm().then(setFields);
  }, []);

  function handleChange(id, value) {
    setForm(f => ({ ...f, [id]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setError(null); setSuccess(null);
    // Simulate upload
    setTimeout(() => {
      setSubmitting(false);
      setSuccess('KYC submitted! (Simulated)');
      console.log('KYC submission:', form);
    }, 800);
  }

  if (user.kycVerified) {
    return <div className="max-w-lg mx-auto bg-gray-800 p-8 rounded shadow text-green-400 font-bold">Your KYC is verified!</div>;
  }

  return (
    <form className="max-w-lg mx-auto bg-gray-800 p-8 rounded shadow flex flex-col gap-6" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-6 text-yellow-400">KYC Verification</h2>
      <div className="mb-4 text-yellow-300">Your KYC is not verified. Please fill out the form below for verification.</div>
      {fields.map(f => (
        <div key={f.id} className="flex flex-col gap-1">
          <label className="text-accent font-semibold mb-1">{f.label}{f.required && <span className="text-red-400">*</span>}</label>
          {f.type === 'text' && <input className="input text-black" required={f.required} value={form[f.id]||''} onChange={e => handleChange(f.id, e.target.value)} />}
          {f.type === 'number' && <input className="input text-black" type="number" required={f.required} value={form[f.id]||''} onChange={e => handleChange(f.id, e.target.value)} />}
          {f.type === 'file' && (
            <input className="input text-black" type="file" accept={ACCEPTED_FILE_TYPES} required={f.required} onChange={e => handleChange(f.id, e.target.files[0])} />
          )}
          {f.type === 'select' && (
            <select className="input text-black" required={f.required} value={form[f.id]||''} onChange={e => handleChange(f.id, e.target.value)}>
              <option value="">Select...</option>
              {f.options && f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          )}
          {f.type === 'textarea' && <textarea className="input text-black" required={f.required} value={form[f.id]||''} onChange={e => handleChange(f.id, e.target.value)} />}
          {f.type === 'date' && <input className="input text-black" type="date" required={f.required} value={form[f.id]||''} onChange={e => handleChange(f.id, e.target.value)} />}
          {f.type === 'checkbox' && <input type="checkbox" checked={!!form[f.id]} onChange={e => handleChange(f.id, e.target.checked)} />}
          {f.type === 'radio' && f.options && f.options.map(opt => (
            <label key={opt} className="inline-flex items-center gap-2 mr-4">
              <input type="radio" name={`kyc-radio-${f.id}`} value={opt} checked={form[f.id] === opt} onChange={e => handleChange(f.id, opt)} required={f.required} />
              {opt}
            </label>
          ))}
        </div>
      ))}
      {error && <div className="text-red-400">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}
      <button className="w-full py-2 rounded bg-yellow-400 text-gray-900 font-bold hover:bg-yellow-300 transition mt-4" type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit KYC'}</button>
    </form>
  );
}
