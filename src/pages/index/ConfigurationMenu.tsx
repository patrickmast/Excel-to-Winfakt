import { useEffect, useRef } from 'react';
import '@/components/vanilla/Button.css';
import '@/components/vanilla/DropdownMenu.css';

interface ConfigurationMenuProps {
  onSaveNew: () => void;
  onSave: () => void;
  onInfo: () => void;
  isSaving: boolean;
}

const ConfigurationMenu = ({ onSaveNew, onSave, onInfo, isSaving }: ConfigurationMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize dropdown menu
    if (typeof window !== 'undefined') {
      import('@/components/vanilla/DropdownMenu.js').then(({ default: DropdownMenu }) => {
        if (menuRef.current) {
          new DropdownMenu(menuRef.current);
        }
      });
    }
  }, []);

  return (
    <div ref={menuRef} data-component="dropdown" className="dropdown">
      <button
        data-component="button"
        data-dropdown-trigger
        className="button button--outline button--menu"
        aria-label="Open menu"
        type="button"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
        Menu
      </button>
      <div className="dropdown__menu">
        <button
          className="dropdown__item"
          onClick={onSaveNew}
          disabled={isSaving}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Save as New</span>
        </button>
        <button
          className="dropdown__item"
          onClick={onSave}
          disabled={isSaving}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          <span>Save</span>
        </button>
        <div className="dropdown__separator" />
        <button
          className="dropdown__item"
          onClick={onInfo}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Info</span>
        </button>
      </div>
    </div>
  );
};

export default ConfigurationMenu;