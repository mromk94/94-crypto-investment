import React, { useState, useEffect } from 'react';
import ContentModal from './ContentModal';
import { toast } from 'react-toastify';

const CONTENT_SECTIONS = [
  { key: 'landing', label: 'Landing Page', fields: [{ name: 'content', label: 'Landing Page Content', required: true, rows: 5 }] },
  { key: 'faq', label: 'FAQs', fields: [{ name: 'content', label: 'FAQs Content', required: true, rows: 10 }] },
  { key: 'testimonials', label: 'Testimonials', fields: [{ name: 'content', label: 'Testimonials Content', required: true, rows: 10 }] },
  { key: 'banner', label: 'Dashboard Banner', fields: [{ name: 'content', label: 'Banner Content', required: true, rows: 3 }] },
];

export default function Content() {
  const [modals, setModals] = useState({});
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Fetch content from backend
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch('/auth-backend/get_content.php', {
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setContent(data.content || {});
        } else {
          throw new Error(data.error || 'Failed to load content');
        }
      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err.message);
        toast.error(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleOpen = (section) => {
    setModals(m => ({ ...m, [section]: true }));
  };

  const handleClose = (section) => {
    setModals(m => ({ ...m, [section]: false }));
  };

  const handleSave = async (section, values) => {
    try {
      setSaving(true);
      const response = await fetch('/auth-backend/update_content.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          section_key: section,
          content: values.content
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state with the saved content
        setContent(prev => ({
          ...prev,
          [section]: values.content
        }));
        toast.success(`${CONTENT_SECTIONS.find(s => s.key === section)?.label} updated successfully!`);
        handleClose(section);
      } else {
        throw new Error(data.error || 'Failed to save content');
      }
    } catch (err) {
      console.error('Error saving content:', err);
      toast.error(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <section className="py-8">
        <h2 className="text-3xl font-extrabold mb-6 text-accent">Site Content Management</h2>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading content...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8">
        <h2 className="text-3xl font-extrabold mb-6 text-accent">Site Content Management</h2>
        <div className="bg-red-900/30 border border-red-500 text-red-400 p-4 rounded-lg">
          <p>Error loading content: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-accent">Site Content Management</h2>
      </div>
      
      {/* Modals for each section */}
      {CONTENT_SECTIONS.map(sec => (
        <ContentModal
          key={sec.key}
          open={!!modals[sec.key]}
          onClose={() => handleClose(sec.key)}
          onSave={(vals) => handleSave(sec.key, vals)}
          initial={{ content: content[sec.key] || '' }}
          title={`Edit ${sec.label}`}
          fields={sec.fields}
          disabled={saving}
        />
      ))}
      
      <div className="bg-gray-900/80 rounded-2xl p-6 shadow-xl">
        <p className="text-gray-400 mb-6">
          Manage all site content including landing page, FAQs, testimonials, and dashboard banners.
          Changes are saved automatically when you click "Save" in the editor.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CONTENT_SECTIONS.map(sec => (
            <div key={sec.key} className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-accent/50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-bold text-accent">{sec.label}</h3>
                <span className="text-xs text-gray-500">
                  Last updated: {content[`${sec.key}_updated`] || 'Never'}
                </span>
              </div>
              <div className="text-gray-400 text-sm mb-4 line-clamp-3">
                {content[sec.key] ? 
                  content[sec.key].replace(/<[^>]*>?/gm, '') : 
                  <span className="text-gray-500 italic">No content yet</span>
                }
              </div>
              <button 
                onClick={() => handleOpen(sec.key)}
                className="w-full mt-2 bg-accent/90 hover:bg-accent text-gray-900 font-bold py-2 px-4 rounded-lg shadow hover:shadow-lg transition-all"
                disabled={saving}
              >
                {saving && modals[sec.key] ? 'Saving...' : 'Edit'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
