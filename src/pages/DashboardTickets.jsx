import React, { useState } from 'react';
import DashboardTicketDetail from '../components/DashboardTicketDetail';

const mockTicket = {
  id: 1,
  subject: 'Deposit Issue',
  status: 'Open',
  message: 'I deposited but my balance is not updated. Please help.',
  response: 'We are reviewing your deposit. Thank you for your patience!'
};

export default function DashboardTickets({ user }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(mockTicket);

  const handleTicketClick = (ticket) => {
    setSelectedTicket(ticket);
    setModalOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-800 p-8 rounded shadow">
      <h2 className="text-xl font-bold mb-6 text-accent">Support Tickets</h2>
      <DashboardTicketDetail open={modalOpen} onClose={() => setModalOpen(false)} ticket={selectedTicket} />
      {user.tickets && user.tickets.length > 0 ? (
        <div className="space-y-4">
          {user.tickets.map((ticket, i) => (
            <div key={i} className="p-4 rounded bg-gray-900 border-l-4 border-blue-500 shadow flex justify-between items-center">
              <div>
                <div className="font-bold">#{ticket.id} - {ticket.subject}</div>
                <div className="text-xs mt-1">Status: <span className={ticket.status === 'open' ? 'text-yellow-400 font-bold' : 'text-green-400 font-bold'}>{ticket.status}</span></div>
              </div>
              <button className="px-4 py-2 rounded bg-blue-600 text-white font-bold hover:bg-blue-500 transition">View</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-gray-400">No support tickets found.</div>
      )}
    </div>
  );
}
