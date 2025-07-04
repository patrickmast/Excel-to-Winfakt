import { PM7Menu, PM7MenuSeparator } from 'pm7-ui-style-guide';
import { useTranslation } from 'react-i18next';
import { Plus, Save, Download, Trash2, Info, FileText, BookOpen, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import DocumentationDialog from '@/components/dialogs/DocumentationDialog';
import { WhatsNewDialog } from '@/components/column-mapper/WhatsNewDialog';

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
  const [showWhatsNew, setShowWhatsNew] = useState(false);

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
      id: 'whatsNew',
      label: "What's New",
      onClick: () => setShowWhatsNew(true),
      icon: <Sparkles className="h-4 w-4" />
    },
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
        menuTriggerBackground={true}
        menuTriggerBackgroundColor="#FFFFFF"
        menuTriggerBackgroundColorDark="#FFFFFF"
        menuTriggerBorder={true}
        menuTriggerBorderColor="#d1d5db"
        menuTriggerBorderColorDark="#d1d5db"
        menuTriggerIconColor="#000000"
        menuTriggerIconColorDark="#000000"
        menuTriggerOnHover={false}
        menuBackgroundColor="white"
      />
      <DocumentationDialog 
        open={showDocumentation} 
        onOpenChange={setShowDocumentation} 
      />
      <WhatsNewDialog 
        isOpen={showWhatsNew} 
        onOpenChange={setShowWhatsNew} 
      />
    </>
  );
};

export default PM7ConfigurationMenu;