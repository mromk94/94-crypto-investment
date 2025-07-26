import React, { useState, useEffect } from 'react';

function MethodModal({ open, onClose, onSave, initial, title, error, setError }) {
  try {
    const [form, setForm] = useState({ name: '', type: 'deposit', details: '', ...(initial || {}) });
    React.useEffect(() => {
      setForm({ name: '', type: 'deposit', details: '', ...(initial || {}) });
    }, [initial, open]);
    if (!open) return null;
    function handleChange(e) {
      const { name, value } = e.target;
      setForm(f => ({ ...f, [name]: value }));
    }
    function handleSubmit(e) {
      e.preventDefault();
      setError(null);
      onSave(form);
    }
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <form className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-4 border-2 border-accent" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-bold text-accent mb-2">{title}</h2>
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-accent">Name</span>
            <input className="input text-black" name="name" value={form.name} onChange={handleChange} required />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-accent">Type</span>
            <select className="input text-black" name="type" value={form.type} onChange={handleChange} required>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-semibold text-accent">Details</span>
            <textarea className="input text-black" name="details" value={form.details} onChange={handleChange} rows={3} required />
          </label>

          {error && <div className="text-red-400 text-sm font-semibold mt-2">{error}</div>}
          <div className="flex gap-4 mt-4">
            <button type="button" onClick={onClose} className="btn flex-1 btn-gray">Cancel</button>
            <button type="submit" className="btn flex-1 btn-accent">Save</button>
          </div>
        </form>
      </div>
    );
  } catch (err) {
    console.error('MethodModal crashed:', err);
    return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 text-red-400 font-bold text-lg">Modal Error: {String(err)}</div>;
  }
}

export default function Methods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [modalMethod, setModalMethod] = useState({});
  const [modalError, setModalError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch payment methods from backend
  const fetchMethods = async () => {
    try {
      setLoading(true);
      const response = await fetch('/auth-backend/get_payment_methods.php', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setMethods(data.methods || []);
      } else {
        throw new Error(data.error || 'Failed to load payment methods');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleAdd = () => {
    setEditId(null);
    setModalMethod({ type: 'deposit' });
    setModalError(null);
    setModalOpen(true);
  };

  const handleEdit = (id) => {
    const method = methods.find(m => m.id === id);
    if (method) {
      setEditId(id);
      setModalMethod({ ...method });
      setModalError(null);
      setModalOpen(true);
    }
  };

  const handleSave = async (methodData) => {
    try {
      setModalError(null);
      const url = editId 
        ? `/auth-backend/update_payment_method.php`
        : '/auth-backend/add_payment_method.php';
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editId ? { id: editId, ...methodData } : methodData),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMethods(); // Refresh the list
        setModalOpen(false);
      } else {
        throw new Error(data.error || 'Failed to save payment method');
      }
    } catch (err) {
      setModalError(err.message);
    }
  };

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const response = await fetch('/auth-backend/delete_payment_method.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: deleteId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchMethods(); // Refresh the list
      } else {
        throw new Error(data.error || 'Failed to delete payment method');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-accent">Payment Methods</h2>
        <button onClick={handleAdd} className="btn btn-accent" disabled={loading}>
          {loading ? 'Loading...' : 'Add Method'}
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {loading && methods.length === 0 ? (
        <div className="text-center py-8 text-accent">Loading payment methods...</div>
      ) : methods.length === 0 ? (
        <div className="text-center py-8 text-gray-400">No payment methods found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <div key={method.id} className="bg-gray-900/80 rounded-xl p-6 shadow-lg border border-accent/20">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-accent">{method.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs ${method.type === 'deposit' ? 'bg-green-900/30 text-green-400' : 'bg-blue-900/30 text-blue-400'}`}>
                  {method.type.charAt(0).toUpperCase() + method.type.slice(1)}
                </span>
              </div>
              <div className="whitespace-pre-line text-gray-300 mb-6">{method.details}</div>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={() => handleEdit(method.id)} 
                  className="btn btn-sm btn-gray"
                  disabled={loading}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(method.id)} 
                  className="btn btn-sm btn-red-500"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <MethodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={modalMethod}
        title={!editId ? 'Add Payment Method' : 'Edit Payment Method'}
        error={modalError}
        setError={setModalError}
      />
      
      {/* Custom Delete Confirmation Modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col gap-6 border-2 border-red-500">
            <h2 className="text-2xl font-bold text-red-400 mb-2">Delete Method?</h2>
            <p className="text-gray-300">
              Are you sure you want to delete <span className="text-accent font-semibold">
                {methods.find(m => m.id === deleteId)?.name}
              </span>?
            </p>
            <div className="flex gap-4 mt-4">
              <button onClick={cancelDelete} className="btn flex-1 btn-gray">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn flex-1 btn-red-500">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
