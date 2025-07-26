import React from 'react';
import Modal from './Modal';

export default function DashboardTicketDetail({ open, onClose, ticket }) {
  if (!ticket) return null;
  return (
    <Modal open={open} onClose={onClose} title={`Ticket #${ticket.id}`}> 
      <div className="space-y-4">
        <div className="font-bold text-accent">Subject</div>
        <div className="text-gray-300 mb-2">{ticket.subject}</div>
        <div className="font-bold text-accent">Status</div>
        <div className="text-gray-300 mb-2">{ticket.status}</div>
        <div className="font-bold text-accent">Message</div>
        <div className="bg-gray-800 rounded p-3 text-gray-200 mb-2 whitespace-pre-wrap">{ticket.message}</div>
        {ticket.response && (
          <>
            <div className="font-bold text-accent">Admin Response</div>
            <div className="bg-gray-900 rounded p-3 text-green-400 mb-2 whitespace-pre-wrap">{ticket.response}</div>
          </>
        )}
      </div>
    </Modal>
  );
}
