import React, { useState } from 'react';
import AdminKycBuilder from './AdminKycBuilder';

const MOCK_KYC_LIST = [
  { id: 1, user: 'alice', submitted: '2025-07-01', status: 'pending', fields: [{ label: 'Full Name', value: 'Alice Smith' }, { label: 'ID Document', value: 'alice_id.pdf' }] },
  { id: 2, user: 'bob', submitted: '2025-07-03', status: 'approved', fields: [{ label: 'Full Name', value: 'Bob Jones' }, { label: 'ID Document', value: 'bob_id.pdf' }] },
  { id: 3, user: 'carol', submitted: '2025-07-04', status: 'rejected', fields: [{ label: 'Full Name', value: 'Carol Lee' }, { label: 'ID Document', value: 'carol_id.pdf' }] },
];

export default function AdminKycPanel() {
  const [kycList, setKycList] = useState(MOCK_KYC_LIST);
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState(null);

  function handleStatus(id, status) {
    setKycList(kycList.map(k => k.id === id ? { ...k, status } : k));
    setSelectedKyc(null);
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* KYC List/Approval Section */}
      <div className="bg-gray-900 rounded-2xl shadow-xl p-6 flex flex-col gap-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-accent">KYC Submissions</h2>
          <button className="btn btn-accent" onClick={() => setShowBuilder(b => !b)}>{showBuilder ? 'Back to List' : 'Edit KYC Form'}</button>
        </div>
        {!showBuilder && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-accent/10">
                  <th className="px-2 py-1 text-left">User</th>
                  <th className="px-2 py-1">Submitted</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {kycList.map(kyc => (
                  <tr key={kyc.id} className={selectedKyc?.id === kyc.id ? 'bg-accent/10' : ''}>
                    <td className="px-2 py-1">{kyc.user}</td>
                    <td className="px-2 py-1">{kyc.submitted}</td>
                    <td className="px-2 py-1">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${kyc.status === 'approved' ? 'bg-green-600/60' : kyc.status === 'rejected' ? 'bg-red-600/60' : 'bg-yellow-500/60 text-gray-900'}`}>{kyc.status}</span>
                    </td>
                    <td className="px-2 py-1">
                      <button className="btn btn-xs btn-accent mr-1" onClick={() => setSelectedKyc(kyc)}>View</button>
                      {kyc.status === 'pending' && (
                        <>
                          <button className="btn btn-xs btn-green mr-1" onClick={() => handleStatus(kyc.id, 'approved')}>Approve</button>
                          <button className="btn btn-xs btn-red" onClick={() => handleStatus(kyc.id, 'rejected')}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* KYC Detail Modal */}
        {selectedKyc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-gray-900 rounded-xl shadow-2xl p-8 max-w-lg w-full relative">
              <button className="absolute top-2 right-2 text-2xl" onClick={() => setSelectedKyc(null)}>&times;</button>
              <h3 className="text-accent font-bold text-lg mb-2">KYC Details for {selectedKyc.user}</h3>
              <ul className="mb-4">
                {selectedKyc.fields.map((f, i) => (
                  <li key={i}><span className="font-semibold text-accent">{f.label}:</span> <span className="text-white/90">{f.value}</span></li>
                ))}
              </ul>
              <div className="flex gap-2">
                {selectedKyc.status === 'pending' && <button className="btn btn-green" onClick={() => handleStatus(selectedKyc.id, 'approved')}>Approve</button>}
                {selectedKyc.status === 'pending' && <button className="btn btn-red" onClick={() => handleStatus(selectedKyc.id, 'rejected')}>Reject</button>}
                <button className="btn btn-accent" onClick={() => setSelectedKyc(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* KYC Builder Section */}
      {showBuilder && (
        <div>
          <AdminKycBuilder
            fetchKycForm={async () => ([{ id: 1, type: 'text', label: 'Full Name', required: true }, { id: 2, type: 'number', label: 'Age', required: false }, { id: 3, type: 'file', label: 'ID Document', required: true }])}
            saveKycForm={async (fields) => { console.log('Saving KYC form', fields); }}
          />
        </div>
      )}
    </div>
  );
}
