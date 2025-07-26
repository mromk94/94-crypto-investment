import React, { useState } from 'react';

export default function AdminLogin({ onLogin }) {
  console.log('AdminLogin component rendered');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Real login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(window.location.origin + '/TonSuiMining/auth-backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identity: username, password })
      });
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        console.log('Login success, calling onLogin:', data.user);
        onLogin && onLogin(data.user);
      } else {
        setError(data.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setLoading(false);
      setError('Network or server error.');
    }
  };


  const handleRecovery = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // TODO: Replace with real API call
    setTimeout(() => {
      setLoading(false);
      setRecoverySent(true);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-primary/90 to-sui/80">
      <div className="w-full max-w-md bg-gray-900/95 rounded-2xl shadow-2xl p-8 border border-accent/30">
        <h2 className="text-3xl font-extrabold text-accent mb-8 text-center">Admin Login</h2>
        {showRecovery ? (
          <form onSubmit={handleRecovery} className="space-y-6">
            <div>
              <label className="block text-accent mb-1">Admin Email</label>
              <input
                type="email"
                className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                placeholder="admin@email.com"
                value={recoveryEmail}
                onChange={e => setRecoveryEmail(e.target.value)}
                required
              />
            </div>
            {recoverySent ? (
              <div className="text-green-400 font-bold text-center">Recovery link sent! Check your email.</div>
            ) : (
              <button
                type="submit"
                className="w-full bg-accent text-gray-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-sui transition disabled:opacity-60"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Recovery Link'}
              </button>
            )}
            <button
              type="button"
              className="w-full mt-2 text-accent/80 hover:text-accent text-xs underline"
              onClick={() => { setShowRecovery(false); setRecoverySent(false); }}
            >
              Back to login
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-accent mb-1">Username</label>
              <input
                type="text"
                className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                placeholder="Admin username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-accent mb-1">Password</label>
              <input
                type="password"
                className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                placeholder="Admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="text-red-400 font-bold text-center">{error}</div>}
            <button
              type="submit"
              className="w-full bg-accent text-gray-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-sui transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              className="w-full mt-2 text-accent/80 hover:text-accent text-xs underline"
              onClick={() => setShowRecovery(true)}
            >
              Forgot password?
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
