import React, { useRef, useEffect } from 'react';
import { Menu } from '../Menu';
import '@/components/vanilla/Menu.css';
import '@/components/vanilla/Button.css';

type MenuItem = {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
} | 'separator';

interface MenuProps {
  items: MenuItem[];
  children?: React.ReactNode;
  align?: 'start' | 'end';
  className?: string;
  onChange?: (value: string) => void;
  isConfigMenu?: boolean;
}

export const VanillaMenu = React.forwardRef<HTMLDivElement, MenuProps>(
  ({ items, children, align = 'end', className = '', onChange, isConfigMenu = false }, ref) => {
    const menuRef = useRef<Menu | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!menuRef.current && contentRef.current) {
        menuRef.current = new Menu(contentRef.current, {
          align,
          onChange
        });
      }

      return () => {
        if (menuRef.current) {
          menuRef.current.destroy();
          menuRef.current = null;
        }
      };
    }, [align, onChange]);

    return (
      <div ref={contentRef} className={className} style={{ position: 'relative' }}>
        <button className={`button ${isConfigMenu ? 'button--config-menu' : 'button--outline button--menu'}`} data-component="button" type="button">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {children}
            {!isConfigMenu && (
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor"/>
              </svg>
            )}
          </span>
        </button>
        <div className="menu">
          {items.map((item, index) => (
            item === 'separator' ? (
              <div key={`separator-${index}`} className="menu__separator" />
            ) : (
              <button
                key={index}
                className="menu__item"
                onClick={item.onClick}
                type="button"
                disabled={item.disabled}
              >
                {item.icon && <span className="menu__item-icon">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            )
          ))}
        </div>
      </div>
    );
  }
);