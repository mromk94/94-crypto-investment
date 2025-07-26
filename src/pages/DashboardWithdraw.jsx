import React, { useState, useEffect } from 'react';
import TransactionHistory from '../components/dashboard/TransactionHistory';

export default function DashboardWithdraw() {
  // Assume demo user id '1' for demo/testing
  const userId = '1';
  let pins = [];
  try {
    const allPins = JSON.parse(localStorage.getItem('tsm_withdrawal_pins')) || {};
    pins = allPins[userId] || [];
  } catch {
    pins = [];
  }

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('TON');
  const [pinInput, setPinInput] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Fetch history
  const deposits = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('tsm_deposits')) || [];
    } catch {
      return [];
    }
  }, []);
  const withdrawals = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('tsm_withdrawals')) || [];
    } catch {
      return [];
    }
  }, []);

  const handleSubmit = e => {
    e.preventDefault();
    setError('');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return setError('Enter a valid amount.');
    if (pins.length > 0) {
      if (!pinInput.trim()) return setError('Withdrawal PIN is required.');
      const found = pins.some(p => p.pin === pinInput.trim());
      if (!found) return setError('Incorrect PIN. Please try again.');
    }
    // Log withdrawal
    const withdrawals = JSON.parse(localStorage.getItem('tsm_withdrawals') || '[]');
    withdrawals.push({ currency, amount: Number(Number(amount).toFixed(2)), date: new Date().toISOString(), status: 'pending' });
    localStorage.setItem('tsm_withdrawals', JSON.stringify(withdrawals));
    setSuccess(`Withdrawal of ${amount} ${currency} initiated!`);
    setAmount('');
    setPinInput('');
  };

  return (
    <>
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded shadow flex flex-col gap-8">
        <form className="w-full" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-6 text-accent">Withdraw</h2>
            {success && <div className="mb-4 text-green-400">{success}</div>}
            {error && <div className="mb-4 text-red-400">{error}</div>}
            <div className="flex flex-wrap gap-4 mb-4">
              <label className="flex-1 min-w-[120px]">
                <span className="font-semibold text-accent">Wallet</span>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 text-black" required>
                  <option value="TON">TON</option>
                  <option value="SUI">SUI</option>
                  <option value="USD">USD/USDT</option>
                </select>
              </label>
            </div>
            <label className="block mb-4">
              <span className="font-semibold text-accent">Amount</span>
              <input type="number" min="1" step="any" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 text-black mt-1" placeholder="Amount" required />
            </label>
            {pins.length > 0 && (
              <label className="block mb-6">
                <span className="font-semibold text-accent">Withdrawal PIN <span className='text-red-400'>*</span></span>
                <input type="text" value={pinInput} onChange={e => setPinInput(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 text-black mt-1" placeholder="Enter PIN" required />
              </label>
            )}
            <button type="submit" className="w-full py-2 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition">Withdraw</button>
          </form>

        <div>
          <h3 className="text-lg font-bold text-accent mb-2">Your Transactions</h3>
          {deposits.length === 0 && withdrawals.length === 0 ? (
            <div className="text-gray-400">No transactions yet.</div>
          ) : (
            <TransactionHistory deposits={deposits} withdrawals={withdrawals} />
          )}
        </div>
      </div>
    </>
  );
}
