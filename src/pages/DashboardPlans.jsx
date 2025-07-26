import React, { useState } from 'react';

// Demo: plans with admin-specified ROI and frequency
const AVAILABLE_PLANS = [
  { name: 'Starter', invested: 0, returns: 0, status: 'Available', roiPercent: 5, roiFrequency: 'monthly' },
  { name: 'VIP', invested: 0, returns: 0, status: 'Available', roiPercent: 12, roiFrequency: 'monthly' },
  { name: 'Platinum', invested: 0, returns: 0, status: 'Available', roiPercent: 18, roiFrequency: 'monthly' },
];

export default function DashboardPlans({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [message, setMessage] = useState('');

  // Simulate joining a plan and auto-crediting ROI
  const handleJoinPlan = (plan) => {
    // For demo, invest $1000
    const invested = 1000;
    const now = new Date().toISOString();
    const newPlan = {
      name: plan.name,
      invested,
      roiPercent: plan.roiPercent,
      roiFrequency: plan.roiFrequency,
      status: 'Active',
      joinedAt: now,
      lastRoiPayoutAt: now,
      totalRoiEarned: 0,
    };
    const updatedPlans = [...(user.plans || []), newPlan];
    const updatedUser = { ...user, plans: updatedPlans };
    setUser(updatedUser);
    localStorage.setItem('tsm_user', JSON.stringify(updatedUser));
    setMessage(`Joined ${plan.name}! ROI will be credited automatically.`);
  };


  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-6 text-accent">Investment Plans</h2>
      {message && <div className="mb-4 text-green-400 font-bold">{message} <button className='ml-4 underline text-sui' onClick={() => setTab && setTab('dashboard')}>Go to Dashboard</button></div>}
      <div className="mb-4 text-accent">Current Balance: <span className="font-bold">${user.balance || 0}</span></div>
      {user.plans && user.plans.length > 0 ? (
        <div className="space-y-4 mb-8">
          {user.plans.map((plan, i) => (
            <div key={i} className="p-4 rounded bg-gray-900 border-l-4 border-accent shadow flex justify-between items-center">
              <div>
                <div className="font-bold text-lg">{plan.name}</div>
                <div className="text-gray-400 text-sm">Invested: ${plan.invested} | Returns: ${plan.returns}</div>
                <div className="text-xs mt-1">Status: <span className="font-bold text-accent">{plan.status}</span></div>
                <div className="text-xs mt-1">ROI: <span className="font-bold text-sui">{plan.roiPercent}% {plan.roiFrequency}</span></div>
              </div>
              <button className="px-4 py-2 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition" disabled>
                Active
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-6">
          <button className="px-6 py-3 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition" onClick={() => setTab && setTab('deposit')}>
            Deposit to Start
          </button>
        </div>
      )}
      <div className="space-y-4">
        {AVAILABLE_PLANS.map((plan, i) => (
          <div key={i} className="p-4 rounded bg-gray-900 border-l-4 border-accent shadow flex justify-between items-center">
            <div>
              <div className="font-bold text-lg">{plan.name}</div>
              <div className="text-gray-400 text-sm">ROI: {plan.roiPercent}% {plan.roiFrequency}</div>
            </div>
            <button className="px-4 py-2 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition" onClick={() => handleJoinPlan(plan)}>
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

