import React from 'react';

const testimonials = [
  {
    name: 'Alice W.',
    quote: 'Ton Sui Mining has transformed my crypto portfolio. The AI insights are spot on!',
    avatar: '🧑‍💼',
  },
  {
    name: 'Brian K.',
    quote: 'I love the instant withdrawals and transparent reporting. Highly recommend!',
    avatar: '👨‍💻',
  },
  {
    name: 'Sophia L.',
    quote: 'The support team is always there for me. The platform feels secure and easy to use.',
    avatar: '👩‍💼',
  },
];

const TestimonialsSection = () => (
  <section className="py-24 px-4 bg-primary">
    <div className="container mx-auto max-w-4xl">
      <h2 className="text-4xl font-bold mb-10 text-accent text-center">What Our Users Say</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.map((t, idx) => (
          <div key={idx} className="rounded-xl bg-gray-900/80 p-8 shadow-lg border border-gray-800 text-center">
            <div className="text-5xl mb-4">{t.avatar}</div>
            <blockquote className="italic text-lg text-gray-300 mb-2">"{t.quote}"</blockquote>
            <div className="font-bold text-sui">{t.name}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
