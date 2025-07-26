import React from 'react';

const AboutSection = () => (
  <section className="py-24 px-4 bg-primary" id="about">
    <div className="container mx-auto max-w-4xl">
      <h2 className="text-4xl font-bold mb-6 text-accent">About Us</h2>
      <p className="text-lg text-gray-300 mb-4">
        Ton Sui Mining is an AI-driven crypto investment platform dedicated to empowering investors of all levels. Our mission is to democratize access to high-yield crypto opportunities by leveraging advanced machine learning, robust security, and transparent operations.
      </p>
      <ul className="list-disc list-inside text-gray-300 space-y-2">
        <li>AI-powered trading strategies for optimal returns</li>
        <li>Focus on Ton and Sui, the next-gen blockchain coins</li>
        <li>24/7 portfolio monitoring and insights</li>
        <li>Secure, non-custodial investment options</li>
        <li>Dedicated support and educational resources</li>
      </ul>
    </div>
  </section>
);

export default AboutSection;
