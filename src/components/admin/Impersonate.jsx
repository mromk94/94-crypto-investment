import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function Impersonate() {
  const [username, setUsername] = useState('');
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [originalAdmin, setOriginalAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check impersonation status on component mount
  useEffect(() => {
    checkImpersonationStatus();
  }, []);

  const checkImpersonationStatus = async () => {
    try {
      const response = await fetch('/auth-backend/impersonate.php', {
        method: 'GET',
        credentials: 'include',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsImpersonating(data.data.is_impersonating);
        setCurrentUser(data.data.current_user);
        setOriginalAdmin(data.data.original_admin);
      } else {
        toast.error(data.error || 'Failed to check impersonation status');
      }
    } catch (error) {
      console.error('Error checking impersonation status:', error);
      toast.error('Failed to check impersonation status');
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter a username');
      return;
    }

    try {
      const response = await fetch('/auth-backend/impersonate.php', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username.trim() }),
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Now impersonating ${username}`);
        // Reload the page to update the UI with the impersonated user's context
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to impersonate user');
      }
    } catch (error) {
      console.error('Error impersonating user:', error);
      toast.error('Failed to impersonate user');
    }
  };

  const handleStopImpersonating = async () => {
    try {
      const response = await fetch('/auth-backend/impersonate.php', {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Stopped impersonating user');
        // Reload the page to update the UI with the admin's context
        window.location.reload();
      } else {
        toast.error(data.error || 'Failed to stop impersonation');
      }
    } catch (error) {
      console.error('Error stopping impersonation:', error);
      toast.error('Failed to stop impersonation');
    }
  };

  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-3xl font-extrabold mb-6 text-accent">Impersonate User</h2>
        <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl text-center">
          <p className="text-gray-400">Loading impersonation status...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <h2 className="text-3xl font-extrabold mb-6 text-accent">Impersonate User</h2>
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-4">Temporarily act as a user for troubleshooting or support.</p>
        
        {isImpersonating ? (
          <div className="space-y-4">
            <div className="bg-gray-800/80 p-4 rounded-xl">
              <h3 className="text-accent font-bold mb-2">Currently Impersonating</h3>
              <p className="text-gray-300">
                <span className="font-semibold">User:</span> {currentUser?.username} (ID: {currentUser?.id})
              </p>
              <p className="text-gray-300">
                <span className="font-semibold">Original Admin:</span> {originalAdmin?.username}
              </p>
            </div>
            <button
              onClick={handleStopImpersonating}
              className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg shadow hover:bg-red-700 transition w-full md:w-auto"
            >
              Stop Impersonating
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleImpersonate} className="mb-4 flex flex-col md:flex-row gap-4">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-1 rounded-lg px-3 py-2 bg-gray-800 text-white border border-accent/40 focus:outline-accent"
                placeholder="Enter username..."
                required
              />
              <button 
                type="submit"
                className="bg-accent text-gray-900 font-bold px-4 py-2 rounded-lg shadow hover:bg-sui transition"
              >
                Impersonate
              </button>
            </form>
            <div className="bg-gray-800/80 p-4 rounded-xl text-gray-300">
              <p className="font-semibold text-accent">Note:</p>
              <p className="text-sm">You will be able to navigate the site as the selected user. To stop impersonating, use the "Stop Impersonating" button that will appear.</p>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
