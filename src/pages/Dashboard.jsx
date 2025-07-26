import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';
import DashboardHome from './DashboardHome';
import DashboardProfile from './DashboardProfile';
import DashboardDeposit from './DashboardDeposit';
import DashboardWithdraw from './DashboardWithdraw';
import DashboardPlans from './DashboardPlans';
import DashboardTickets from './DashboardTickets';
import DashboardKyc from './DashboardKyc';
import DashboardReferral from './DashboardReferral';
// import demoUser from './demoUser.json'; // Removed for production

function getUser() {
  try {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('tsm_user'));
    if (!user) {
      // Use absolute URL for redirect to ensure it works in all environments
      const baseUrl = window.location.origin;
      const loginPath = process.env.NODE_ENV === 'development' ? '/login' : '/TonSuiMining/login';
      window.location.href = `${baseUrl}${loginPath}`;
      return null;
    }
    return user;
  } catch (error) {
    console.error('Error getting user:', error);
    // Don't return demo user in production
    if (process.env.NODE_ENV !== 'production') {
      console.warn('Using demo user in development mode');
      return demoUser;
    }
    return null;
  }
}

const TABS = ['dashboard', 'profile', 'deposit', 'withdraw', 'plans', 'tickets', 'referral', 'kyc', 'logout'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleTab = (t) => {
    if (t === 'logout') {
      localStorage.removeItem('tsm_user');
      navigate('/login');
    } else {
      setTab(t);
    }
  };

  const handleProfileUpdate = (newUser) => {
    setUser(newUser);
    localStorage.setItem('tsm_user', JSON.stringify(newUser));
  };

  const handleKycVerify = () => {
    const newUser = { ...user, kycVerified: true };
    setUser(newUser);
    localStorage.setItem('tsm_user', JSON.stringify(newUser));
  };

  if (!user) return null;

  let content;
  switch (tab) {
    case 'dashboard':
      content = <DashboardHome user={user} setTab={handleTab} />;
      break;
    case 'profile':
      content = <DashboardProfile user={user} onUpdate={handleProfileUpdate} />;
      break;
    case 'deposit':
      content = <DashboardDeposit />;
      break;
    case 'withdraw':
      content = <DashboardWithdraw />;
      break;
    case 'plans':
      content = <DashboardPlans user={user} setTab={handleTab} />;
      break;
    case 'tickets':
      content = <DashboardTickets user={user} />;
      break;
    case 'referral':
      content = <DashboardReferral user={user} />;
      break;
    case 'kyc':
      content = <DashboardKyc user={user} onVerify={handleKycVerify} />;
      break;
    default:
      content = <DashboardHome user={user} onTab={handleTab} />;
  }

  return (
    <DashboardLayout user={user} activeTab={tab} onTabChange={handleTab}>
      {content}
    </DashboardLayout>
  );
};

export default Dashboard;
