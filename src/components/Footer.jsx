import React from 'react';

const Footer = () => (
  <footer className="py-10 px-4 bg-gray-900 border-t border-gray-800 text-center">
    <div className="container mx-auto">
      <div className="mb-4 text-accent font-bold text-2xl">
        Ton <span className="text-sui">Sui</span> Mining
      </div>
      <div className="mb-2 text-gray-400">
        &copy; {new Date().getFullYear()} Ton Sui Mining. All rights reserved.
      </div>
      <div className="text-gray-500 text-sm">
        This platform does not provide financial advice. Investing in cryptocurrencies involves risk.
      </div>
    </div>
  </footer>
);

export default Footer;
