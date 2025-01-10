import React from 'react';

const Footer = () => {
  return (
    <footer className="mt-8 py-4 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <span>Version 1.0.0</span>
          <span>Deployed at: {new Date().toLocaleString()}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;