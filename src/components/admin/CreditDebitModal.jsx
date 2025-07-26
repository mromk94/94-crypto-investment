import React, { useState, useEffect } from 'react';

export default function CreditDebitModal({ open, onClose, onSubmit, user }) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('credit');
  const [note, setNote] = useState('');
  useEffect(() => {
    setAmount(''); setType('credit'); setNote('');
  }, [user, open]);
  if (!open || !user) return null;
  function handleSubmit(e) {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return;
    onSubmit({ type, amount: amt, note });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4 border-2 border-accent" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-accent mb-2">{type === 'credit' ? 'Credit' : 'Debit'} User Balance</h2>
        <div className="flex gap-4 mb-2">
          <button type="button" className={`btn flex-1 ${type==='credit'?'btn-accent':'btn-gray'}`} onClick={() => setType('credit')}>Credit</button>
          <button type="button" className={`btn flex-1 ${type==='debit'?'btn-accent':'btn-gray'}`} onClick={() => setType('debit')}>Debit</button>
        </div>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">Amount</span>
          <input type="number" min="1" step="any" className="input text-black" value={amount} onChange={e => setAmount(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">Note (optional)</span>
          <input className="input text-black" value={note} onChange={e => setNote(e.target.value)} />
        </label>
        <div className="flex gap-4 mt-4">
          <button type="button" onClick={onClose} className="btn flex-1 btn-gray">Cancel</button>
          <button type="submit" className="btn flex-1 btn-accent">Submit</button>
        </div>
      </form>
    </div>
  );
}
