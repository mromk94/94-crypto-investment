import React, { useState } from 'react';
import PlanModal from './PlanModal';

const DEFAULT_PLAN = {
  name: '',
  details: '',
  min: '',
  max: '',
  duration: '',
  frequency: 'daily',
  roi: '',
};

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    setLoading(true);
    fetch('/auth-backend/get_plans.php', {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch plans');
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setPlans(data.plans);
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
  const [modalPlan, setModalPlan] = useState(DEFAULT_PLAN);

  function handleAddPlan() {
    setEditIdx(null);
    setModalPlan(DEFAULT_PLAN);
    setModalOpen(true);
  }

  function handleEdit(idx) {
    setEditIdx(idx);
    setModalPlan(plans[idx]);
    setModalOpen(true);
  }

  async function handleSave(plan) {
    if (editIdx === null) {
      // Add plan via backend
      try {
        const res = await fetch('/auth-backend/add_plan.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(plan),
        });
        const data = await res.json();
        if (data.success) {
          setPlans([...plans, { ...plan, id: data.id }]);
        } else {
          alert(data.error || 'Failed to add plan');
        }
      } catch (e) {
        alert(e.message);
      }
    } else {
      // Edit plan via backend
      try {
        const res = await fetch('/auth-backend/edit_plan.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ ...plan, id: plans[editIdx].id }),
        });
        const data = await res.json();
        if (data.success) {
          setPlans(plans.map((p, i) => i === editIdx ? { ...plan, id: plans[editIdx].id } : p));
        } else {
          alert(data.error || 'Failed to edit plan');
        }
      } catch (e) {
        alert(e.message);
      }
    }
    setModalOpen(false);
    setEditIdx(null);
  }

  async function handleDelete(idx) {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
    const plan = plans[idx];
    try {
      const res = await fetch('/auth-backend/delete_plan.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id: plan.id }),
      });
      const data = await res.json();
      if (data.success) {
        setPlans(plans.filter((_, i) => i !== idx));
      } else {
        alert(data.error || 'Failed to delete plan');
      }
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">Plans Management</h2>
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-4">Add, edit, or remove investment plans. Set rates, durations, and perks.</p>
        <div className="mb-4 flex flex-col md:flex-row gap-4">
          <button
            className="bg-accent text-gray-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-sui transition"
            onClick={handleAddPlan}
          >
            Add Plan
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-accent/20">
            <thead>
              <tr className="text-accent text-left">
                <th className="py-2 px-2">Plan</th>
                <th className="py-2 px-2">Details</th>
                <th className="py-2 px-2">Min</th>
                <th className="py-2 px-2">Max</th>
                <th className="py-2 px-2">Duration (days)</th>
                <th className="py-2 px-2">ROI Freq</th>
                <th className="py-2 px-2">ROI (%)</th>
                <th className="py-2 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan, idx) => (
                <tr key={idx} className="hover:bg-accent/10">
                  <td className="py-2 px-2 font-semibold text-accent">{plan.name}</td>
                  <td className="py-2 px-2">{plan.details}</td>
                  <td className="py-2 px-2">{plan.min}</td>
                  <td className="py-2 px-2">{plan.max}</td>
                  <td className="py-2 px-2">{plan.duration}</td>
                  <td className="py-2 px-2">{plan.frequency}</td>
                  <td className="py-2 px-2">{plan.roi}</td>
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
      <PlanModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditIdx(null); }}
        onSave={handleSave}
        plan={modalPlan}
      />
    </section>
  );
}
