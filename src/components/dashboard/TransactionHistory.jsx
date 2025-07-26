import React from 'react';

const TransactionHistory = ({ deposits = [], withdrawals = [], wallets = [] }) => {
  // Merge, sort, and tag transactions
  const all = [
    ...deposits.map(d => ({ ...d, type: 'deposit' })),
    ...withdrawals.map(w => ({ ...w, type: 'withdrawal' }))
  ].sort((a, b) => new Date(b.submittedAt || b.date) - new Date(a.submittedAt || a.date));

  return (
    <div className="rounded-2xl bg-gray-900/80 p-4 shadow-xl border border-accent/10 w-full max-w-2xl mx-auto mt-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg font-bold text-accent">Transaction History</span>
        <span className="text-xs text-gray-400">(Deposit & Withdrawal)</span>
      </div>
      {all.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No transactions yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-accent/80">
                <th className="px-2 py-1">Date</th>
                <th className="px-2 py-1">Type</th>
                <th className="px-2 py-1">Amount</th>
                <th className="px-2 py-1">Wallet</th>
                <th className="px-2 py-1">Method</th>
                <th className="px-2 py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {all.map((tx, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-accent/10 transition">
                  <td className="px-2 py-1 whitespace-nowrap">{new Date(tx.submittedAt || tx.date).toLocaleString()}</td>
                  <td className="px-2 py-1 font-bold">
                    {tx.type === 'deposit' ? <span className="text-green-400">Deposit</span> : <span className="text-red-400">Withdrawal</span>}
                  </td>
                  <td className="px-2 py-1">{typeof tx.amount === 'number' ? tx.amount.toFixed(2) : Number(tx.amount).toFixed(2)} <span className="font-semibold">{tx.currency || tx.wallet || ''}</span></td>
                  <td className="px-2 py-1">{tx.wallet || tx.currency || '-'}</td>
                  <td className="px-2 py-1">{tx.method || tx.methodName || '-'}</td>
                  <td className="px-2 py-1">
                    {tx.status ? (
                      <span className={
                        tx.status === 'approved' ? 'text-green-400' :
                        tx.status === 'pending' ? 'text-yellow-400' :
                        tx.status === 'rejected' ? 'text-red-400' : 'text-gray-400'
                      }>
                        {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default TransactionHistory;
