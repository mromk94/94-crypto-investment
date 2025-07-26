import React from 'react';

export default function DashboardReferral({ user }) {
  const referralLink = `${window.location.origin}/register?ref=${user.username}`;
  return (
    <div className="max-w-xl mx-auto bg-gray-800 p-8 rounded shadow flex flex-col gap-6 items-center">
      <h2 className="text-xl font-bold text-accent mb-2">Referral Program</h2>
      <div className="text-gray-300 text-center mb-4">Invite friends and earn rewards! Share your unique referral link below.</div>
      <div className="flex items-center w-full gap-2">
        <input
          className="flex-1 px-4 py-2 rounded bg-gray-700 text-white border border-accent/30 focus:outline-accent text-sm select-all"
          value={referralLink}
          readOnly
        />
        <button
          className="px-4 py-2 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition"
          onClick={() => {navigator.clipboard.writeText(referralLink)}}
        >Copy</button>
      </div>
      <div className="mt-4 text-sm text-gray-400">Referred users must sign up and complete KYC. Track your rewards in your dashboard.</div>
    </div>
  );
}
