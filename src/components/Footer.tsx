import React from 'react';

const Footer = () => {
  const formatDate = () => {
    return new Date().toLocaleString('nl-BE', {
      timeZone: 'Europe/Brussels',
      hour12: false,
    });
  };

  const getBase36Timestamp = () => {
    return '1.' + Math.floor(Date.now() / 1000).toString(36).slice(-5).toLowerCase();
  };

  return (
    <footer className="mt-8 py-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center text-xs text-gray-400">
          <span>Version {getBase36Timestamp()}</span>
          <span>Deployed at {formatDate()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;