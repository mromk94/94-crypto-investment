import React, { useState } from 'react';

function LogModal({ open, onClose, onSave }) {
  const [form, setForm] = useState({ user: '', action: '', detail: '' });
  if (!open) return null;
  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }
  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, time: new Date().toISOString().replace('T', ' ').slice(0, 16) });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <form className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-4 border-2 border-accent" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold text-accent mb-2">Add Log Entry</h2>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">User/Admin</span>
          <input name="user" value={form.user} onChange={handleChange} className="input text-black" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">Action</span>
          <input name="action" value={form.action} onChange={handleChange} className="input text-black" required />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-semibold text-accent">Detail</span>
          <input name="detail" value={form.detail} onChange={handleChange} className="input text-black" required />
        </label>
        <div className="flex gap-4 mt-4">
          <button type="button" onClick={onClose} className="btn flex-1 btn-gray">Cancel</button>
          <button type="submit" className="btn flex-1 btn-accent">Save</button>
        </div>
      </form>
    </div>
  );
}

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    fetch('/auth-backend/get_logs.php', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch logs');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setLogs(data.logs);
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
  async function handleSave(log, idx = null) {
    if (idx === null) {
      // Add log via backend
      try {
        const res = await fetch('/auth-backend/add_log.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            action: log.action,
            details: log.detail,
            admin: log.user,
            timestamp: log.time
          }),
        });
        const data = await res.json();
        if (data.success) {
          setLogs([{ ...log, id: data.id }, ...logs]);
        } else {
          alert(data.error || 'Failed to add log');
        }
      } catch (e) {
        alert(e.message);
      }
    } else {
      // Edit log via backend
      try {
        const res = await fetch('/auth-backend/edit_log.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            id: logs[idx].id,
            action: log.action,
            details: log.detail,
            admin: log.user,
            timestamp: log.time
          }),
        });
        const data = await res.json();
        if (data.success) {
          setLogs(logs.map((l, i) => i === idx ? { ...log, id: logs[idx].id } : l));
        } else {
          alert(data.error || 'Failed to edit log');
        }
      } catch (e) {
        alert(e.message);
      }
    }
    setModalOpen(false);
    setEditIdx(null);
  }
  const [editIdx, setEditIdx] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLog, setEditLog] = useState(null);

  async function handleDelete(idx) {
    if (!window.confirm('Are you sure you want to delete this log entry?')) return;
    const log = logs[idx];
    try {
      const res = await fetch('/auth-backend/delete_log.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: log.id }),
      });
      const data = await res.json();
      if (data.success) {
        setLogs(logs.filter((_, i) => i !== idx));
      } else {
        alert(data.error || 'Failed to delete log');
      }
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">System Logs</h2>
      <LogModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} />
      {editModalOpen && (
        <LogModal
          open={editModalOpen}
          onClose={() => { setEditModalOpen(false); setEditIdx(null); }}
          onSave={log => handleSave(log, editIdx)}
        />
      )}
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-4">View all admin and user actions, errors, and system events.</p>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <button className="bg-accent text-gray-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-sui transition" onClick={() => setModalOpen(true)}>Add Log Entry</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent/20">
            <thead>
              <tr className="text-accent text-left">
                <th className="py-2 px-2">Time</th>
                <th className="py-2 px-2">User/Admin</th>
                <th className="py-2 px-2">Action</th>
                <th className="py-2 px-2">Detail</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-accent/10">
                  <td className="py-2 px-2">{log.time}</td>
                  <td className="py-2 px-2">{log.user}</td>
                  <td className="py-2 px-2">{log.action}</td>
                  <td className="py-2 px-2">{log.detail}</td>
                  <td className="py-2 px-2 flex gap-2">
                    <button className="bg-blue-700 text-white px-2 py-1 rounded hover:bg-blue-800 transition" onClick={() => { setEditIdx(idx); setEditModalOpen(true); setEditLog(log); }}>Edit</button>
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
