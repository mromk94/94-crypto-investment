import React, { useState } from 'react';
import DashboardSessionHeader from '../components/dashboard/DashboardSessionHeader';

export default function DashboardProfile({ user, onUpdate }) {
  const [form, setForm] = useState({
    name: user.name,
    email: user.email,
    password: '',
    profilePicture: user.profilePicture
  });
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    // For demo, just update parent state
    onUpdate({ ...user, ...form });
    setSuccess('Profile updated successfully.');
  };

  return (
    <>
      <DashboardSessionHeader title="Profile" />
      <form className="max-w-lg mx-auto bg-gray-800 p-8 rounded shadow" onSubmit={handleSubmit}>

      <h2 className="text-xl font-bold mb-6 text-accent">Edit Profile</h2>
      {success && <div className="mb-4 text-green-400">{success}</div>}
      <div className="mb-4 flex flex-col items-center">
        <img src={form.profilePicture} alt="profile" className="w-24 h-24 rounded-full border-4 border-accent mb-2" />
        <input type="url" name="profilePicture" value={form.profilePicture} onChange={handleChange} className="w-full px-4 py-2 rounded bg-gray-700 text-black mt-2" placeholder="Profile Picture URL" />
      </div>
      <input type="text" name="name" value={form.name} onChange={handleChange} className="mb-4 w-full px-4 py-2 rounded bg-gray-700 text-black" placeholder="Name" required />
      <input type="email" name="email" value={form.email} onChange={handleChange} className="mb-4 w-full px-4 py-2 rounded bg-gray-700 text-black" placeholder="Email" required />
      <input type="password" name="password" value={form.password} onChange={handleChange} className="mb-6 w-full px-4 py-2 rounded bg-gray-700 text-black" placeholder="New Password (leave blank to keep)" />
      <button type="submit" className="w-full py-2 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition">Update Profile</button>
    </form>
    </>
  );
}
