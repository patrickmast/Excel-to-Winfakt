import { useEffect, useState } from 'react';
import { VanillaHoverCard, VanillaHoverCardTrigger, VanillaHoverCardContent } from './vanilla/react/VanillaHoverCard';
import { formatRelativeDate } from '@/utils/dateFormat';

const DEPLOYMENT_TIMESTAMP = import.meta.env.VITE_DEPLOYMENT_TIMESTAMP || '1704063600000';

const VersionDisplay = () => {
  const [lastModified, setLastModified] = useState<string>(DEPLOYMENT_TIMESTAMP);
  const [tooltipText, setTooltipText] = useState<string>('');

  useEffect(() => {
    if (import.meta.env.DEV) {
      const fetchLastModified = async () => {
        try {
          const response = await fetch('/api/last-modified');
          const data = await response.json();
          const date = new Date(Number(data.timestamp));
          const { dateStr, timeStr } = formatRelativeDate(date);
          setLastModified(timeStr);
          setTooltipText(`${dateStr} at ${timeStr}`);
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

  if (!import.meta.env.DEV) {
    return (
      <VanillaHoverCard>
        <VanillaHoverCardTrigger>
          <span className="cursor-pointer">
            Version {getVersionNumber()}
          </span>
        </VanillaHoverCardTrigger>
        <VanillaHoverCardContent>
          <span className="whitespace-nowrap">
            Deployed on {formatRelativeDate(new Date(Number(lastModified))).dateStr} at {formatRelativeDate(new Date(Number(lastModified))).timeStr}
          </span>
        </VanillaHoverCardContent>
      </VanillaHoverCard>
    );
  }

  return (
    <VanillaHoverCard>
      <VanillaHoverCardTrigger>
        <span className="cursor-pointer" title={tooltipText}>
          Latest Build: {lastModified}
        </span>
      </VanillaHoverCardTrigger>
      <VanillaHoverCardContent>
        <span className="whitespace-nowrap">
          {tooltipText}
        </span>
      </VanillaHoverCardContent>
    </VanillaHoverCard>
  );
};

export default VersionDisplay;