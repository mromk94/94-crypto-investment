import React from 'react';

export default function Balances() {
  const [balances, setBalances] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    fetch('/auth-backend/get_balances.php', { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch balances');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setBalances(data.balances);
        } else {
          setError(data.error || 'Unknown error');
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-accent">Loading balances...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">Balances & Transactions</h2>
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-4">View and adjust user balances, approve/deny withdrawals, and review transaction history.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent/20">
            <thead>
              <tr className="text-accent text-left">
                <th className="py-2 px-2">User</th>
                <th className="py-2 px-2">Balance</th>
                <th className="py-2 px-2">Pending Withdrawal</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {balances.length === 0 && (
                <tr>
                  <td colSpan="4" className="py-6 text-center text-gray-400">No balances found.</td>
                </tr>
              )}
              {balances.map((row, i) => (
                <tr key={i} className="hover:bg-accent/10">
                  <td className="py-2 px-2 font-semibold text-accent">{row.user}</td>
                  <td className="py-2 px-2">${row.balance}</td>
                  <td className="py-2 px-2">${row.pending_withdrawal}</td>
                  <td className="py-2 px-2 flex gap-2">
                    <button className="bg-sui text-white px-2 py-1 rounded hover:bg-accent/80 transition">Approve</button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition">Deny</button>
                    <button className="bg-gray-800 text-accent px-2 py-1 rounded hover:bg-accent/20 transition">Adjust</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

