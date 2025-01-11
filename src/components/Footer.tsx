import React from 'react';

const Footer = () => {
  const formatDate = () => {
    return new Date().toLocaleString('nl-BE', {
      timeZone: 'Europe/Brussels',
      hour12: false,
    });
  };


const getVersionNumber = () => {
  const referenceTimestamp = 1735553600; // 2024-12-30T10:13:20.000Z
  const seconds = Math.floor((Date.now() / 1000) - referenceTimestamp);
  return seconds.toString().replace(/(\d)(?=(\d{3})+$)/g, '$1.');
};

  return (
    <footer className="mt-8 py-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center text-xs text-gray-300">
          <span>Version {getVersionNumber()}</span>
          <span>Deployed at {formatDate()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;