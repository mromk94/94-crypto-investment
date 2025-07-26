import React, { useState, useEffect } from 'react';

// Fetch real withdrawal PIN users from backend

export default function AdminWithdrawalPins() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pinInput, setPinInput] = useState('');

  React.useEffect(() => {
    setLoading(true);
    setError(null);
    fetch('/auth-backend/get_withdrawal_pins.php', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch withdrawal PINs');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setPins(data.pins);
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

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState(null);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/auth-backend/get_users.php', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success) {
          setUsers(data.users);
        } else {
          setUsersError(data.error || 'Failed to load users');
        }
      } catch (e) {
        setUsersError(e.message);
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading || usersLoading) return <div className="p-8 text-center text-accent">Loading withdrawal PINs and users...</div>;
  if (error) return <div className="p-8 text-center text-red-400">{error}</div>;
  if (usersError) return <div className="p-8 text-center text-red-400">Error loading users: {usersError}</div>;
  if (users.length === 0) return <div className="p-8 text-center text-gray-400">No users found.</div>;

  function openModal(userId) {
    setSelectedUser(userId);
    setShowModal(true);
    setPinInput('');
    setError('');
  }
  function closeModal() {
    setShowModal(false);
    setSelectedUser(null);
    setPinInput('');
    setError('');
  }
  async function handleAddPin() {
    if (!pinInput.trim()) {
      setError('PIN cannot be empty.');
      return;
    }
    try {
      const res = await fetch('/auth-backend/add_pin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ user: selectedUser, pin: pinInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setPins(pins => {
          const updated = { ...pins };
          if (!updated[selectedUser]) updated[selectedUser] = [];
          updated[selectedUser].push({ pin: pinInput.trim(), id: data.id, addedAt: new Date().toISOString() });
          return updated;
        });
        setPinInput('');
        setError('');
      } else {
        setError(data.error || 'Failed to add PIN');
      }
    } catch (e) {
      setError(e.message);
    }
  }
  async function handleRemovePin(idx) {
    const pinObj = (pins[selectedUser] || [])[idx];
    if (!pinObj || !window.confirm('Are you sure you want to delete this PIN?')) return;
    try {
      const res = await fetch('/auth-backend/delete_pin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: pinObj.id }),
      });
      const data = await res.json();
      if (data.success) {
        setPins(pins => {
          const updated = { ...pins };
          updated[selectedUser] = updated[selectedUser].filter((_, i) => i !== idx);
          if (updated[selectedUser].length === 0) delete updated[selectedUser];
          return updated;
        });
      } else {
        setError(data.error || 'Failed to delete PIN');
      }
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">Withdrawal PIN Restrictions</h2>
      <p className="mb-4 text-gray-400">Add or remove withdrawal PINs for specific users. Users with PINs must enter the correct code before submitting a withdrawal request.</p>
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <table className="min-w-full divide-y divide-accent/20">
          <thead>
            <tr className="text-accent text-left">
              <th className="py-2 px-2">User</th>
              <th className="py-2 px-2">Active PINs</th>
              <th className="py-2 px-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="hover:bg-accent/10">
                <td className="py-2 px-2 font-semibold text-accent">{user.name} (@{user.username})</td>
                <td className="py-2 px-2">{pins[user.id]?.length || 0}</td>
                <td className="py-2 px-2">
                  <button 
                    className="bg-accent text-gray-900 font-bold px-3 py-1 rounded-lg shadow hover:bg-sui transition mr-2" 
                    onClick={() => openModal(user.id)}
                  >
                    Manage PINs
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4 border-2 border-accent">
            <h3 className="text-2xl font-bold text-accent mb-2">
              Manage PINs for {users.find(u => u.id.toString() === selectedUser?.toString())?.name || 'User'}
            </h3>
            <div className="mb-2">
              <label className="block font-semibold text-accent mb-1">Add New PIN</label>
              <div className="flex gap-2">
                <input type="text" className="input text-black flex-1" value={pinInput} onChange={e => setPinInput(e.target.value)} placeholder="Enter PIN" />
                <button className="btn btn-accent" onClick={handleAddPin}>Add</button>
              </div>
              {error && <div className="text-red-400 text-sm font-semibold mt-2">{error}</div>}
            </div>
            <div>
              <label className="block font-semibold text-accent mb-1">Active PINs</label>
              <ul className="space-y-2">
                {(pins[selectedUser] || []).map((p, idx) => (
                  <li key={idx} className="flex items-center gap-3 bg-gray-800 rounded px-3 py-2">
                    <span className="text-accent font-mono text-lg">{p.pin}</span>
                    <span className="text-xs text-gray-400 ml-2">added {new Date(p.addedAt).toLocaleString()}</span>
                    <button className="ml-auto btn btn-red-500" onClick={() => handleRemovePin(idx)}>Remove</button>
                  </li>
                ))}
                {(!pins[selectedUser] || pins[selectedUser].length === 0) && (
                  <li className="text-gray-400">No active PINs.</li>
                )}
              </ul>
            </div>
            <div className="flex gap-4 mt-6">
              <button className="btn flex-1 btn-gray" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
