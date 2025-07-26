import React from 'react';

const features = [
  {
    title: 'AI-Driven Insights',
    desc: 'Harness advanced AI to analyze market trends and maximize your crypto returns.'
  },
  {
    title: 'Real-Time Analytics',
    desc: 'Get up-to-date performance metrics and actionable investment insights.'
  },
  {
    title: 'Secure & Transparent',
    desc: 'Your assets and data are protected with industry-leading security and blockchain transparency.'
  },
  {
    title: 'Instant Withdrawals',
    desc: 'Access your funds instantly, anytime, with no hidden fees.'
  },
  {
    title: '24/7 Support',
    desc: 'Our support team is always available to assist you.'
  }
];

const FeaturesSection = () => (
  <section className="py-24 px-4 bg-primary">
    <div className="container mx-auto max-w-5xl">
      <h2 className="text-4xl font-bold mb-10 text-accent text-center">Platform Features</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, idx) => (
          <div key={idx} className="rounded-xl bg-gray-900/80 p-8 shadow-lg border border-gray-800 text-center hover:scale-105 transition">
            <h3 className="text-2xl font-bold mb-2 text-sui">{f.title}</h3>
            <p className="text-gray-300">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
