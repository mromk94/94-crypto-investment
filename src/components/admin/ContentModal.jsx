import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function ContentModal({ 
  open, 
  onClose, 
  onSave, 
  initial, 
  title, 
  fields, 
  disabled = false 
}) {
  const [form, setForm] = useState(initial || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  // Reset form when initial values or modal open state changes
  useEffect(() => { 
    if (open) {
      setForm(initial || {});
      setLocalError(null);
    }
  }, [initial, open]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const missingFields = fields
      .filter(field => field.required && !form[field.name]?.trim())
      .map(field => field.label);
    
    if (missingFields.length > 0) {
      setLocalError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onSave(form);
      // onSave will handle closing the modal on success
    } catch (error) {
      console.error('Error saving content:', error);
      setLocalError(error.message || 'Failed to save content');
      toast.error('Failed to save changes. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <form 
        className="bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col border-2 border-accent/50 overflow-hidden"
        onSubmit={handleSubmit}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-accent">{title}</h2>
          <button 
            type="button" 
            onClick={onClose}
            className="text-gray-400 hover:text-white focus:outline-none"
            disabled={isSubmitting}
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          {fields.map(field => (
            <div key={field.name} className="mb-6">
              <label className="block text-sm font-semibold text-accent mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {field.type === 'textarea' || field.rows > 1 ? (
                <textarea
                  name={field.name}
                  value={form[field.name] || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition text-white"
                  rows={field.rows || 6}
                  disabled={disabled || isSubmitting}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                />
              ) : (
                <input
                  type={field.type || 'text'}
                  name={field.name}
                  value={form[field.name] || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none transition text-white"
                  disabled={disabled || isSubmitting}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                />
              )}
              {field.helpText && (
                <p className="mt-1 text-xs text-gray-400">{field.helpText}</p>
              )}
            </div>
          ))}
          
          {localError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500 text-red-300 rounded-lg text-sm">
              {localError}
            </div>
          )}
        </div>
        
        {/* Modal Footer */}
        <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-700">
          <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 text-sm font-medium text-gray-900 bg-accent hover:bg-accent/90 rounded-lg transition flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? (
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
  );
}
