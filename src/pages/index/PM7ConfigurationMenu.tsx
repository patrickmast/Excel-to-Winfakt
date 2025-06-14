import { PM7Menu, PM7MenuSeparator } from 'pm7-ui-style-guide';
import { useTranslation } from 'react-i18next';
import { Plus, Save, Download, Trash2, Info, FileText, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import DocumentationDialog from '@/components/dialogs/DocumentationDialog';

interface PM7ConfigurationMenuProps {
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
  onDelete: () => void;
  onInfo: () => void;
  onShowLog: () => void;
  isSaving: boolean;
}

const PM7ConfigurationMenu = ({ 
  onNew, 
  onSave, 
  onLoad, 
  onDelete, 
  onInfo, 
  onShowLog, 
  isSaving 
}: PM7ConfigurationMenuProps) => {
  const { t } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showDocumentation, setShowDocumentation] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const menuItems = [
    {
      id: 'new',
      label: t('menu.new'),
      onClick: onNew,
      icon: <Plus className="h-4 w-4" />
    },
    {
      id: 'save',
      label: t('menu.save'),
      onClick: onSave,
      disabled: isSaving,
      icon: <Save className="h-4 w-4" />
    },
    {
      id: 'load',
      label: t('menu.load'),
      onClick: onLoad,
      icon: <Download className="h-4 w-4" />
    },
    {
      id: 'delete',
      label: t('menu.delete'),
      onClick: onDelete,
      icon: <Trash2 className="h-4 w-4" />
    },
    { id: 'sep1', type: 'separator' },
    {
      id: 'info',
      label: t('menu.info'),
      onClick: onInfo,
      icon: <Info className="h-4 w-4" />
    },
    { id: 'sep3', type: 'separator' },
    {
      id: 'documentation',
      label: 'Documentatie',
      onClick: () => setShowDocumentation(true),
      icon: <BookOpen className="h-4 w-4" />
    },
    { id: 'sep4', type: 'separator' },
    {
      id: 'exportLog',
      label: t('menu.exportLog'),
      onClick: onShowLog,
      icon: <FileText className="h-4 w-4" />
    }
  ];

  return (
    <>
      <PM7Menu 
        menuItems={menuItems}
        menuAlignment="end"
        theme={theme}
        menuTriggerBordered={true}
        menuBackgroundColor="white"
        menuTriggerBackgroundColor="white"
      />
      <DocumentationDialog 
        open={showDocumentation} 
        onOpenChange={setShowDocumentation} 
      />
    </>
  );
};

export default PM7ConfigurationMenu;