import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TABS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'profile', label: 'Profile' },
  { key: 'deposit', label: 'Deposit' },
  { key: 'withdraw', label: 'Withdraw' },
  { key: 'plans', label: 'Plans' },
  { key: 'tickets', label: 'Tickets' },
  { key: 'referral', label: 'Referral' },
  { key: 'kyc', label: 'KYC' },
  { key: 'logout', label: 'Logout' },
];

export default function DashboardLayout({ user, children, onTabChange, activeTab }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const tabIcons = {
    dashboard: '🏠', profile: '👤', deposit: '💸', withdraw: '⬇️', plans: '📊', tickets: '💬', referral: '🔗', kyc: '🛡️', logout: '🚪'
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Header loggedIn={true} />
      <div className="flex-1 flex flex-col md:flex-row w-full pt-20 md:pt-24">

        {/* Sidebar for desktop */}
        <aside className={`hidden md:flex flex-col ${collapsed ? 'w-16' : 'w-64'} transition-all duration-200 bg-gradient-to-br from-primary/95 via-gray-900/90 to-sui/80 border-r border-accent/40 shadow-2xl rounded-tr-3xl rounded-br-3xl glass-card-3d relative overflow-visible`} style={{ willChange: 'width,transform' }}>
          <button
            className={`absolute -right-4 top-8 z-20 w-8 h-8 rounded-full bg-accent text-gray-900 shadow-xl border-2 border-white flex items-center justify-center hover:scale-110 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            onClick={() => setCollapsed(c => !c)}
            aria-label="Toggle sidebar"
          >
            {collapsed ? '▶' : '◀'}
          </button>
          {/* Mobile sidebar overlay trigger */}
          <button
            className="fixed md:hidden bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-accent text-gray-900 shadow-2xl border-4 border-white flex items-center justify-center text-3xl font-extrabold hover:scale-110 transition-transform"
            onClick={() => setCollapsed(false)}
            aria-label="Open sidebar"
          >
            ☰
          </button>
          {/* Sidebar content (shared between desktop and mobile) */}
          <div className={`flex flex-col items-center py-8 z-10 transition-all duration-300 ${collapsed ? 'py-4' : ''}`}>
            {(() => {
              const hasProfilePic = !!user.profilePicture && user.profilePicture.trim() !== '' && !showFallback;
              if (hasProfilePic) {
                return (
                  <img
                    src={user.profilePicture}
                    alt="profile"
                    className={`rounded-full border-4 border-accent shadow-xl mb-2 transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-20 h-20'}`}
                    onError={() => setShowFallback(true)}
                  />
                );
              }
              if (user.gender === 'female') {
                return (
                  <span className={`bg-pink-200 flex items-center justify-center border-4 border-accent shadow-xl mb-2 transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-20 h-20'} rounded-full`}>
                    {/* Female SVG */}
                    <svg width={collapsed ? 28 : 40} height={collapsed ? 28 : 40} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="20" cy="14" r="10" fill="#e879f9" />
                      <rect x="17" y="24" width="6" height="10" rx="3" fill="#e879f9" />
                      <rect x="10" y="34" width="20" height="4" rx="2" fill="#f472b6" />
                    </svg>
                  </span>
                );
              }
              return (
                <span className={`bg-blue-200 flex items-center justify-center border-4 border-accent shadow-xl mb-2 transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-20 h-20'} rounded-full`}>
                  {/* Male SVG */}
                  <svg width={collapsed ? 28 : 40} height={collapsed ? 28 : 40} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="20" cy="14" r="10" fill="#38bdf8" />
                    <rect x="17" y="24" width="6" height="10" rx="3" fill="#38bdf8" />
                    <rect x="10" y="34" width="20" height="4" rx="2" fill="#0ea5e9" />
                  </svg>
                </span>
              );
            })()}
            {!collapsed && <div className="font-bold text-lg mt-2 text-accent drop-shadow">{user.name}</div>}
            {!collapsed && <div className="text-accent text-sm">@{user.username}</div>}
          </div>
          <nav className={`flex-1 flex flex-col gap-2 ${collapsed ? 'px-1' : 'px-4'} z-10`}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''} text-left ${collapsed ? 'px-0 py-3' : 'px-5 py-3'} rounded-2xl font-semibold tracking-wide text-lg shadow-lg transition-all duration-200 border border-transparent backdrop-blur-lg mb-1 ${activeTab === tab.key
                  ? 'bg-gradient-to-r from-accent to-sui text-gray-900 border-accent scale-105 shadow-2xl'
                  : 'bg-gray-800/60 text-accent/80 hover:bg-accent/10 hover:text-accent hover:scale-105'}
                  `}
                style={{ boxShadow: activeTab === tab.key ? '0 4px 24px 0 rgba(0,255,255,0.18)' : undefined }}
                onClick={() => onTabChange(tab.key)}
              >
                <span className="text-2xl">{tabIcons[tab.key]}</span>
                <span
                  className={`sidebar-label transition-all duration-200 ease-in-out inline-block overflow-hidden align-middle ${collapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[180px] ml-2 pointer-events-auto'}`}
                  style={{ transitionProperty: 'opacity,max-width,margin', whiteSpace: 'nowrap', willChange: 'opacity,max-width,margin' }}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
          <div className="absolute left-0 bottom-0 w-full h-8 bg-gradient-to-t from-accent/30 to-transparent rounded-b-3xl pointer-events-none" />
        </aside>
        {collapsed === false && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setCollapsed(true)} aria-label="Close sidebar overlay" tabIndex={0} role="button"/>
            <aside className="relative flex flex-col w-64 h-full bg-gradient-to-br from-primary/95 via-gray-900/90 to-sui/80 border-r border-accent/40 shadow-2xl rounded-tr-3xl rounded-br-3xl glass-card-3d p-4 animate-slide-in-left" style={{ willChange: 'transform' }}>
              <button
                className="absolute -right-4 top-8 z-50 w-8 h-8 rounded-full bg-accent text-gray-900 shadow-xl border-2 border-white flex items-center justify-center hover:scale-110 transition-transform"
                onClick={() => setCollapsed(true)}
                aria-label="Close sidebar"
              >×</button>
              {/* Sidebar content below will be rendered here as in desktop */}
        <div className={`flex flex-col items-center py-8 z-10 transition-all duration-300 ${collapsed ? 'py-4' : ''}`}>
          {(() => {
  const hasProfilePic = !!user.profilePicture && user.profilePicture.trim() !== '' && !showFallback;
  if (hasProfilePic) {
    return (
      <img
        src={user.profilePicture}
        alt="profile"
        className={`rounded-full border-4 border-accent shadow-xl mb-2 transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-20 h-20'}`}
        onError={() => setShowFallback(true)}
      />
    );
  }
  if (user.gender === 'female') {
    return (
      <span className={`bg-pink-200 flex items-center justify-center border-4 border-accent shadow-xl mb-2 transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-20 h-20'} rounded-full`}>
        {/* Female SVG */}
        <svg width={collapsed ? 28 : 40} height={collapsed ? 28 : 40} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="14" r="10" fill="#e879f9" />
          <rect x="17" y="24" width="6" height="10" rx="3" fill="#e879f9" />
          <rect x="10" y="34" width="20" height="4" rx="2" fill="#f472b6" />
        </svg>
      </span>
    );
  }
  return (
    <span className={`bg-blue-200 flex items-center justify-center border-4 border-accent shadow-xl mb-2 transition-all duration-300 ${collapsed ? 'w-10 h-10' : 'w-20 h-20'} rounded-full`}>
      {/* Male SVG */}
      <svg width={collapsed ? 28 : 40} height={collapsed ? 28 : 40} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="14" r="10" fill="#38bdf8" />
        <rect x="17" y="24" width="6" height="10" rx="3" fill="#38bdf8" />
        <rect x="10" y="34" width="20" height="4" rx="2" fill="#0ea5e9" />
      </svg>
    </span>
  );
})()}


{!collapsed && <div className="font-bold text-lg mt-2 text-accent drop-shadow">{user.name}</div>}
{!collapsed && <div className="text-accent text-sm">@{user.username}</div>}
        </div>
        <nav className={`flex-1 flex flex-col gap-2 ${collapsed ? 'px-1' : 'px-4'} z-10`}>
          {TABS.map(tab => (
            <button
              key={tab.key}
              className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''} text-left ${collapsed ? 'px-0 py-3' : 'px-5 py-3'} rounded-2xl font-semibold tracking-wide text-lg shadow-lg transition-all duration-200 border border-transparent backdrop-blur-lg mb-1 ${activeTab === tab.key
                ? 'bg-gradient-to-r from-accent to-sui text-gray-900 border-accent scale-105 shadow-2xl'
                : 'bg-gray-800/60 text-accent/80 hover:bg-accent/10 hover:text-accent hover:scale-105'}
                `}
              style={{ boxShadow: activeTab === tab.key ? '0 4px 24px 0 rgba(0,255,255,0.18)' : undefined }}
              onClick={() => onTabChange(tab.key)}
            >
              <span className="text-2xl">{tabIcons[tab.key]}</span>
              <span
                className={`sidebar-label transition-all duration-200 ease-in-out inline-block overflow-hidden align-middle ${collapsed ? 'opacity-0 max-w-0 ml-0 pointer-events-none' : 'opacity-100 max-w-[180px] ml-2 pointer-events-auto'}`}
                style={{ transitionProperty: 'opacity,max-width,margin', whiteSpace: 'nowrap', willChange: 'opacity,max-width,margin' }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </nav>
        <div className="absolute left-0 bottom-0 w-full h-8 bg-gradient-to-t from-accent/30 to-transparent rounded-b-3xl pointer-events-none" />
            </aside>
          </div>
        )}
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-h-0">
          {/* Mobile nav */}
          <nav className="md:hidden flex flex-wrap gap-2 justify-between p-2 bg-primary/95 border-b border-gray-800 sticky top-0 z-30">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`flex-1 min-w-[80px] px-2 py-2 rounded font-medium text-xs ${activeTab === tab.key ? 'bg-accent text-gray-900' : 'hover:bg-accent/20 hover:text-accent'} touch-manipulation`}
                onClick={() => onTabChange(tab.key)}
                style={{ minWidth: 60 }}
              >
                <span className="text-lg md:text-xl">{tabIcons[tab.key]}</span>
                <span className="ml-1 hidden xs:inline-block md:inline-block">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex-1 p-2 sm:p-4 md:p-8 bg-gray-900 overflow-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
