// Updated to add domain suffix to timestamp
import { useEffect, useState } from 'react';
import { formatRelativeDate } from '@/utils/dateFormat';
import { getDomainSuffixUtil } from './VersionDisplay';

const BuildTimestamp = () => {
  const [lastModified, setLastModified] = useState<string>('');

  useEffect(() => {
    if (import.meta.env.DEV) {
      const fetchLastModified = async () => {
        try {
          const response = await fetch('/api/last-modified');
          const data = await response.json();
          const date = new Date(Number(data.timestamp));
          const { dateStr, timeStr } = formatRelativeDate(date);
          // Add domain suffix to the timestamp
          const domainSuffix = getDomainSuffixUtil();
          
          // If the date is today, only show the time (without 'Today at')
          const formattedDate = dateStr === 'Today' ? timeStr : `${dateStr} at ${timeStr}`;
          setLastModified(`Last modified: ${formattedDate}${domainSuffix}`);
        } catch (error) {
          console.error('Failed to fetch last modified time:', error);
        }
      };

      fetchLastModified();
      const interval = setInterval(fetchLastModified, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  if (!import.meta.env.DEV || !lastModified) return null;

  return (
    <div className="text-xs text-gray-400 text-center -mt-9 mb-8 font-light">
      {lastModified}
    </div>
  );
};

export default BuildTimestamp;
