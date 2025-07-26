import React from 'react';

export default function Overview({ setAdminTab }) {
  const [stats, setStats] = React.useState({ users: 0, plans: 0, kyc: 0, balances: 0, tickets: 0 });
  const [recent, setRecent] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch('/auth-backend/admin_stats.php').then(r => r.json()),
      fetch('/auth-backend/admin_recent.php').then(r => r.json())
    ])
      .then(([statsRes, recentRes]) => {
        if (statsRes.success && recentRes.success) {
          setStats(statsRes.stats);
          setRecent(recentRes.recent);
        } else {
          setError('Failed to fetch dashboard stats.');
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-accent">Loading overview...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">Admin Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl flex flex-col items-center cursor-pointer hover:bg-accent/10 transition" onClick={() => setAdminTab('users')}>
          <div className="text-4xl mb-2">👥</div>
          <div className="font-bold text-accent text-lg">Users</div>
          <div className="text-gray-400">{stats.users}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl flex flex-col items-center cursor-pointer hover:bg-accent/10 transition" onClick={() => setAdminTab('plans')}>
          <div className="text-4xl mb-2">💼</div>
          <div className="font-bold text-accent text-lg">Plans</div>
          <div className="text-gray-400">{stats.plans} Active</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl flex flex-col items-center cursor-pointer hover:bg-accent/10 transition" onClick={() => setAdminTab('kyc')}>
          <div className="text-4xl mb-2">📝</div>
          <div className="font-bold text-accent text-lg">KYC Pending</div>
          <div className="text-gray-400">{stats.kyc} Pending</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl flex flex-col items-center cursor-pointer hover:bg-accent/10 transition" onClick={() => setAdminTab('balances')}>
          <div className="text-4xl mb-2">💰</div>
          <div className="font-bold text-accent text-lg">Balances</div>
          <div className="text-gray-400">${stats.balances}</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 shadow-xl flex flex-col items-center cursor-pointer hover:bg-accent/10 transition" onClick={() => setAdminTab('tickets')}>
          <div className="text-4xl mb-2">🎫</div>
          <div className="font-bold text-accent text-lg">Tickets</div>
          <div className="text-gray-400">{stats.tickets} Open</div>
        </div>
      </div>
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <h3 className="text-xl font-bold mb-4 text-accent">Recent Activity</h3>
        <ul className="divide-y divide-accent/20">
          {recent.length === 0 && <li className="py-2 text-gray-400">No recent activity.</li>}
          {recent.map((item, i) => (
            <li key={i} className="py-2 text-gray-200">{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

