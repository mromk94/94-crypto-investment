import React, { useState, useEffect } from 'react';

const FIELD_TYPES = [
  { type: 'text', label: 'Text Input' },
  { type: 'number', label: 'Number Input' },
  { type: 'file', label: 'File Upload' },
  { type: 'date', label: 'Date Picker' },
  { type: 'select', label: 'Dropdown' },
  { type: 'textarea', label: 'Textarea' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'radio', label: 'Radio Group' },
];

export default function AdminKycBuilder({ fetchKycForm, saveKycForm }) {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchKycForm()
      .then(f => { setFields(f); setLoading(false); })
      .catch(e => { setError('Failed to load KYC form'); setLoading(false); });
  }, [fetchKycForm]);

  function addField(type) {
    // Default options for select/radio
    let field = { type, label: '', required: false, id: Date.now() + Math.random() };
    if (type === 'select' || type === 'radio') field.options = ['Option 1', 'Option 2'];
    setFields([...fields, field]);
  }

  function updateField(idx, key, value) {
    setFields(fields.map((f, i) => i === idx ? { ...f, [key]: value } : f));
  }

  function updateOption(idx, optIdx, value) {
    setFields(fields.map((f, i) =>
      i === idx ? { ...f, options: f.options.map((o, oi) => oi === optIdx ? value : o) } : f
    ));
  }

  function addOption(idx) {
    setFields(fields.map((f, i) =>
      i === idx ? { ...f, options: [...(f.options || []), `Option ${f.options.length + 1}`] } : f
    ));
  }

  function removeOption(idx, optIdx) {
    setFields(fields.map((f, i) =>
      i === idx ? { ...f, options: f.options.filter((_, oi) => oi !== optIdx) } : f
    ));
  }

  function deleteField(idx) {
    setFields(fields.filter((_, i) => i !== idx));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    try {
      await saveKycForm(fields);
      setSuccess('KYC form saved!');
    } catch (e) {
      setError('Failed to save KYC form');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-accent">Loading KYC form...</div>;

  return (
    <form className="max-w-3xl mx-auto bg-gray-900 rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col gap-6 w-full" onSubmit={handleSave}>
      <h2 className="text-2xl font-bold text-accent mb-2">KYC Form Builder</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {FIELD_TYPES.map(ft => (
          <button key={ft.type} type="button" className="btn btn-accent" onClick={() => addField(ft.type)}>{ft.label}</button>
        ))}
      </div>
      <div className="flex flex-col gap-4 max-h-[44vh] sm:max-h-[60vh] overflow-y-auto pr-1">
        {fields.map((field, idx) => (
          <div key={field.id} className="bg-gray-800 rounded-xl p-4 flex flex-col sm:flex-row flex-wrap items-center gap-4 shadow w-full min-w-0">
            <span className="font-bold text-accent uppercase w-full sm:w-24 truncate">{field.type}</span>
            <input className="input text-black flex-1 min-w-0 w-full sm:w-auto" placeholder="Label" value={field.label} onChange={e => updateField(idx, 'label', e.target.value)} required />
            {field.type === 'file' && (
              <div className="flex flex-col gap-1 w-full sm:w-2/3">
                <label className="text-accent text-xs font-bold">Allowed file types:</label>
                <span className="text-xs text-gray-400">jpeg, jpg, png, pdf, txt, doc, docx</span>
                <input type="file" className="input text-black" accept=".jpeg,.jpg,.png,.pdf,.txt,.doc,.docx" disabled />
              </div>
            )}
            {['select','radio'].includes(field.type) && (
              <div className="flex flex-col gap-1 w-full sm:w-2/3">
                <label className="text-accent text-xs font-bold">Options:</label>
                <div className="flex flex-col gap-1 max-h-32 overflow-y-auto">
                  {field.options && field.options.map((opt, optIdx) => (
                    <div key={optIdx} className="flex gap-2 items-center mb-1 w-full">
                      <input className="input text-black flex-1 min-w-0" value={opt} onChange={e => updateOption(idx, optIdx, e.target.value)} required />
                      <button type="button" className="btn btn-xs btn-red" onClick={() => removeOption(idx, optIdx)}></button>
                    </div>
                  ))}
                </div>
                <button type="button" className="btn btn-xs btn-accent mt-1" onClick={() => addOption(idx)}>Add Option</button>
              </div>
            )}
            <label className="flex items-center gap-1 w-full sm:w-auto">
              <input type="checkbox" checked={field.required} onChange={e => updateField(idx, 'required', e.target.checked)} /> <span>Required</span>
            </label>
            <button type="button" className="btn btn-red ml-0 sm:ml-2 w-full sm:w-auto" onClick={() => deleteField(idx)}>Delete</button>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}
      <button type="submit" className="btn btn-accent mt-4 w-full sm:w-auto" disabled={saving}>{saving ? 'Saving...' : 'Save KYC Form'}</button>
    </form>
  );
}
