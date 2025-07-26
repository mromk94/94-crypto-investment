import React from 'react';
import AnimatedWords from './AnimatedWords';
// DEBUG: Inline style blob test

const HomeSection = () => (
  <section className="relative flex flex-col items-center justify-center min-h-screen pt-32 pb-16 text-center bg-primary">
    {/* Animated Background Blobs */}
    {/* Animated gradient background */}
    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-ton/30 via-sui/20 to-accent/10 z-0"></div>
    {/* Animated blobs with tuned blur and opacity */}
    <div className="absolute top-[-10%] left-[10%] w-72 h-72 bg-accent opacity-50 rounded-full filter blur-lg animate-blob1 z-10"></div>
    <div className="absolute top-[40%] left-[60%] w-96 h-96 bg-sui opacity-40 rounded-full filter blur-lg animate-blob2 z-10"></div>
    <div className="absolute bottom-[-10%] right-[10%] w-80 h-80 bg-ton opacity-45 rounded-full filter blur-lg animate-blob3 z-10"></div>
    <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
      AI-Powered <AnimatedWords />
      <br />
      Platform for <span className="text-ton">Ton</span> & <span className="text-sui">Sui</span>
    </h1>
    <p className="max-w-xl mx-auto text-lg md:text-2xl text-gray-300 mb-8">
      Unlock smarter trading, automated analysis, and secure investing with cutting-edge AI.
    </p>
    <a href="#plans" className="inline-block px-8 py-4 rounded-lg bg-accent text-primary font-bold text-xl shadow-lg hover:bg-sui transition">
      Get Started
    </a>
  </section>
);

export default HomeSection;
