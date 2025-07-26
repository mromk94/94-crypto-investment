import React, { useState, useEffect } from 'react';

export default function AdminSettings({ fetchConfig, saveConfig }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchConfig()
      .then(cfg => { setConfig(cfg); setLoading(false); })
      .catch(e => { setError('Failed to load config'); setLoading(false); });
  }, [fetchConfig]);

  function handleChange(e) {
    setConfig({ ...config, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true); setError(null); setSuccess(null);
    try {
      await saveConfig(config);
      setSuccess('Settings saved!');
    } catch (e) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-accent">Loading settings...</div>;
  if (!config) return <div className="text-red-500">No config found.</div>;

  return (
    <form className="max-w-xl mx-auto bg-gray-900 rounded-2xl shadow-xl p-8 flex flex-col gap-6" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-accent mb-2">System Settings</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-accent font-semibold mb-1">DB Host</label>
          <input className="input text-black" name="db_host" value={config.db_host} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">DB Name</label>
          <input className="input text-black" name="db_name" value={config.db_name} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">DB User</label>
          <input className="input text-black" name="db_user" value={config.db_user} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">DB Pass</label>
          <input className="input text-black" name="db_pass" type="password" value={config.db_pass} onChange={handleChange} required />
        </div>
      </div>
      <h3 className="text-xl font-bold text-accent mt-4 mb-2">SMTP Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-accent font-semibold mb-1">SMTP Host</label>
          <input className="input text-black" name="smtp_host" value={config.smtp_host} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">SMTP Port</label>
          <input className="input text-black" name="smtp_port" value={config.smtp_port} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">SMTP User</label>
          <input className="input text-black" name="smtp_user" value={config.smtp_user} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">SMTP Pass</label>
          <input className="input text-black" name="smtp_pass" type="password" value={config.smtp_pass} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">SMTP Secure</label>
          <select className="input text-black" name="smtp_secure" value={config.smtp_secure} onChange={handleChange} required>
            <option value="tls">TLS</option>
            <option value="ssl">SSL</option>
          </select>
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">SMTP From Email</label>
          <input className="input text-black" name="smtp_from" value={config.smtp_from} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">SMTP From Name</label>
          <input className="input text-black" name="smtp_from_name" value={config.smtp_from_name} onChange={handleChange} required />
        </div>
      </div>
      <h3 className="text-xl font-bold text-accent mt-8 mb-2">Exchange Rates</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-accent font-semibold mb-1">USDT / TON Rate</label>
          <input className="input text-black" name="rate_usdt_ton" type="number" step="any" value={config.rate_usdt_ton || ''} onChange={handleChange} required />
          <span className="text-xs text-gray-400">How many TON per 1 USDT</span>
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">USDT / SUI Rate</label>
          <input className="input text-black" name="rate_usdt_sui" type="number" step="any" value={config.rate_usdt_sui || ''} onChange={handleChange} required />
          <span className="text-xs text-gray-400">How many SUI per 1 USDT</span>
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">USDT / BTC Rate</label>
          <input className="input text-black" name="rate_usdt_btc" type="number" step="any" value={config.rate_usdt_btc || ''} onChange={handleChange} required />
          <span className="text-xs text-gray-400">How many BTC per 1 USDT</span>
        </div>
        <div>
          <label className="block text-accent font-semibold mb-1">USDT / ETH Rate</label>
          <input className="input text-black" name="rate_usdt_eth" type="number" step="any" value={config.rate_usdt_eth || ''} onChange={handleChange} required />
          <span className="text-xs text-gray-400">How many ETH per 1 USDT</span>
        </div>
      </div>
      {error && <div className="text-red-500">{error}</div>}
      {success && <div className="text-green-400">{success}</div>}
      <button type="submit" className="btn btn-accent mt-4" disabled={saving}>{saving ? 'Saving...' : 'Save Settings'}</button>
    </form>
  );
}
