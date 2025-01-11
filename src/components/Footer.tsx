import React, { useState, useEffect } from 'react';

// These would be set during build time through environment variables
const DEPLOYMENT_TIMESTAMP = import.meta.env.VITE_DEPLOYMENT_TIMESTAMP || 1704063600000; // fallback to Jan 1, 2025
console.log('Deployment timestamp:', DEPLOYMENT_TIMESTAMP);

const Footer = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showTooltip) {
      timeoutId = setTimeout(() => setShowTooltip(false), 4000);
    }
    return () => timeoutId && clearTimeout(timeoutId);
  }, [showTooltip]);

  const getVersionNumber = () => {
    const referenceTimestamp = 1704063600; // 2025-01-01T00:00:00.000Z
    const seconds = Math.floor((Number(DEPLOYMENT_TIMESTAMP) / 1000) - referenceTimestamp);
    console.log('Calculating version with timestamp:', DEPLOYMENT_TIMESTAMP);
    return (1000000 + seconds - 32000000).toString().replace(/(\d)(?=(\d{3})+$)/g, '$1.');
  };

  const formatDate = () => {
    const date = new Date(Number(DEPLOYMENT_TIMESTAMP));
    const dateStr = date.toLocaleString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Europe/Brussels',
    });
    const timeStr = date.toLocaleString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Brussels',
      hour12: false,
    });
    return { dateStr, timeStr };
  };

  return (
    <footer className="mt-8 py-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center text-xs text-gray-300">
          <span className="relative">
            <span
              className="cursor-pointer"
              onClick={() => setShowTooltip(!showTooltip)}
            >
              Version {getVersionNumber()}
            </span>
            {showTooltip && (
              <span className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-800 text-white rounded shadow-lg whitespace-nowrap">
                Deployed on {formatDate().dateStr} at {formatDate().timeStr}
              </span>
            )}
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;