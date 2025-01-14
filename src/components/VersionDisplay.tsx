import { useEffect, useState } from 'react';
import { VanillaHoverCard, VanillaHoverCardTrigger, VanillaHoverCardContent } from './vanilla/react/VanillaHoverCard';

const DEPLOYMENT_TIMESTAMP = import.meta.env.VITE_DEPLOYMENT_TIMESTAMP || '1704063600000';

const VersionDisplay = () => {
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
    <VanillaHoverCard>
      <VanillaHoverCardTrigger>
        <span className="cursor-pointer">
          Version {getVersionNumber()}
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