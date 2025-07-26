import React, { useState } from 'react';

const WALLETS = [
  { label: 'USD/USDT', value: 'USD' },
  { label: 'TON', value: 'TON' },
  { label: 'SUI', value: 'SUI' },
  { label: 'Referral', value: 'REF' }
];

export default function WalletTransferModal({ open, onClose, onTransfer, balances, rates }) {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('TON');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  if (!open) return null;

  // Helper: get rate for the pair (from, to)
  function getRate(from, to) {
    if (from === to) return 1;
    if (from === 'USD' && to === 'TON') return rates?.rate_usdt_ton || null;
    if (from === 'TON' && to === 'USD') return rates?.rate_usdt_ton ? 1 / rates.rate_usdt_ton : null;
    if (from === 'USD' && to === 'SUI') return rates?.rate_usdt_sui || null;
    if (from === 'SUI' && to === 'USD') return rates?.rate_usdt_sui ? 1 / rates.rate_usdt_sui : null;
    if (from === 'USD' && to === 'BTC') return rates?.rate_usdt_btc || null;
    if (from === 'BTC' && to === 'USD') return rates?.rate_usdt_btc ? 1 / rates.rate_usdt_btc : null;
    if (from === 'USD' && to === 'ETH') return rates?.rate_usdt_eth || null;
    if (from === 'ETH' && to === 'USD') return rates?.rate_usdt_eth ? 1 / rates.rate_usdt_eth : null;
    // For referral, treat as USD
    if (from === 'REF') return getRate('USD', to);
    if (to === 'REF') return getRate(from, 'USD');
    // Indirect via USD
    if (from !== 'USD' && to !== 'USD') {
      const rate1 = getRate(from, 'USD');
      const rate2 = getRate('USD', to);
      return rate1 && rate2 ? rate1 * rate2 : null;
    }
    return null;
  }

  const rate = getRate(from, to);
  const amountNum = Number(amount);
  const toAmount = rate && amountNum > 0 ? Math.floor((amountNum * rate) * 100) / 100 : '';

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (from === to) return setError('Cannot transfer to the same wallet.');
    if (!amount || isNaN(amount) || Number(amount) <= 0) return setError('Enter a valid amount.');
    if (Number(amount) > (balances[from] || 0)) return setError('Insufficient balance.');
    if (!rate) return setError('Exchange rate not set for this pair.');
    onTransfer({ from, to, amount: Number((amountNum * rate).toFixed(2)), fromAmount: Number(amountNum.toFixed(2)) });
    setAmount('');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-xs flex flex-col gap-4 border-2 border-accent" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-accent mb-2">Transfer Between Wallets</h2>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">From</span>
          <select value={from} onChange={e => setFrom(e.target.value)} className="input text-black">
            {WALLETS.map(w => (
              <option key={w.value} value={w.value}>{w.label} (Bal: {balances[w.value] || 0})</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">To</span>
          <select value={to} onChange={e => setTo(e.target.value)} className="input text-black">
            {WALLETS.map(w => (
              <option key={w.value} value={w.value}>{w.label}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">Amount</span>
          <input type="number" min="1" step="any" value={amount} onChange={e => setAmount(e.target.value)} className="input text-black" required />
        </label>
        {rate && amountNum > 0 && (
          <div className="text-sm text-accent font-semibold mb-2">
            You will receive: <span className="text-green-400">{toAmount} {to}</span>
          </div>
        )}
        {error && <div className="text-red-400 font-semibold text-sm mt-2">{error}</div>}
        <div className="flex gap-4 mt-4">
          <button type="button" onClick={onClose} className="btn flex-1 btn-gray">Cancel</button>
          <button type="submit" className="btn flex-1 btn-accent">Transfer</button>
        </div>
      </form>
    </div>
  );
}
