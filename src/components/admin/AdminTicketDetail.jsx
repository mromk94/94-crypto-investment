import React from 'react';
import Modal from '../Modal';

export default function AdminTicketDetail({ open, onClose, ticket }) {
  if (!ticket) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Ticket #${ticket.id}`}> 
      <div className="space-y-4">
        <div className="font-bold text-accent">Subject</div>
        <div className="text-gray-300 mb-2">{ticket.subject}</div>
        <div className="font-bold text-accent">Status</div>
        <div className="text-gray-300 mb-2">{ticket.status}</div>
        <div className="font-bold text-accent">User</div>
        <div className="text-gray-300 mb-2">@{ticket.username}</div>
        <div className="font-bold text-accent">Message</div>
        <div className="bg-gray-800 rounded p-3 text-gray-200 mb-2 whitespace-pre-wrap">{ticket.message}</div>
        <div className="font-bold text-accent">Admin Response</div>
        <textarea className="w-full bg-gray-900 border border-accent rounded p-2 text-gray-100" rows={4} placeholder="Type your response here..." />
        <div className="flex gap-2 mt-4">
          <button className="bg-sui text-white px-4 py-2 rounded hover:bg-accent/80 transition">Send Response</button>
          <button className="bg-gray-800 text-accent px-4 py-2 rounded hover:bg-accent/20 transition">Assign</button>
          <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">Close Ticket</button>
        </div>
      </div>
    </Modal>
  );
}
