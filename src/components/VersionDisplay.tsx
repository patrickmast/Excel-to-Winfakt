import { useEffect, useState } from 'react';
import { VanillaHoverCard, VanillaHoverCardTrigger, VanillaHoverCardContent } from './vanilla/react/VanillaHoverCard';

const DEPLOYMENT_TIMESTAMP = import.meta.env.VITE_DEPLOYMENT_TIMESTAMP || '1704063600000';

const VersionDisplay = () => {
  const [lastModified, setLastModified] = useState<string>(DEPLOYMENT_TIMESTAMP);

  useEffect(() => {
    if (import.meta.env.DEV) {
      const fetchLastModified = async () => {
        try {
          const response = await fetch('/api/last-modified');
          const data = await response.json();
          setLastModified(data.timestamp.toString());
        } catch (error) {
          console.error('Failed to fetch last modified time:', error);
        }
      };

      fetchLastModified();
      const interval = setInterval(fetchLastModified, 5000); // Update every 5 seconds in dev mode
      return () => clearInterval(interval);
    }
  }, []);

  const getVersionNumber = () => {
    const REFERENCE_TIMESTAMP = 1704063600; // Jan 1, 2025 00:00:00 UTC
    const secondsSinceReference = Math.floor(Number(lastModified) / 1000) - REFERENCE_TIMESTAMP;
    const versionNumber = secondsSinceReference - 31560000;

    if (versionNumber < 0) {
      return "unknown";
    }

    return versionNumber.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1.');
  };

  const formatDate = () => {
    const date = new Date(Number(lastModified));

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
    return { dateStr: import.meta.env.DEV ? `Last modified on ${formattedDate}` : `Deployed on ${formattedDate}`, timeStr };
  };

  return (
    <VanillaHoverCard>
      <VanillaHoverCardTrigger>
        <span className="cursor-pointer">
          {import.meta.env.DEV 
            ? `Latest Build: ${new Date(Number(lastModified)).toLocaleString('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Europe/Brussels',
                hour12: false,
              })}`
            : `Version ${getVersionNumber()}`
          }
        </span>
      </VanillaHoverCardTrigger>
      <VanillaHoverCardContent>
        <span className="whitespace-nowrap">
          {formatDate().dateStr}{formatDate().timeStr ? ` at ${formatDate().timeStr}` : ''}
        </span>
      </VanillaHoverCardContent>
    </VanillaHoverCard>
  );
};

export default VersionDisplay;