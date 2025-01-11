import React, { useState, useEffect } from 'react';

// These would be set during build time through environment variables
const DEPLOYMENT_TIMESTAMP = import.meta.env.VITE_DEPLOYMENT_TIMESTAMP || 1704063600000; // fallback to Jan 1, 2025

const VersionDisplay = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showTooltip) {
      timeoutId = setTimeout(() => setShowTooltip(false), 4000);
    }
    return () => timeoutId && clearTimeout(timeoutId);
  }, [showTooltip]);

  const getVersionNumber = () => {
    const REFERENCE_TIMESTAMP = 1704063600; // Jan 1, 2025 00:00:00 UTC
    const secondsSinceReference = Math.floor(Number(DEPLOYMENT_TIMESTAMP) / 1000) - REFERENCE_TIMESTAMP;
    const versionNumber = secondsSinceReference - 31560000;

    if (versionNumber < 0) {
      return "unknown";
    }

    return versionNumber.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1.');
  };

  const formatDate = () => {
    const date = new Date(Number(DEPLOYMENT_TIMESTAMP));

    if (date.getTime() === 1704063600000) {
      return { dateStr: "Deployment date unknown", timeStr: "" };
    }

    const formattedDate = date.toLocaleString('en-GB', {
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
    return { dateStr: `Deployed on ${formattedDate}`, timeStr };
  };

  return (
    <span className="relative">
      <span
        className="cursor-pointer"
        onClick={() => setShowTooltip(!showTooltip)}
      >
        Version {getVersionNumber()}
      </span>
      {showTooltip && (
        <span className="absolute bottom-full left-0 mb-2 px-2 py-1 bg-gray-800 text-white rounded shadow-lg whitespace-nowrap">
          {formatDate().dateStr}{formatDate().timeStr ? ` at ${formatDate().timeStr}` : ''}
        </span>
      )}
    </span>
  );
};

export default VersionDisplay;