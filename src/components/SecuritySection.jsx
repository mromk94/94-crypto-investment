import React from 'react';

const SecuritySection = () => (
  <section className="py-20 px-4 bg-gradient-to-r from-gray-900 via-primary to-gray-900">
    <div className="container mx-auto max-w-4xl">
      <h2 className="text-3xl font-bold mb-6 text-accent">Security & Transparency</h2>
      <ul className="list-disc list-inside text-gray-300 space-y-2">
        <li>Multi-layered encryption for all user data and transactions</li>
        <li>Non-custodial wallets: you control your keys</li>
        <li>Regular third-party security audits</li>
        <li>Transparent fee structure and on-chain reporting</li>
        <li>AI-powered fraud detection and prevention</li>
      </ul>
    </div>
  </section>
);

export default SecuritySection;
