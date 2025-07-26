import React, { useState } from 'react';
import AdminModal from './AdminModal';

const ADMIN_FIELDS = [
  { name: 'username', label: 'Username', required: true },
  { name: 'role', label: 'Role', required: true },
  { name: 'status', label: 'Status', required: true },
];

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    fetch('/auth-backend/get_admins.php', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch admins');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setAdmins(data.admins);
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
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [modalAdmin, setModalAdmin] = useState({});

  function handleAdd() {
    setEditIdx(null);
    setModalAdmin({});
    setModalOpen(true);
  }
  function handleEdit(idx) {
    setEditIdx(idx);
    setModalAdmin(admins[idx]);
    setModalOpen(true);
  }
  async function handleSave(admin) {
    if (editIdx === null) {
      // Add admin via backend
      try {
        const res = await fetch('/auth-backend/add_admin.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(admin),
        });
        const data = await res.json();
        if (data.success) {
          setAdmins([...admins, { ...admin, id: data.id }]);
        } else {
          alert(data.error || 'Failed to add admin');
        }
      } catch (e) {
        alert(e.message);
      }
    } else {
      // Edit admin via backend
      try {
        const res = await fetch('/auth-backend/edit_admin.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...admin, id: admins[editIdx].id }),
        });
        const data = await res.json();
        if (data.success) {
          setAdmins(admins.map((a, i) => i === editIdx ? { ...admin, id: admins[editIdx].id } : a));
        } else {
          alert(data.error || 'Failed to edit admin');
        }
      } catch (e) {
        alert(e.message);
      }
    }
    setModalOpen(false);
    setEditIdx(null);
  }
  async function handleDelete(idx) {
    if (!window.confirm('Are you sure you want to delete this admin?')) return;
    const admin = admins[idx];
    try {
      const res = await fetch('/auth-backend/delete_admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: admin.id }),
      });
      const data = await res.json();
      if (data.success) {
        setAdmins(admins.filter((_, i) => i !== idx));
      } else {
        alert(data.error || 'Failed to delete admin');
      }
    } catch (e) {
      alert(e.message);
    }
  }
  const filtered = admins.filter(a => a.username.includes(search));
  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">Admin Management</h2>
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-4">Add, edit, and manage admin users and roles.</p>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <input className="flex-1 rounded-lg px-3 py-2 bg-gray-800 text-black border border-accent/40 focus:outline-accent" placeholder="Search admins..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="bg-accent text-gray-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-sui transition" onClick={handleAdd}>Add Admin</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent/20">
            <thead>
              <tr className="text-accent text-left">
                <th className="py-2 px-2">Username</th>
                <th className="py-2 px-2">Role</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((admin, idx) => (
                <tr key={idx} className="hover:bg-accent/10">
                  <td className="py-2 px-2 font-semibold text-accent">@{admin.username}</td>
                  <td className="py-2 px-2">{admin.role}</td>
                  <td className="py-2 px-2">{admin.status}</td>
                  <td className="py-2 px-2 flex gap-2">
                    <button className="bg-sui text-black px-2 py-1 rounded hover:bg-accent/80 transition" onClick={() => handleEdit(idx)}>Edit</button>
                    <button className="bg-red-500 text-black px-2 py-1 rounded hover:bg-red-600 transition" onClick={() => handleDelete(idx)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AdminModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditIdx(null); }}
        onSave={handleSave}
        initial={modalAdmin}
        title={editIdx === null ? 'Add Admin' : 'Edit Admin'}
        fields={ADMIN_FIELDS}
      />
    </section>
  );
}
