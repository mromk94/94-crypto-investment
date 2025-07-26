import React, { useState } from 'react';
import AdminUserDetail from './AdminUserDetail';
import UserModal from './UserModal';
import CreditDebitModal from './CreditDebitModal';

const USER_FIELDS = [
  { name: 'username', label: 'Username', required: true },
  { name: 'name', label: 'Name', required: true },
  { name: 'email', label: 'Email', required: true, type: 'email' },
  { name: 'status', label: 'Status', required: true },
  { name: 'kycStatus', label: 'KYC Status', required: true },
  { name: 'balance', label: 'Balance', required: true, type: 'number' },
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    fetch('/auth-backend/get_users.php', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch users');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setUsers(data.users);
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
  const [modalUser, setModalUser] = useState({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailUser, setDetailUser] = useState(null);
  const [cdOpen, setCdOpen] = useState(false);
  const [cdIdx, setCdIdx] = useState(null);

  function handleCreditDebit(idx) {
    setCdIdx(idx);
    setCdOpen(true);
  }

  function handleAdd() {
    setEditIdx(null);
    setModalUser({});
    setModalOpen(true);
  }
  function handleEdit(idx) {
    setEditIdx(idx);
    setModalUser(users[idx]);
    setModalOpen(true);
  }
  async function handleSave(user) {
    if (editIdx === null) {
      // Add user via backend
      try {
        const res = await fetch('/auth-backend/add_user.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(user),
        });
        const data = await res.json();
        if (data.success) {
          setUsers([...users, { ...user, id: data.id }]);
        } else {
          alert(data.error || 'Failed to add user');
        }
      } catch (e) {
        alert(e.message);
      }
    } else {
      // Edit user via backend
      try {
        const res = await fetch('/auth-backend/edit_user.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(user),
        });
        const data = await res.json();
        if (data.success) {
          setUsers(users.map((a, i) => i === editIdx ? user : a));
        } else {
          alert(data.error || 'Failed to edit user');
        }
      } catch (e) {
        alert(e.message);
      }
    }
    setModalOpen(false);
    setEditIdx(null);
  }
  async function handleDelete(idx) {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    const user = users[idx];
    try {
      const res = await fetch('/auth-backend/delete_user.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((_, i) => i !== idx));
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (e) {
      alert(e.message);
    }
  }
  function handleDetail(idx) {
    setDetailUser(users[idx]);
    setDetailOpen(true);
  }
  const filtered = users.filter(u => u.username.includes(search) || u.email.includes(search));
  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">User Management</h2>
      <AdminUserDetail open={detailOpen} onClose={() => setDetailOpen(false)} user={detailUser} />
      <UserModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditIdx(null); }}
        onSave={handleSave}
        initial={modalUser}
        title={editIdx === null ? 'Add User' : 'Edit User'}
        fields={USER_FIELDS}
      />
      <CreditDebitModal
        open={cdOpen}
        onClose={() => setCdOpen(false)}
        onSubmit={({ type, amount, note }) => {
          setUsers(users => users.map((u, i) => i === cdIdx ? { ...u, balance: type === 'credit' ? Number(u.balance) + amount : Math.max(0, Number(u.balance) - amount) } : u));
          setCdOpen(false);
        }}
        user={cdIdx !== null ? users[cdIdx] : null}
      />
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-4">Add, edit, delete, and impersonate users. Search and filter users below.</p>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <input className="flex-1 rounded-lg px-3 py-2 bg-gray-800 text-black border border-accent/40 focus:outline-accent" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          <button className="bg-accent text-gray-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-sui transition" onClick={handleAdd}>Add User</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent/20">
            <thead>
              <tr className="text-accent text-left">
                <th className="py-2 px-2">Username</th>
                <th className="py-2 px-2">Email</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">KYC</th>
                <th className="py-2 px-2">Balance</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user, idx) => (
                <tr key={idx} className="hover:bg-accent/10">
                  <td className="py-2 px-2 font-semibold text-accent cursor-pointer hover:underline" onClick={() => handleDetail(idx)}>@{user.username}</td>
                  <td className="py-2 px-2 cursor-pointer hover:underline" onClick={() => handleDetail(idx)}>{user.email}</td>
                  <td className="py-2 px-2">{user.status}</td>
                  <td className="py-2 px-2">{user.kycStatus}</td>
                  <td className="py-2 px-2">${user.balance}</td>
                  <td className="py-2 px-2 flex gap-2">
                    <button className="bg-sui text-black px-2 py-1 rounded hover:bg-accent/80 transition" onClick={() => handleEdit(idx)}>Edit</button>
                    <button className="bg-gray-800 text-accent px-2 py-1 rounded hover:bg-accent/20 transition">Impersonate</button>
                    <button className="bg-gray-900 text-sui px-2 py-1 rounded hover:bg-accent/10 transition" onClick={() => window.open('/admin/users/' + user.username, '_blank')}>Open in New Tab</button>
                    <button className="bg-blue-700 text-black px-2 py-1 rounded hover:bg-blue-800 transition">View KYC</button>
                    <button className="bg-green-700 text-black px-2 py-1 rounded hover:bg-green-800 transition" onClick={() => handleCreditDebit(idx)}>Credit/Debit</button>
                    <button className="bg-red-500 text-black px-2 py-1 rounded hover:bg-red-600 transition" onClick={() => handleDelete(idx)}>Delete</button>
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
