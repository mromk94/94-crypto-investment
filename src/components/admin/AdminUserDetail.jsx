import React from 'react';
import Modal from '../Modal';

export default function AdminUserDetail({ open, onClose, user }) {
  if (!user) return null;
  return (
    <Modal open={open} onClose={onClose} title={`User: ${user.username}`}> 
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <img src={user.profilePicture || '/default-avatar.svg'} alt="avatar" className="w-20 h-20 rounded-full border-4 border-accent" />
          <div>
            <div className="font-bold text-xl text-accent">{user.name}</div>
            <div className="text-gray-400">@{user.username}</div>
            <div className="text-gray-400">{user.email}</div>
            <div className="text-xs mt-1">Status: <span className="font-bold text-accent">{user.status}</span></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-bold text-accent mb-1">KYC Status</div>
            <div>{user.kycStatus || 'Pending'}</div>
          </div>
          <div>
            <div className="font-bold text-accent mb-1">Balance</div>
            <div>${user.balance || 0}</div>
          </div>
        </div>
        <div>
          <div className="font-bold text-accent mb-1">Plans</div>
          <ul className="list-disc ml-5 text-gray-300">
            {(user.plans || []).map((plan, i) => (
              <li key={i}>{plan.name} (${plan.invested} invested, ROI: {plan.roiPercent}% {plan.roiFrequency})</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-bold text-accent mb-1">Tickets</div>
          <ul className="list-disc ml-5 text-gray-300">
            {(user.tickets || []).map((ticket, i) => (
              <li key={i}>#{ticket.id} - {ticket.subject} ({ticket.status})</li>
            ))}
          </ul>
        </div>
        <div className="flex gap-2 mt-6">
          <button className="bg-sui text-white px-4 py-2 rounded hover:bg-accent/80 transition">Edit</button>
          <button className="bg-gray-800 text-accent px-4 py-2 rounded hover:bg-accent/20 transition">Impersonate</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Delete</button>
        </div>
      </div>
    </Modal>
  );
}
