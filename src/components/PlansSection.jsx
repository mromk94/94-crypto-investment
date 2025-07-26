import React from 'react';

const plans = [
  {
    name: 'Starter',
    price: '100 TON',
    minBuy: '100 TON',
    features: [
      'AI portfolio suggestions',
      'Daily profit: 1.5% - 2%',
      '24/7 support',
      'Instant withdrawal',
      'Access to Ton only',
    ],
    color: 'from-ton to-accent',
  },
  {
    name: 'VIP',
    price: '500 TON',
    minBuy: '500 TON',
    features: [
      'Advanced AI strategies',
      'Daily profit: 2% - 2.5%',
      'Priority support',
      'Instant withdrawal',
      'Access to Ton & Sui',
      'Weekly market insights',
    ],
    color: 'from-sui to-accent',
  },
  {
    name: 'Platinum',
    price: '2000 TON',
    minBuy: '2000 TON',
    features: [
      'Custom AI trading bot',
      'Daily profit: 2.5% - 3%',
      'Dedicated account manager',
      'Instant withdrawal',
      'Access to all coins',
      'Exclusive webinars',
      'Early access to new features',
    ],
    color: 'from-accent to-sui',
  },
];

const PlansSection = () => (
  <section className="py-24 px-4 bg-gradient-to-b from-primary to-gray-900" id="plans">
    <div className="container mx-auto max-w-5xl">
      <h2 className="text-4xl font-bold mb-10 text-accent text-center">Investment Plans</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl shadow-lg bg-gradient-to-br ${plan.color} p-8 flex flex-col items-center border border-gray-800 hover:scale-105 transition`}
          >
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <div className="text-xl font-semibold mb-4">{plan.price} <span className="text-sm font-normal">(min buy: {plan.minBuy})</span></div>
            <ul className="text-gray-900 dark:text-white mb-6 space-y-2">
              {plan.features.map((f, idx) => <li key={idx} className="flex items-center"><span className="mr-2">✔️</span>{f}</li>)}
            </ul>
            <button className="mt-auto px-6 py-2 rounded-lg bg-primary text-accent font-bold border border-accent hover:bg-accent hover:text-primary transition">
              Choose Plan
            </button>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default PlansSection;
