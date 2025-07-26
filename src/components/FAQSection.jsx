import React from 'react';

const faqs = [
  {
    q: 'How do I get started?',
    a: 'Simply choose a plan, sign up, and fund your account with Ton or Sui.'
  },
  {
    q: 'Are my funds secure?',
    a: 'Yes! We use non-custodial wallets and industry-leading security protocols.'
  },
  {
    q: 'Can I withdraw anytime?',
    a: 'Absolutely. Withdrawals are instant and available 24/7.'
  },
  {
    q: 'What makes your platform AI-powered?',
    a: 'We use advanced machine learning models to optimize trading and maximize returns.'
  },
];

const FAQSection = () => (
  <section className="py-24 px-4 bg-primary">
    <div className="container mx-auto max-w-3xl">
      <h2 className="text-4xl font-bold mb-10 text-accent text-center">Frequently Asked Questions</h2>
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b border-gray-800 pb-4">
            <div className="font-bold text-sui mb-2">Q: {faq.q}</div>
            <div className="text-gray-300">A: {faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;
