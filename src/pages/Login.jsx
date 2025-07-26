import React, { useState } from 'react';

const Login = () => {
  const [form, setForm] = useState({ identity: '', password: '' });
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
      const res = await fetch('/auth-backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Login successful!');
        // Optionally, store user data/token here
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center text-accent">Login</h2>
        {error && <div className="mb-4 text-red-400 text-center">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center">{success}</div>}
        <input type="text" name="identity" placeholder="Username or Email" value={form.identity} onChange={handleChange} className="mb-3 w-full px-4 py-2 rounded bg-gray-700 text-black" required />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="mb-6 w-full px-4 py-2 rounded bg-gray-700 text-black" required />
        <button disabled={loading} type="submit" className="w-full py-2 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition mb-2">{loading ? 'Logging in...' : 'Login'}</button>
        <div className="text-center mt-2">
          <a href="/forgot" className="text-accent hover:underline">Forgot password?</a>
        </div>
        <div className="text-center mt-2">
          <a href="/register" className="text-accent hover:underline">Don't have an account? Register</a>
        </div>
      </form>
    </div>
  );
};

export default Login;
