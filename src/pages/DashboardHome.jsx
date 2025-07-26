import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FloatingSideButtons from '../components/FloatingSideButtons';
const WalletTransferModal = React.lazy(() => import('../components/dashboard/WalletTransferModal'));

const AnimatedCard = ({ title, value, icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    whileHover={{ scale: 1.06, rotateX: 8, rotateY: -8, boxShadow: "0 8px 40px 0 rgba(0,255,255,0.25)" }}
    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    className={`relative flex flex-col items-center justify-center bg-gradient-to-br ${color} rounded-3xl shadow-2xl p-8 min-w-[180px] min-h-[140px] glass-card cursor-pointer select-none group`}
    style={{
      boxShadow: '0 8px 40px 0 rgba(0,255,255,0.12), 0 1.5px 8px 0 rgba(0,0,0,0.15)',
      backdropFilter: 'blur(12px)',
      border: '1.5px solid rgba(255,255,255,0.09)',
      overflow: 'visible',
      perspective: 800
    }}
  >
    <span className="absolute -top-5 left-1/2 -translate-x-1/2 w-16 h-4 bg-accent blur-2xl opacity-70 z-0 rounded-full animate-pulse" />
    <div className="text-4xl mb-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] group-hover:scale-110 transition-transform">{icon}</div>
    <div className="text-3xl font-extrabold text-white drop-shadow-lg group-hover:text-accent transition-colors">{value}</div>
    <div className="text-sm mt-2 opacity-90 font-semibold tracking-wide group-hover:text-sui transition-colors">{title}</div>
    <span className="absolute inset-0 rounded-3xl pointer-events-none border-2 border-accent/10 group-hover:border-accent/30 transition" />
  </motion.div>
);

import DashboardHeader from '../components/DashboardHeader';

export default function DashboardHome({ user, setTab }) {
  const [transferOpen, setTransferOpen] = useState(false);
  const [balances, setBalances] = useState({ ...user.balances, REF: user.referralBalance ?? 0 });
  const [invested, setInvested] = useState(user.invested ?? 0);
  const [roi, setRoi] = useState(user.roiAmount ?? 0);
  const [success, setSuccess] = useState('');
  const [rates, setRates] = useState({});

  // Fetch rates from config (simulate fetchConfig from AdminSettings)
  useEffect(() => {
    async function fetchRates() {
      let config = {};
      try {
        if (window.fetchConfig) {
          config = await window.fetchConfig();
        } else {
          config = JSON.parse(localStorage.getItem('tsm_config') || '{}');
        }
      } catch {}
      setRates({
        rate_usdt_ton: Number(config.rate_usdt_ton) || 0,
        rate_usdt_sui: Number(config.rate_usdt_sui) || 0,
        rate_usdt_btc: Number(config.rate_usdt_btc) || 0,
        rate_usdt_eth: Number(config.rate_usdt_eth) || 0,
      });
    }
    fetchRates();
  }, []);

  // Transfer logic
  function handleTransfer({ from, to, amount, fromAmount }) {
    setBalances(prev => {
      const newBalances = { ...prev };
      newBalances[from] = Number(((newBalances[from] || 0) - fromAmount).toFixed(2));
      newBalances[to] = Number(((newBalances[to] || 0) + amount).toFixed(2));
      // Save to localStorage (simulate user object update)
      const tsmUser = JSON.parse(localStorage.getItem('tsm_user') || '{}');
      tsmUser.balances = { ...newBalances };
      tsmUser.referralBalance = newBalances.REF;
      localStorage.setItem('tsm_user', JSON.stringify(tsmUser));
      return newBalances;
    });
    setSuccess(`Transferred ${amount} ${to} from ${from}`);
    setTimeout(() => setSuccess(''), 2500);
    setTransferOpen(false);
  }

  // Automatic ROI payout logic
  useEffect(() => {
    const ROI_INTERVAL_MS = 60 * 1000; // 1 min demo; change for prod
    const tsmUser = JSON.parse(localStorage.getItem('tsm_user')) || user;
    let plansChanged = false;
    let investedAmt = 0, roiAmt = 0;
    const now = Date.now();
    const updatedPlans = (tsmUser.plans || []).map(plan => {
      if (plan.status === 'Active') {
        investedAmt += plan.invested || 0;
        // Determine interval (prod: 30 days; demo: 1 min)
        let intervalMs = ROI_INTERVAL_MS;
        if (plan.roiFrequency === 'monthly') intervalMs = ROI_INTERVAL_MS;
        // Payout if interval elapsed
        const lastPayout = new Date(plan.lastRoiPayoutAt).getTime();
        if (now - lastPayout >= intervalMs) {
          const roi = plan.invested * (plan.roiPercent / 100);
          plan.totalRoiEarned = (plan.totalRoiEarned || 0) + roi;
          plan.lastRoiPayoutAt = new Date(now).toISOString();
          plansChanged = true;
          // Credit ROI to user balance
          tsmUser.balance = (tsmUser.balance || 0) + roi;
        }
        roiAmt += plan.totalRoiEarned || 0;
      }
      return plan;
    });
    if (plansChanged) {
      tsmUser.plans = updatedPlans;
      localStorage.setItem('tsm_user', JSON.stringify(tsmUser));
    }
    setInvested(investedAmt);
    setRoi(roiAmt);
    // Set interval for live ROI payout and UI update
    const interval = setInterval(() => {
      let tsmUser = JSON.parse(localStorage.getItem('tsm_user')) || user;
      let plansChanged = false;
      let investedAmt = 0, roiAmt = 0;
      const now = Date.now();
      const updatedPlans = (tsmUser.plans || []).map(plan => {
        if (plan.status === 'Active') {
          investedAmt += plan.invested || 0;
          let intervalMs = ROI_INTERVAL_MS;
          if (plan.roiFrequency === 'monthly') intervalMs = ROI_INTERVAL_MS;
          const lastPayout = new Date(plan.lastRoiPayoutAt).getTime();
          if (now - lastPayout >= intervalMs) {
            const roi = plan.invested * (plan.roiPercent / 100);
            plan.totalRoiEarned = (plan.totalRoiEarned || 0) + roi;
            plan.lastRoiPayoutAt = new Date(now).toISOString();
            plansChanged = true;
            tsmUser.balance = (tsmUser.balance || 0) + roi;
          }
          roiAmt += plan.totalRoiEarned || 0;
        }
        return plan;
      });
      if (plansChanged) {
        tsmUser.plans = updatedPlans;
        localStorage.setItem('tsm_user', JSON.stringify(tsmUser));
      }
      setInvested(investedAmt);
      setRoi(roiAmt);
    }, ROI_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col gap-10">
      <DashboardHeader user={user} />
      <React.Suspense fallback={null}>
        <WalletTransferModal
          open={transferOpen}
          onClose={() => setTransferOpen(false)}
          onTransfer={handleTransfer}
          balances={balances}
          rates={rates}
        />
      </React.Suspense>
      {/* Responsive card grid */}
      <div className="flex gap-4 overflow-x-auto pb-3 pt-2 sm:grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 sm:overflow-x-visible sm:gap-8 mt-4">
        <AnimatedCard title="TON Balance" value={Number(balances.TON).toFixed(2) + ' TON'} icon="🪙" color="from-blue-800/80 via-blue-400/60 to-blue-300/50" />
        <AnimatedCard title="SUI Balance" value={Number(balances.SUI).toFixed(2) + ' SUI'} icon="💠" color="from-purple-800/80 via-purple-400/60 to-purple-300/50" />
        <AnimatedCard title="USD Balance" value={'$' + Number(balances.USD).toFixed(2)} icon="💵" color="from-green-800/80 via-green-400/60 to-green-300/50" />
        <AnimatedCard title="Invested (Locked)" value={'$' + invested} icon="🔒" color="from-gray-800/80 via-gray-600/60 to-accent/30" />
        <AnimatedCard title="ROI (Earnings)" value={'$' + roi} icon="📈" color="from-accent/80 via-sui/60 to-blue-300/50" />
        <AnimatedCard title="Referral Balance" value={'$' + (balances.REF ?? 0)} icon="🔗" color="from-yellow-400/80 via-yellow-200/60 to-accent/50" />
      </div>

      {/* Per-plan breakdown table, visually separated */}
      <div className="mt-10 mb-8 w-full max-w-4xl mx-auto">
        <div className="text-lg font-bold mb-2 text-accent">My Investment Plans</div>
        <div className="overflow-x-auto rounded-xl shadow bg-gray-900/80">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-accent/10 text-accent">
                <th className="py-2 px-3">Plan</th>
                <th className="py-2 px-3">Invested</th>
                <th className="py-2 px-3">ROI %</th>
                <th className="py-2 px-3">ROI Earned</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Next Payout</th>
              </tr>
            </thead>
            <tbody>
              {(JSON.parse(localStorage.getItem('tsm_user'))?.plans || []).map((plan, i) => {
                let nextPayout = '';
                if (plan.status === 'Active') {
                  const now = Date.now();
                  const last = new Date(plan.lastRoiPayoutAt).getTime();
                  const interval = 60 * 1000; // 1 min demo
                  const msLeft = Math.max(0, interval - (now - last));
                  const sec = Math.floor(msLeft/1000)%60;
                  const min = Math.floor(msLeft/60000);
                  nextPayout = min > 0 ? `${min}m ${sec}s` : `${sec}s`;
                }
                return (
                  <tr key={i} className="border-b border-accent/10">
                    <td className="py-2 px-3 font-bold text-accent">{plan.name}</td>
                    <td className="py-2 px-3">${plan.invested}</td>
                    <td className="py-2 px-3">{plan.roiPercent}%</td>
                    <td className="py-2 px-3 text-green-400">${plan.totalRoiEarned?.toFixed(2) ?? 0}</td>
                    <td className="py-2 px-3">{plan.status}</td>
                    <td className="py-2 px-3">{plan.status === 'Active' ? nextPayout : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Main action buttons, responsive and visually separated */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <motion.button whileHover={{ scale: 1.08 }} onClick={() => setTab('deposit')} className="flex-1 min-w-[160px] px-8 py-4 rounded-2xl bg-accent text-gray-900 font-bold shadow-xl hover:bg-accent/90 transition text-lg">Deposit</motion.button>
        <motion.button whileHover={{ scale: 1.08 }} onClick={() => setTab('tickets')} className="flex-1 min-w-[160px] px-8 py-4 rounded-2xl bg-blue-600 text-white font-bold shadow-xl hover:bg-blue-500 transition text-lg">Open Ticket</motion.button>
        <motion.button whileHover={{ scale: 1.08 }} onClick={() => setTab('plans')} className="flex-1 min-w-[160px] px-8 py-4 rounded-2xl bg-sui text-white font-bold shadow-xl hover:bg-sui/90 transition text-lg">Invest</motion.button>
        <motion.button whileHover={{ scale: 1.08 }} onClick={() => setTab('referral')} className="flex-1 min-w-[160px] px-8 py-4 rounded-2xl bg-yellow-400 text-gray-900 font-bold shadow-xl hover:bg-yellow-300 transition text-lg flex items-center gap-2"><span className="text-2xl">🔗</span>Referral</motion.button>
        <motion.button whileHover={{ scale: 1.08 }} onClick={() => setTransferOpen(true)} className="flex-1 min-w-[160px] px-8 py-4 rounded-2xl bg-gray-700 text-accent font-bold shadow-xl hover:bg-gray-600 transition text-lg flex items-center gap-2"><span className="text-2xl">🔄</span>Transfer</motion.button>
        {!user.kycVerified && (
          <motion.button whileHover={{ scale: 1.08 }} onClick={() => setTab('kyc')} className="flex-1 min-w-[160px] px-8 py-4 rounded-2xl bg-yellow-400 text-gray-900 font-bold shadow-xl hover:bg-yellow-300 transition text-lg">KYC</motion.button>
        )}
      </div>

      {success && <div className="text-green-400 text-center font-bold mt-4">{success}</div>}
      <div className="mt-12">
        <div className="text-lg font-bold mb-2">Live Crypto Chart</div>
        <div className="rounded-2xl overflow-hidden shadow-2xl border border-accent/20 bg-gradient-to-br from-gray-900/90 to-primary/70">
          <iframe
            title="Crypto Chart"
            src="https://widget.coinlib.io/widget?type=chart&theme=dark&coin_id=859&pref_coin_id=1505"
            width="100%"
            height="350"
            style={{ border: 0, borderRadius: 16 }}
            allowTransparency={true}
            frameBorder="0"
          />
        </div>
      </div>
      <FloatingSideButtons onTab={setTab} />
    </div>
  );
}
