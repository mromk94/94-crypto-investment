import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Settings() {
  const [settings, setSettings] = useState({
    site_title: '',
    contact_email: '',
    theme_color: '#0ea5e9',
    logo_url: '/logo.png',
    maintenance_mode: '0',
    registration_enabled: '1',
    withdrawal_min_amount: '10',
    withdrawal_fee: '0.01',
    referral_bonus: '5',
    referral_percentage: '5',
    smtp_enabled: '0',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    smtp_from_email: 'noreply@tonsuimining.com',
    smtp_from_name: 'Ton Sui Mining',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Fetch settings from the backend
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/auth-backend/settings.php', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setSettings(prev => ({
            ...prev,
            ...data.settings,
          }));
        } else {
          toast.error(data.error || 'Failed to load settings');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? '1' : '0') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('/auth-backend/settings.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Settings saved successfully');
      } else {
        toast.error(data.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to default values? This cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch('/auth-backend/settings.php', {
        method: 'DELETE',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Settings reset to defaults');
        // Reload the page to get the default settings
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to reset settings');
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      toast.error('Failed to reset settings. Please try again.');
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-3xl font-extrabold mb-6 text-accent">Site Settings</h2>
        <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl text-center">
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-accent">Site Settings</h2>
        <button
          onClick={resetToDefaults}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          disabled={saving}
        >
          Reset to Defaults
        </button>
      </div>
      
      <div className="bg-gray-900/80 rounded-2xl shadow-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          {['General', 'Email', 'Withdrawals', 'Referrals', 'Advanced'].map((tab) => {
            const tabValue = tab.toLowerCase();
            return (
              <button
                key={tabValue}
                className={`px-6 py-3 font-medium ${activeTab === tabValue ? 'text-accent border-b-2 border-accent' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab(tabValue)}
              >
                {tab}
              </button>
            );
          })}
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-accent mb-1">Site Title</label>
                  <input
                    type="text"
                    name="site_title"
                    value={settings.site_title}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                  />
                </div>
                <div>
                  <label className="block text-accent mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="contact_email"
                    value={settings.contact_email}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                  />
                </div>
                <div>
                  <label className="block text-accent mb-1">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      name="theme_color"
                      value={settings.theme_color}
                      onChange={handleChange}
                      className="h-10 w-16 rounded border border-gray-600"
                    />
                    <input
                      type="text"
                      value={settings.theme_color}
                      onChange={(e) => setSettings(prev => ({ ...prev, theme_color: e.target.value }))}
                      className="flex-1 rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-accent mb-1">Logo URL</label>
                  <input
                    type="text"
                    name="logo_url"
                    value={settings.logo_url}
                    onChange={handleChange}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="maintenance_mode"
                    name="maintenance_mode"
                    checked={settings.maintenance_mode === '1'}
                    onChange={handleChange}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-600 rounded"
                  />
                  <label htmlFor="maintenance_mode" className="ml-2 block text-gray-300">
                    Maintenance Mode
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="registration_enabled"
                    name="registration_enabled"
                    checked={settings.registration_enabled === '1'}
                    onChange={handleChange}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-600 rounded"
                  />
                  <label htmlFor="registration_enabled" className="ml-2 block text-gray-300">
                    Allow New Registrations
                  </label>
                </div>
              </div>
            )}
            
            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    id="smtp_enabled"
                    name="smtp_enabled"
                    checked={settings.smtp_enabled === '1'}
                    onChange={handleChange}
                    className="h-4 w-4 text-accent focus:ring-accent border-gray-600 rounded"
                  />
                  <label htmlFor="smtp_enabled" className="ml-2 block text-gray-300">
                    Enable SMTP Email
                  </label>
                </div>
                
                <div>
                  <label className="block text-accent mb-1">SMTP Host</label>
                  <input
                    type="text"
                    name="smtp_host"
                    value={settings.smtp_host}
                    onChange={handleChange}
                    disabled={settings.smtp_enabled !== '1'}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-accent mb-1">SMTP Port</label>
                  <input
                    type="number"
                    name="smtp_port"
                    value={settings.smtp_port}
                    onChange={handleChange}
                    disabled={settings.smtp_enabled !== '1'}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-accent mb-1">SMTP Username</label>
                  <input
                    type="text"
                    name="smtp_username"
                    value={settings.smtp_username}
                    onChange={handleChange}
                    disabled={settings.smtp_enabled !== '1'}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-accent mb-1">SMTP Password</label>
                  <input
                    type="password"
                    name="smtp_password"
                    value={settings.smtp_password}
                    onChange={handleChange}
                    disabled={settings.smtp_enabled !== '1'}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent disabled:opacity-50"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-accent mb-1">Encryption</label>
                  <select
                    name="smtp_encryption"
                    value={settings.smtp_encryption}
                    onChange={handleChange}
                    disabled={settings.smtp_enabled !== '1'}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent disabled:opacity-50"
                  >
                    <option value="tls">TLS</option>
                    <option value="ssl">SSL</option>
                    <option value="">None</option>
                  </select>
                </div>
                <div>
                  <label className="block text-accent mb-1">From Email</label>
                  <input
                    type="email"
                    name="smtp_from_email"
                    value={settings.smtp_from_email}
                    onChange={handleChange}
                    disabled={settings.smtp_enabled !== '1'}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-accent mb-1">From Name</label>
                  <input
                    type="text"
                    name="smtp_from_name"
                    value={settings.smtp_from_name}
                    onChange={handleChange}
                    disabled={settings.smtp_enabled !== '1'}
                    className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent disabled:opacity-50"
                  />
                </div>
              </div>
            )}
            
            {/* Withdrawal Settings */}
            {activeTab === 'withdrawals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-accent mb-1">Minimum Withdrawal Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      name="withdrawal_min_amount"
                      value={settings.withdrawal_min_amount}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="pl-8 w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-accent mb-1">Withdrawal Fee (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="withdrawal_fee"
                      value={settings.withdrawal_fee}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Referral Settings */}
            {activeTab === 'referrals' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-accent mb-1">Signup Bonus</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">$</span>
                    </div>
                    <input
                      type="number"
                      name="referral_bonus"
                      value={settings.referral_bonus}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="pl-8 w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Bonus given to both referrer and referred user</p>
                </div>
                <div>
                  <label className="block text-accent mb-1">Referral Commission (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="referral_percentage"
                      value={settings.referral_percentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-400">%</span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Percentage of deposits given to referrer</p>
                </div>
              </div>
            )}
            
            {/* Advanced Settings */}
            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="text-lg font-semibold text-accent mb-2">Danger Zone</h3>
                  <p className="text-gray-400 mb-4">These actions are irreversible. Proceed with caution.</p>
                  <button
                    type="button"
                    onClick={resetToDefaults}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    disabled={saving}
                  >
                    Reset All Settings to Defaults
                  </button>
                </div>
                
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h3 className="text-lg font-semibold text-accent mb-2">Export/Import Settings</h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(settings, null, 2))}`;
                        const downloadAnchorNode = document.createElement('a');
                        downloadAnchorNode.setAttribute('href', dataStr);
                        downloadAnchorNode.setAttribute('download', `ton-sui-settings-${new Date().toISOString().split('T')[0]}.json`);
                        document.body.appendChild(downloadAnchorNode);
                        downloadAnchorNode.click();
                        downloadAnchorNode.remove();
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Export Settings
                    </button>
                    <div>
                      <input
                        type="file"
                        id="import-settings"
                        accept=".json"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          
                          try {
                            const content = await file.text();
                            const importedSettings = JSON.parse(content);
                            
                            if (confirm('Are you sure you want to import these settings? This will overwrite your current settings.')) {
                              setSettings(prev => ({
                                ...prev,
                                ...importedSettings,
                              }));
                              toast.success('Settings imported. Click "Save Changes" to apply.');
                            }
                          } catch (err) {
                            console.error('Error importing settings:', err);
                            toast.error('Failed to import settings. Invalid file format.');
                          }
                          
                          // Reset the input to allow re-uploading the same file
                          e.target.value = '';
                        }}
                      />
                      <label
                        htmlFor="import-settings"
                        className="inline-block px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition cursor-pointer"
                      >
                        Import Settings
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-accent text-gray-900 font-bold rounded-lg shadow hover:bg-sui transition flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
