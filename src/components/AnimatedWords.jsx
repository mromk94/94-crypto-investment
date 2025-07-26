import React, { useEffect, useState } from 'react';

const phrases = [
  'Crypto Investment',
  'Trading',
  'Analysis',
  'Forecast',
  'AI Insights',
  'Portfolio Growth',
];

const AnimatedWords = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setFade(false), 1700);
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length);
        setFade(true);
      }, 300);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <span
      className={`transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'} text-accent`}
      aria-live="polite"
    >
      {phrases[index]}
    </span>
  );
};

export default AnimatedWords;
