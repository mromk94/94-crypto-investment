import React, { useEffect, useState } from 'react';

// Example commodities and API endpoints (replace with real API if available)
const DEFAULTS = [
  { symbol: 'GOLD', name: 'Gold', price: null, currency: 'USD' },
  { symbol: 'SILVER', name: 'Silver', price: null, currency: 'USD' },
  { symbol: 'OIL', name: 'Crude Oil', price: null, currency: 'USD' },
  { symbol: 'BTC', name: 'Bitcoin', price: null, currency: 'USD' },
  { symbol: 'ETH', name: 'Ethereum', price: null, currency: 'USD' },
];



export default function CommodityTicker() {
  const [commodities, setCommodities] = useState(DEFAULTS);
  const [dateStr, setDateStr] = useState('');
  const [ip, setIp] = useState('');

  useEffect(() => {
    // Set date string
    const now = new Date();
    setDateStr(now.toLocaleString('en-GB', { dateStyle: 'full', timeStyle: 'short' }));
    // TODO: Fetch real commodity prices from API here
    // For now, use mock data
    setCommodities([
      { symbol: 'GOLD', name: 'Gold', price: 2367.12, currency: 'USD' },
      { symbol: 'SILVER', name: 'Silver', price: 30.22, currency: 'USD' },
      { symbol: 'OIL', name: 'Crude Oil', price: 78.94, currency: 'USD' },
      { symbol: 'BTC', name: 'Bitcoin', price: 62900, currency: 'USD' },
      { symbol: 'ETH', name: 'Ethereum', price: 3420, currency: 'USD' },
    ]);
    // Fetch IP location
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => setIp(data.ip || 'Unknown IP'))
      .catch(() => setIp('Unknown IP'));
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-accent to-sui text-gray-900 font-medium shadow-lg flex flex-col md:flex-row items-center px-2 py-1 md:py-0 text-xs md:text-sm">
      <div className="flex-1 flex items-center overflow-x-auto animate-marquee whitespace-nowrap gap-8 py-1">
        {commodities.map(c => (
          <span key={c.symbol} className="mx-4 flex items-center gap-1">
            <span className="font-bold">{c.name}:</span>
            <span>{c.price ? c.price.toLocaleString() : '--'} {c.currency}</span>
          </span>
        ))}
      </div>
      <div className="flex gap-4 items-center min-w-max border-l border-accent/40 pl-4 ml-4 text-xs md:text-sm">
        <span className="font-semibold">{dateStr}</span>
        <span className="inline-flex items-center gap-1">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M12 2C7.03 2 3 6.03 3 11c0 5.25 7.2 10.65 8.09 11.27.56.41 1.26.41 1.82 0C13.8 21.65 21 16.25 21 11c0-4.97-4.03-9-9-9zm0 17.88C10.08 18.13 5 14.21 5 11c0-3.87 3.13-7 7-7s7 3.13 7 7c0 3.21-5.08 7.13-7 8.88z" fill="#0ea5e9"/><circle cx="12" cy="11" r="3" fill="#e879f9"/></svg>
          {ip}
        </span>
      </div>
    </div>
  );
}
