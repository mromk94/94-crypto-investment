import React, { useState, useEffect } from 'react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState({
    totalInvested: 0,
    totalRoiPaid: 0,
    activePlans: 0,
    investments: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [statsRes, investmentsRes] = await Promise.all([
          fetch('/auth-backend/get_analytics.php', { credentials: 'include' }),
          fetch('/auth-backend/get_investments.php', { credentials: 'include' })
        ]);

        if (!statsRes.ok || !investmentsRes.ok) {
          throw new Error('Failed to fetch analytics data');
        }

        const statsData = await statsRes.json();
        const investmentsData = await investmentsRes.json();

        if (statsData.success && investmentsData.success) {
          setAnalytics({
            totalInvested: statsData.totalInvested || 0,
            totalRoiPaid: statsData.totalRoiPaid || 0,
            activePlans: statsData.activePlans || 0,
            investments: investmentsData.investments || []
          });
        } else {
          setError(statsData.error || investmentsData.error || 'Unknown error');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-8 text-center text-accent">Loading analytics data...</div>;
  if (error) return <div className="p-8 text-center text-red-400">Error: {error}</div>;

  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">Analytics</h2>
      {/* Investment Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-accent to-sui rounded-2xl p-6 shadow-xl text-gray-900">
          <div className="text-lg font-bold mb-2">Total Invested</div>
          <div className="text-3xl font-extrabold">
            ${analytics.totalInvested.toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-sui/80 to-accent/80 rounded-2xl p-6 shadow-xl text-gray-900">
          <div className="text-lg font-bold mb-2">Total ROI Paid</div>
          <div className="text-3xl font-extrabold text-green-800">
            ${analytics.totalRoiPaid.toLocaleString()}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-accent/80 to-sui/80 rounded-2xl p-6 shadow-xl text-gray-900">
          <div className="text-lg font-bold mb-2">Active Plans</div>
          <div className="text-3xl font-extrabold">
            {analytics.activePlans}
          </div>
        </div>
      </div>
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl mt-8">
        <h3 className="text-xl font-bold mb-4 text-accent">All User Investments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs text-left">
            <thead>
              <tr className="bg-accent/10 text-accent">
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Plan</th>
                <th className="py-2 px-3">Invested</th>
                <th className="py-2 px-3">ROI %</th>
                <th className="py-2 px-3">ROI Earned</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {analytics.investments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-4 text-center text-gray-400">No investment data available</td>
                </tr>
              ) : (
                analytics.investments.map((investment, index) => (
                  <tr key={index} className="border-b border-accent/10">
                    <td className="py-2 px-3 font-bold text-accent">{investment.username || 'User'}</td>
                    <td className="py-2 px-3">{investment.plan_name}</td>
                    <td className="py-2 px-3">${investment.amount_invested?.toFixed(2)}</td>
                    <td className="py-2 px-3">{investment.roi_percent}%</td>
                    <td className="py-2 px-3 text-green-400">${investment.total_roi_earned?.toFixed(2) || '0.00'}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${investment.status === 'active' ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                        {investment.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
}
