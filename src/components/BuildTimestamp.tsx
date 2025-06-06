// Updated to add domain suffix to timestamp and i18n translations
import { useEffect, useState } from 'react';
import { formatRelativeDate } from '@/utils/dateFormat';
import { getDomainSuffixUtil } from './VersionDisplay';
import { useTranslation } from 'react-i18next';

const BuildTimestamp = () => {
  const [lastModified, setLastModified] = useState<string>('');
  // Move useTranslation hook to component level
  const { t } = useTranslation();

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
          
          // Format the date and time
          let formattedDate;
          if (dateStr === 'Today') {
            formattedDate = `${t('common.today')} ${t('common.at')} ${timeStr}`;
          } else if (dateStr === 'Yesterday') {
            formattedDate = `${t('common.yesterday')} ${t('common.at')} ${timeStr}`;
          } else {
            // For other dates, use the full date string as-is (already localized)
            formattedDate = `${dateStr} ${t('common.at')} ${timeStr}`;
          }
          setLastModified(`${t('common.lastModified')}: ${formattedDate}${domainSuffix}`);
        } catch (error) {
          // Improved error handling with more specific message
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('Failed to fetch last modified time:', { error: errorMessage });
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
