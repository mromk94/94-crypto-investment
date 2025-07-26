import React, { useState, useEffect } from 'react';
import TransactionHistory from '../components/dashboard/TransactionHistory';

export default function DashboardDeposit() {
  // Simulate fetching deposit methods from admin (localStorage or fallback)
  const defaultMethods = [
    { name: 'Bank Transfer', type: 'deposit', details: 'Account: 123456789' },
    { name: 'USDT (TRC20)', type: 'deposit', details: 'Wallet: TABC...XYZ' }
  ];
  let adminMethods = [];
  try {
    adminMethods = JSON.parse(localStorage.getItem('tsm_methods')) || defaultMethods;
  } catch {
    adminMethods = defaultMethods;
  }
  const depositMethods = adminMethods.filter(m => m.type === 'deposit');

  const [method, setMethod] = useState(depositMethods[0]?.name || '');
  const [wallet, setWallet] = useState('USD');
  const [amount, setAmount] = useState('');
  const [proof, setProof] = useState(null);
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
    if (!method) return setError('Please select a deposit method.');
    if (!wallet) return setError('Please select a wallet.');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return setError('Enter a valid amount.');
    if (!proof) return setError('Proof of payment is required.');
    // Log deposit request
    const deposits = JSON.parse(localStorage.getItem('tsm_deposits') || '[]');
    deposits.push({ method, wallet, amount: Number(Number(amount).toFixed(2)), proofName: proof.name, proofType: proof.type, submittedAt: new Date().toISOString(), status: 'pending' });
    localStorage.setItem('tsm_deposits', JSON.stringify(deposits));
    setSuccess('Deposit request submitted! Await admin approval.');
    setAmount('');
    setProof(null);
  };

  return (
    <>
      <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded shadow flex flex-col gap-8">
        <form className="w-full" onSubmit={handleSubmit}>
            <h2 className="text-xl font-bold mb-6 text-accent">Deposit</h2>
            {success && <div className="mb-4 text-green-400">{success}</div>}
            {error && <div className="mb-4 text-red-400">{error}</div>}
            <div className="flex flex-wrap gap-4 mb-4">
              <label className="flex-1 min-w-[120px]">
                <span className="font-semibold text-accent">Deposit Method</span>
                <select value={method} onChange={e => setMethod(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 text-black mt-1" required>
                  {depositMethods.map((m, idx) => (
                    <option key={idx} value={m.name}>{m.name} — {m.details}</option>
                  ))}
                </select>
              </label>
              <label className="flex-1 min-w-[120px]">
                <span className="font-semibold text-accent">Target Wallet</span>
                <select value={wallet} onChange={e => setWallet(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 text-black mt-1" required>
                  <option value="USD">USD/USDT</option>
                  <option value="TON">TON</option>
                  <option value="SUI">SUI</option>
                </select>
              </label>
          </div>
          <label className="block mb-4">
            <span className="font-semibold text-accent">Amount</span>
            <input type="number" min="1" step="any" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-4 py-2 rounded bg-gray-700 text-black mt-1" placeholder="Amount" required />
          </label>
          <label className="block mb-6">
            <span className="font-semibold text-accent">Proof of Payment <span className='text-red-400'>*</span></span>
            <input type="file" accept=".png,.jpeg,.jpg,.pdf" onChange={e => setProof(e.target.files[0])} className="w-full px-4 py-2 rounded bg-gray-700 text-black mt-1" required />
            {proof && <span className="text-xs text-accent mt-1 block">Selected: {proof.name}</span>}
          </label>
          <button type="submit" className="w-full py-2 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition">Submit Deposit</button>
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

