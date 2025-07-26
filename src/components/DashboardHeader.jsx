import React from 'react';

import CommodityTicker from './CommodityTicker';

export default function DashboardHeader({ user }) {
  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-gradient-to-br from-primary/90 to-gray-900/80 shadow-2xl flex items-center justify-between px-4 md:px-8 py-3 md:py-4 backdrop-blur-lg border-b border-accent">
        {/* Show user pic/name only on mobile (sidebar covers desktop) */}
        <div className="flex items-center gap-3 md:hidden">
          <img src={user.profilePicture} alt="profile" className="w-10 h-10 rounded-full border-2 border-accent shadow-xl" />
          <div>
            <div className="font-bold text-base text-accent drop-shadow">{user.name}</div>
            <div className="text-xs text-gray-300">@{user.username}</div>
          </div>
        </div>
        <div className="flex items-center gap-6 mx-auto md:mx-0">
          <span className="text-xl md:text-2xl font-extrabold tracking-widest text-gradient bg-gradient-to-r from-accent to-sui bg-clip-text text-transparent drop-shadow-lg">Welcome</span>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12" /> {/* Spacer for alignment */}
      </header>
      <CommodityTicker />
    </>
  );
}
