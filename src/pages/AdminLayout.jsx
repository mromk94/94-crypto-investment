import React, { useState } from 'react';
import Footer from '../components/Footer';
import AdminSettings from './AdminSettings';
import AdminKycBuilder from './AdminKycBuilder';
import AdminKycPanel from './AdminKycPanel';
import AdminWithdrawalPins from '../components/admin/AdminWithdrawalPins';

const ADMIN_GROUPS = [
  {
    group: 'Dashboard',
    tabs: [
      { key: 'overview', label: 'Overview', icon: '📊' },
    ],
  },
  {
    group: 'Users & KYC',
    tabs: [
      { key: 'users', label: 'Users', icon: '👥' },
      { key: 'kyc', label: 'KYC', icon: '🛡️' },
      { key: 'impersonate', label: 'Impersonate', icon: '🕵️' },
      { key: 'withdrawal_pins', label: 'Withdrawal PINs', icon: '🔒' },
    ],
  },
  {
    group: 'Plans & Balances',
    tabs: [
      { key: 'plans', label: 'Plans', icon: '💼' },
      { key: 'balances', label: 'Balances', icon: '💰' },
      { key: 'methods', label: 'Methods', icon: '💳' },
    ],
  },
  {
    group: 'Support & Tickets',
    tabs: [
      { key: 'tickets', label: 'Tickets', icon: '🎫' },
      { key: 'notifications', label: 'Notifications', icon: '🔔' },
    ],
  },
  {
    group: 'Site Content',
    tabs: [
      { key: 'content', label: 'Content', icon: '📝' },
    ],
  },
  {
    group: 'Settings & Admin',
    tabs: [
      { key: 'settings', label: 'Settings', icon: '⚙️' },
      { key: 'admin', label: 'Admins', icon: '🔑' },
    ],
  },
  {
    group: 'Analytics & Logs',
    tabs: [
      { key: 'analytics', label: 'Analytics', icon: '📈' },
      { key: 'logs', label: 'Logs', icon: '📋' },
    ],
  },
  {
    group: 'Other',
    tabs: [
      { key: 'logout', label: 'Logout', icon: '🚪' },
    ],
  },
];

export default function AdminLayout({ admin, children, onTabChange, activeTab }) {
  const [collapsed, setCollapsed] = useState(false);
  // Collapsible group state: expandedGroups[groupName] = true/false
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const state = {};
    ADMIN_GROUPS.forEach((g, i) => { state[g.group] = i === 0; });
    return state;
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 text-white">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-gray-950 via-primary/80 to-sui/70 shadow-lg border-b border-accent/30 flex items-center justify-between px-4 md:px-8 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-accent/80 text-gray-900 font-extrabold text-2xl shadow-lg border-2 border-accent"><svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="20" cy="20" r="18" fill="#0ea5e9" stroke="#fff" strokeWidth="2" /><text x="50%" y="55%" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold" dy=".3em">A</text></svg></span>
          <span className="font-black text-xl md:text-2xl tracking-wider text-accent drop-shadow">Ton Sui Mining Admin</span>
        </div>
        {admin?.name && <span className="hidden md:inline-flex items-center gap-2 text-accent font-semibold text-lg"><svg className="inline-block" width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="#0ea5e9" /><rect x="4" y="16" width="16" height="4" rx="2" fill="#0ea5e9" /></svg>{admin.name}</span>}
      </header>
      <div className="flex-1 flex flex-col md:flex-row w-full">
        {/* Sidebar */}
        <aside className={`hidden md:flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-200 bg-gradient-to-br from-gray-900/95 via-primary/90 to-sui/80 border-r border-accent/40 shadow-2xl rounded-tr-3xl rounded-br-3xl glass-card-3d relative overflow-visible`} style={{ willChange: 'width,transform' }}>
          <button
            className={`absolute -right-4 top-8 z-20 w-8 h-8 rounded-full bg-accent text-gray-900 shadow-xl border-2 border-white flex items-center justify-center hover:scale-110 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            onClick={() => setCollapsed(c => !c)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? '▶' : '◀'}
          </button>
          <div className={`flex flex-col items-center py-8 z-10 transition-all duration-300 ${collapsed ? 'py-4' : ''}`}>
            <span className="bg-gradient-to-br from-accent to-sui flex items-center justify-center border-4 border-accent shadow-xl mb-2 transition-all duration-300 rounded-full" style={{ width: collapsed ? 40 : 64, height: collapsed ? 40 : 64 }}>
              <svg width={collapsed ? 28 : 40} height={collapsed ? 28 : 40} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="18" fill="#0ea5e9" stroke="#fff" strokeWidth="2" />
                <text x="50%" y="55%" textAnchor="middle" fill="#fff" fontSize={collapsed ? 14 : 20} fontWeight="bold" dy=".3em">A</text>
              </svg>
            </span>
            {!collapsed && <div className="font-bold text-lg mt-2 text-accent drop-shadow">{admin?.name || 'Admin'}</div>}
            {!collapsed && <div className="text-accent text-sm">@{admin?.username || 'admin'}</div>}
          </div>
          <nav className={`flex-1 flex flex-col gap-2 ${collapsed ? 'px-1' : 'px-4'} z-10`}>
            {ADMIN_GROUPS.map((group, i) => (
              <div key={group.group} className="mb-2">
                {!collapsed && (
                  <button
                    type="button"
                    className="flex items-center w-full text-xs font-bold text-accent/70 uppercase px-2 mb-1 tracking-widest focus:outline-none select-none"
                    onClick={() => toggleGroup(group.group)}
                    tabIndex={0}
                    aria-expanded={!!expandedGroups[group.group]}
                  >
                    <span>{group.group}</span>
                    <span className={`ml-auto transition-transform duration-200 ${expandedGroups[group.group] ? 'rotate-90' : ''}`}
                      style={{ display: 'inline-block' }}>
                      ▶
                    </span>
                  </button>
                )}
                {expandedGroups[group.group] && group.tabs.map(tab => (
                  <button
                    key={tab.key}
                    className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''} text-left ${collapsed ? 'px-0 py-3' : 'px-5 py-3'} rounded-2xl font-semibold tracking-wide text-lg shadow-lg transition-all duration-200 border border-transparent backdrop-blur-lg mb-1 ${activeTab === tab.key
                      ? 'bg-gradient-to-r from-accent to-sui text-gray-900 border-accent scale-105 shadow-2xl'
                      : 'bg-gray-800/60 text-accent/80 hover:bg-accent/10 hover:text-accent hover:scale-105'}
                      `}
                    style={{ boxShadow: activeTab === tab.key ? '0 4px 24px 0 rgba(0,255,255,0.18)' : undefined }}
                    onClick={() => onTabChange(tab.key)}
                  >
                    <span className="text-2xl">{tab.icon}</span>
                    <span
                      className={`sidebar-label transition-all duration-200 ease-in-out inline-block overflow-hidden align-middle ${collapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[180px] ml-2 pointer-events-auto'}`}
                      style={{ transitionProperty: 'opacity,max-width,margin', whiteSpace: 'nowrap', willChange: 'opacity,max-width,margin' }}
                    >
                      {tab.label}
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
          <div className="absolute left-0 bottom-0 w-full h-8 bg-gradient-to-t from-accent/30 to-transparent rounded-b-3xl pointer-events-none" />
        </aside>
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Mobile nav */}
          {/* Mobile nav - fix: flatten all tabs from ADMIN_GROUPS */}
          <nav className="md:hidden flex flex-wrap gap-2 justify-between p-2 bg-primary/95 border-b border-gray-800 sticky top-0 z-30">
            {ADMIN_GROUPS.flatMap(g => g.tabs).map(tab => (
              <button
                key={tab.key}
                className={`flex-1 min-w-[80px] px-2 py-2 rounded font-medium text-xs ${activeTab === tab.key ? 'bg-accent text-gray-900' : 'hover:bg-accent/20 hover:text-accent'} touch-manipulation`}
                onClick={() => onTabChange(tab.key)}
                style={{ minWidth: 60 }}
              >
                <span className="text-lg md:text-xl">{tab.icon}</span>
                <span className="ml-1 hidden xs:inline-block md:inline-block">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex-1 p-2 sm:p-4 md:p-8 bg-gray-950 overflow-auto">
            {/* Render settings page when activeTab is 'settings' */}
            {activeTab === 'settings' ? (
              <React.Suspense fallback={<div className="text-accent">Loading settings...</div>}>
                <AdminSettings
                  fetchConfig={async () => ({
                    db_host: 'localhost', db_name: 'tonsui_db', db_user: 'root', db_pass: '',
                    smtp_host: 'smtp.example.com', smtp_port: 587, smtp_user: 'user@example.com', smtp_pass: 'password', smtp_secure: 'tls', smtp_from: 'noreply@tonsui.com', smtp_from_name: 'Ton Sui Mining',
                  })}
                  saveConfig={async (data) => { console.log('Saving config', data); }}
                />
              </React.Suspense>
            ) : activeTab === 'kyc' ? (
              <AdminKycPanel />
            ) : activeTab === 'withdrawal_pins' ? (
              <AdminWithdrawalPins />
            ) : (
              children ? children : <div className="text-center text-red-500 text-xl font-bold p-8">Error: Admin panel failed to load. Please check for runtime errors or missing components.</div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

