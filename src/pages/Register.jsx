import React, { useState } from 'react';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/auth-backend/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setForm({ name: '', username: '', email: '', password: '', confirmPassword: '' });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center text-accent">Register</h2>
        {error && <div className="mb-4 text-red-400 text-center">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center">{success}</div>}
        <input type="text" name="name" placeholder="Name" value={form.name} onChange={handleChange} className="mb-3 w-full px-4 py-2 rounded bg-gray-700 text-black" required />
        <input type="text" name="username" placeholder="Username" value={form.username} onChange={handleChange} className="mb-3 w-full px-4 py-2 rounded bg-gray-700 text-black" required />
        <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} className="mb-3 w-full px-4 py-2 rounded bg-gray-700 text-black" required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="mb-3 w-full px-4 py-2 rounded bg-gray-700 text-black" required minLength={6} />
        <input type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} className="mb-6 w-full px-4 py-2 rounded bg-gray-700 text-black" required minLength={6} />
        <button disabled={loading} type="submit" className="w-full py-2 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition mb-2">{loading ? 'Registering...' : 'Register'}</button>
        <div className="text-center mt-2">
          <a href="/login" className="text-accent hover:underline">Already have an account? Login</a>
        </div>
      </form>
    </div>
  );
};

export default Register;
