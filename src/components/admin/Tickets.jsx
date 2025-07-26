import React, { useState } from 'react';
import AdminTicketDetail from './AdminTicketDetail';
import TicketModal from './TicketModal';

const TICKET_FIELDS = [
  { name: 'subject', label: 'Subject', required: true },
  { name: 'username', label: 'Username', required: true },
  { name: 'message', label: 'Message', required: true, type: 'textarea' },
  { name: 'status', label: 'Status', required: true },
  { name: 'created', label: 'Created', required: true },
];

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    fetch('/auth-backend/get_tickets.php', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tickets');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setTickets(data.tickets);
        } else {
          setError(data.error || 'Unknown error');
        }
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [modalTicket, setModalTicket] = useState({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);

  function handleRespond(idx) {
    setDetailTicket(tickets[idx]);
    setDetailOpen(true);
  }
  function handleAssign(idx) {
    setTickets(tickets.map((t, i) => i === idx ? { ...t, status: 'Assigned' } : t));
  }
  function handleClose(idx) {
    setTickets(tickets.map((t, i) => i === idx ? { ...t, status: 'Closed' } : t));
  }
  function handleEdit(idx) {
    setEditIdx(idx);
    setModalTicket(tickets[idx]);
    setModalOpen(true);
  }
  async function handleSave(ticket) {
    if (editIdx === null) {
      // Add ticket via backend
      try {
        const res = await fetch('/auth-backend/add_ticket.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(ticket),
        });
        const data = await res.json();
        if (data.success) {
          setTickets([...tickets, { ...ticket, id: data.id }]);
        } else {
          alert(data.error || 'Failed to add ticket');
        }
      } catch (e) {
        alert(e.message);
      }
    } else {
      // Edit ticket via backend
      try {
        const res = await fetch('/auth-backend/edit_ticket.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...ticket, id: tickets[editIdx].id }),
        });
        const data = await res.json();
        if (data.success) {
          setTickets(tickets.map((t, i) => i === editIdx ? { ...ticket, id: tickets[editIdx].id } : t));
        } else {
          alert(data.error || 'Failed to edit ticket');
        }
      } catch (e) {
        alert(e.message);
      }
    }
    setModalOpen(false);
    setEditIdx(null);
  }
  function handleAdd() {
    setEditIdx(null);
    setModalTicket({});
    setModalOpen(true);
  }
  async function handleDelete(idx) {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    const ticket = tickets[idx];
    try {
      const res = await fetch('/auth-backend/delete_ticket.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: ticket.id }),
      });
      const data = await res.json();
      if (data.success) {
        setTickets(tickets.filter((_, i) => i !== idx));
      } else {
        alert(data.error || 'Failed to delete ticket');
      }
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">Support Tickets</h2>
      <AdminTicketDetail open={detailOpen} onClose={() => setDetailOpen(false)} ticket={detailTicket} />
      <TicketModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditIdx(null); }}
        onSave={handleSave}
        initial={modalTicket}
        title={editIdx === null ? 'Add Ticket' : 'Edit Ticket'}
        fields={TICKET_FIELDS}
      />
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-4">View and respond to user support tickets. Assign, close, or escalate as needed.</p>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <button className="bg-accent text-gray-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-sui transition" onClick={handleAdd}>Add Ticket</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent/20">
            <thead>
              <tr className="text-accent text-left">
                <th className="py-2 px-2">Ticket</th>
                <th className="py-2 px-2">User</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Created</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket, idx) => (
                <tr key={ticket.id} className="hover:bg-accent/10">
                  <td className="py-2 px-2 font-semibold text-accent">#{ticket.id}</td>
                  <td className="py-2 px-2">@{ticket.username}</td>
                  <td className="py-2 px-2">{ticket.status}</td>
                  <td className="py-2 px-2">{ticket.created}</td>
                  <td className="py-2 px-2 flex gap-2">
                    <button className="bg-sui text-black px-2 py-1 rounded hover:bg-accent/80 transition" onClick={() => handleRespond(idx)}>Respond</button>
                    <button className="bg-gray-800 text-accent px-2 py-1 rounded hover:bg-accent/20 transition" onClick={() => handleAssign(idx)}>Assign</button>
                    <button className="bg-red-500 text-black px-2 py-1 rounded hover:bg-red-600 transition" onClick={() => handleClose(idx)}>Close</button>
                    <button className="bg-blue-700 text-black px-2 py-1 rounded hover:bg-blue-800 transition" onClick={() => handleEdit(idx)}>Edit</button>
                    <button className="bg-red-700 text-white px-2 py-1 rounded hover:bg-red-800 transition" onClick={() => handleDelete(idx)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
