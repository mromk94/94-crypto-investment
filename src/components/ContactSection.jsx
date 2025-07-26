import React, { useState } from 'react';

const ContactSection = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real app, submit to backend or email service here
  };

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-primary to-gray-900" id="contact">
      <div className="container mx-auto max-w-2xl">
        <h2 className="text-4xl font-bold mb-6 text-accent text-center">Contact Us</h2>
        <p className="text-lg text-gray-300 mb-8 text-center">
          Have a question, feedback, or partnership inquiry? Fill out the form below and our team will get back to you promptly.
        </p>
        <form onSubmit={handleSubmit} className="bg-gray-900/80 rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block mb-2 text-gray-400 font-medium" htmlFor="name">Name</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-400 font-medium" htmlFor="email">Email</label>
            <input
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-gray-400 font-medium" htmlFor="message">Message</label>
            <textarea
              className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-accent text-primary font-bold text-lg shadow-lg hover:bg-sui transition"
            disabled={submitted}
          >
            {submitted ? 'Message Sent!' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
