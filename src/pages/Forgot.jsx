import React, { useState } from 'react';

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/auth-backend/forgot_password.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message);
        setEmail('');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Request failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <form className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-6 text-center text-accent">Forgot Password</h2>
        {error && <div className="mb-4 text-red-400 text-center">{error}</div>}
        {success && <div className="mb-4 text-green-400 text-center">{success}</div>}
        <input type="email" name="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="mb-6 w-full px-4 py-2 rounded bg-gray-700 text-black" required />
        <button disabled={loading} type="submit" className="w-full py-2 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition mb-2">{loading ? 'Sending...' : 'Send Reset Link'}</button>
        <div className="text-center mt-2">
          <a href="/login" className="text-accent hover:underline">Back to Login</a>
        </div>
      </form>
    </div>
  );
};

export default Forgot;
