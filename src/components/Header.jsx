import React from 'react';

const Header = ({ onHome, onAbout, onTrade, onPlans, onContact, onFaq, loggedIn = false }) => (
  <header className="fixed w-full z-50 bg-primary/90 backdrop-blur shadow-md">
  <nav className="container mx-auto flex flex-wrap items-center justify-between py-3 px-4 sm:px-6 overflow-x-hidden">
    <div className="text-2xl font-bold tracking-wide text-accent flex-shrink-0">
      Ton <span className="text-sui">Sui</span> Mining
    </div>
    {/* Hamburger for mobile */}
    <input type="checkbox" id="header-menu-toggle" className="peer hidden" />
    <label htmlFor="header-menu-toggle" className="sm:hidden flex flex-col justify-center items-center w-10 h-10 cursor-pointer select-none">
      <span className="block w-7 h-1 bg-accent mb-1 rounded transition-all duration-200"></span>
      <span className="block w-7 h-1 bg-accent mb-1 rounded transition-all duration-200"></span>
      <span className="block w-7 h-1 bg-accent rounded transition-all duration-200"></span>
    </label>
    <ul className="w-full sm:w-auto flex-col sm:flex-row flex sm:space-x-8 text-lg font-medium items-center bg-primary sm:bg-transparent absolute sm:static left-0 right-0 top-full sm:top-auto mt-2 sm:mt-0 shadow-lg sm:shadow-none border-t border-accent/10 sm:border-0 z-40 max-h-0 peer-checked:max-h-[500px] overflow-hidden sm:max-h-none transition-all duration-300">
      <li className="w-full sm:w-auto"><button className="w-full sm:w-auto text-left sm:text-center hover:text-accent transition px-4 py-2 sm:p-0" onClick={onHome}>Home</button></li>
      <li className="w-full sm:w-auto"><button className="w-full sm:w-auto text-left sm:text-center hover:text-accent transition px-4 py-2 sm:p-0" onClick={onAbout}>About Us</button></li>
      <li className="w-full sm:w-auto"><button className="w-full sm:w-auto text-left sm:text-center hover:text-accent transition px-4 py-2 sm:p-0" onClick={onTrade}>Trade</button></li>
      <li className="w-full sm:w-auto"><button className="w-full sm:w-auto text-left sm:text-center hover:text-accent transition px-4 py-2 sm:p-0" onClick={onPlans}>Plans</button></li>
      <li className="relative group w-full sm:w-auto">
        <button className="w-full sm:w-auto text-left sm:text-center hover:text-accent transition px-4 py-2 sm:p-0" onClick={onContact}>Contact Us ▾</button>
        <ul className="absolute right-0 mt-2 w-40 bg-primary border border-gray-800 rounded shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto z-50">
          <li>
            <button className="block w-full text-left px-4 py-2 hover:bg-gray-800 hover:text-accent transition" onClick={onFaq}>FAQ</button>
          </li>
        </ul>
      </li>
      {/* Auth links */}
      {loggedIn ? (
        <li className="w-full sm:w-auto"><a href="/dashboard" className="block w-full sm:w-auto px-4 py-2 sm:px-4 sm:py-1 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition text-center">Dashboard</a></li>
      ) : (
        <>
          <li className="w-full sm:w-auto"><a href="/login" className="block w-full sm:w-auto px-4 py-2 sm:px-4 sm:py-1 rounded hover:bg-accent/20 text-accent border border-accent transition text-center">Login</a></li>
          <li className="w-full sm:w-auto"><a href="/register" className="block w-full sm:w-auto px-4 py-2 sm:px-4 sm:py-1 rounded bg-accent text-gray-900 font-bold hover:bg-accent/90 transition text-center">Register</a></li>
        </>
      )}
    </ul>
  </nav>
</header>
);

export default Header;
