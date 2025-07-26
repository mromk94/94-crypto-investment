import React from 'react';

const TradeSection = () => (
  <section className="py-24 px-4 bg-primary" id="trade">
    <div className="container mx-auto max-w-3xl text-center">
      <h2 className="text-4xl font-bold mb-6 text-accent">Trade</h2>
      <p className="text-lg text-gray-300 mb-8">
        Seamlessly trade and invest in Ton and Sui with our secure, AI-powered platform. 
        <br />
        <span className="text-sui font-semibold">Sign in or create an account to access your personalized dashboard and start investing.</span>
      </p>
      <button
        className="px-8 py-4 rounded-lg bg-accent text-primary font-bold text-lg shadow-lg hover:bg-sui transition"
        disabled
        title="Coming soon!"
      >
        Go to Dashboard (Coming Soon)
      </button>
    </div>
  </section>
);

export default TradeSection;
