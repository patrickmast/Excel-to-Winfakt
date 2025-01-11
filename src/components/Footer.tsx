import React from 'react';
import VersionDisplay from './VersionDisplay';

const Footer = () => {
  return (
    <footer className="mt-8 py-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center text-xs text-gray-300">
          <VersionDisplay />
        </div>
      </div>
    </footer>
  );
};

export default Footer;