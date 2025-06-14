// Updated to add internationalization (i18n) support with language switcher
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Preview from './pages/Preview';
import Documentation from './pages/Documentation';
import { useTranslation } from 'react-i18next';
import i18n, { changeLanguage } from './i18n';
import { useEffect } from 'react';
import { parseUrlParams } from './utils/urlParams';
import { ConfigurationProvider } from './contexts/ConfigurationContext';

// Language switcher has been moved to the Info dialog

const App = () => {
  // Initialize language from localStorage or browser settings
  useEffect(() => {
    // Get language from localStorage
    const savedLng = localStorage.getItem('i18nextLng');
    
    // If we have a saved language preference, use it
    if (savedLng) {
      changeLanguage(savedLng);
    } else {
      // Otherwise, set default language to English and save it
      changeLanguage('en');
    }
    
    // Force initial render with correct language
    document.documentElement.lang = i18n.language;
  }, []);

  // Parse URL parameters on app start
  useEffect(() => {
    const urlParams = parseUrlParams();
    
    // TODO: Load configuration if config parameter is present
    if (urlParams.config) {
      // Will load configuration for the specified dossier
    }
  }, []);
  
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ConfigurationProvider>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/documentation" element={<Documentation />} />
        </Routes>
      </ConfigurationProvider>
    </Router>
  );
};

export default App;