import React, { useState } from 'react';

function KycDetailModal({ open, onClose, kyc }) {
  if (!open || !kyc) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-lg flex flex-col gap-4 border-2 border-accent">
        <h2 className="text-2xl font-bold text-accent mb-2">KYC Details</h2>
        <div className="text-gray-300"><span className="font-semibold text-accent">User:</span> {kyc.user}</div>
        <div className="text-gray-300"><span className="font-semibold text-accent">Status:</span> {kyc.status}</div>
        <div className="text-gray-300"><span className="font-semibold text-accent">Submitted:</span> {kyc.submitted}</div>
        <div className="text-gray-300"><span className="font-semibold text-accent">Fields:</span></div>
        <ul className="bg-gray-800 rounded p-4 mb-2">
          {Object.entries(kyc.fields).map(([k, v]) => (
            <li key={k} className="mb-1"><span className="font-semibold text-accent">{k}:</span> <span className="text-black bg-white/80 rounded px-1">{v}</span></li>
          ))}
        </ul>
        <button type="button" onClick={onClose} className="btn btn-accent self-end">Close</button>
      </div>
    </div>
  );
}

export default function KYC() {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    fetch('/auth-backend/get_kyc.php', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch KYC');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setKycList(data.kyc);
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
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState(null);
  async function handleAction(idx, action) {
    const kyc = kycList[idx];
    let url = '';
    if (action === 'approve') url = '/auth-backend/approve_kyc.php';
    else if (action === 'reject') url = '/auth-backend/reject_kyc.php';
    else return;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: kyc.id }),
      });
      const data = await res.json();
      if (data.success) {
        setKycList(list => list.map((k, i) => i === idx ? { ...k, status: action === 'approve' ? 'Approved' : 'Rejected' } : k));
      } else {
        alert(data.error || 'Failed to update KYC');
      }
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleDelete(idx) {
    if (!window.confirm('Are you sure you want to delete this KYC entry?')) return;
    const kyc = kycList[idx];
    try {
      const res = await fetch('/auth-backend/delete_kyc.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: kyc.id }),
      });
      const data = await res.json();
      if (data.success) {
        setKycList(list => list.filter((_, i) => i !== idx));
      } else {
        alert(data.error || 'Failed to delete KYC');
      }
    } catch (e) {
      alert(e.message);
    }
  }
  function handleView(idx) {
    setSelectedKyc(kycList[idx]);
    setDetailOpen(true);
  }
  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">KYC Management</h2>
      <KycDetailModal open={detailOpen} onClose={() => setDetailOpen(false)} kyc={selectedKyc} />
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-4">Review, approve, or reject user KYC submissions.</p>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent/20">
            <thead>
              <tr className="text-accent text-left">
                <th className="py-2 px-2">User</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Submitted</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {kycList.map((kyc, idx) => (
                <tr key={idx} className="hover:bg-accent/10">
                  <td className="py-2 px-2 font-semibold text-accent">{kyc.user}</td>
                  <td className="py-2 px-2">{kyc.status}</td>
                  <td className="py-2 px-2">{kyc.submitted}</td>
                  <td className="py-2 px-2 flex gap-2">
                    <button className="bg-sui text-white px-2 py-1 rounded hover:bg-accent/80 transition" onClick={() => handleAction(idx, 'approve')}>Approve</button>
                    <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition" onClick={() => handleAction(idx, 'reject')}>Reject</button>
                    <button className="bg-gray-800 text-accent px-2 py-1 rounded hover:bg-accent/20 transition" onClick={() => handleView(idx)}>View</button>
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
