import React, { useState } from 'react';
import AdminLayout from '../AdminLayout';

// Placeholder components for each tab
const Overview = React.lazy(() => import('../../components/admin/Overview'));
const Users = React.lazy(() => import('../../components/admin/Users'));
const Plans = React.lazy(() => import('../../components/admin/Plans'));
const Balances = React.lazy(() => import('../../components/admin/Balances'));
const KYC = React.lazy(() => import('../../components/admin/KYC'));
const Tickets = React.lazy(() => import('../../components/admin/Tickets'));
const Content = React.lazy(() => import('../../components/admin/Content'));
const Settings = React.lazy(() => import('../../components/admin/Settings'));
const Analytics = React.lazy(() => import('../../components/admin/Analytics'));
const Admins = React.lazy(() => import('../../components/admin/Admins'));
const Logs = React.lazy(() => import('../../components/admin/Logs'));
const Notifications = React.lazy(() => import('../../components/admin/Notifications'));
const Methods = React.lazy(() => import('../../components/admin/Methods'));
const Impersonate = React.lazy(() => import('../../components/admin/Impersonate'));

const TABS = [
  'overview','users','plans','balances','methods','kyc','tickets','content','settings','analytics','admin','logs','notifications','impersonate','logout'
];

import AdminLogin from '../AdminLogin';

export default function AdminIndex() {
  const [activeTab, setActiveTab] = useState('overview');
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('tsm_admin'));
    } catch {
      return null;
    }
  });

  // Show login if not authenticated
  if (!admin) {
    return <AdminLogin onLogin={adminUser => {
  console.log('Admin login successful:', adminUser);
  localStorage.setItem('tsm_admin', JSON.stringify(adminUser));
  setAdmin(adminUser);
}} />;
  }

  function renderTab() {
    switch (activeTab) {
      case 'overview': return <Overview />;
      case 'users': return <Users />;
      case 'plans': return <Plans />;
      case 'balances': return <Balances />;
      case 'methods': return <Methods />;
      case 'kyc': return <KYC />;
      case 'tickets': return <Tickets />;
      case 'content': return <Content />;
      case 'settings': return <Settings />;
      case 'analytics': return <Analytics />;
      case 'admin': return <Admins />;
      case 'logs': return <Logs />;
      case 'notifications': return <Notifications />;
      case 'impersonate': return <Impersonate />;
      case 'logout':
        // Clear admin session and logout backend
        localStorage.removeItem('tsm_admin');
        fetch('/TonSuiMining/auth-backend/admin_logout.php', { method: 'POST', credentials: 'include' });
        window.location.href = '/TonSuiMining/admin/login';
        return null;
      default: return <Overview />;
    }
  }

  return (
    <React.Suspense fallback={<div className="p-8 text-center text-accent">Loading admin panel...</div>}>
      <AdminLayout admin={admin} activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTab()}
      </AdminLayout>
    </React.Suspense>
  );
}
