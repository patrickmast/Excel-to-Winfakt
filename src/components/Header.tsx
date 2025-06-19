import React, { useState, useRef } from 'react';
import { PM7Menu, PM7Dialog, PM7DialogContent, PM7DialogHeader, PM7DialogTitle } from 'pm7-ui-style-guide';
import { Upload, Eye } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onFileSelect: (file: File) => void;
}

export function Header({ onFileSelect }: HeaderProps) {
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewContentRef = useRef<string>('');
  const { t } = useTranslation();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handlePreviewFile = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        previewContentRef.current = e.target?.result as string;
        setShowPreview(true);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="header">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv,.xlsx,.xls"
        style={{ display: 'none' }}
      />

      <PM7Menu
        items={[
          {
            label: t('header.selectFile'),
            icon: <Upload className="h-4 w-4" />,
            onClick: handleFileSelect
          },
          {
            label: t('header.previewFile'),
            icon: <Eye className="h-4 w-4" />,
            onClick: handlePreviewFile
          }
        ]}
      >
        {t('header.sourceFile')}
      </PM7Menu>

      <PM7Dialog open={showPreview} onOpenChange={setShowPreview}>
        <PM7DialogContent>
          <PM7DialogHeader>
            <PM7DialogTitle>{t('header.filePreview')}</PM7DialogTitle>
          </PM7DialogHeader>
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            maxHeight: '60vh',
            overflow: 'auto',
            padding: '1rem',
            backgroundColor: '#f9fafb',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            lineHeight: '1.5'
          }}>
            {previewContentRef.current}
          </pre>
        </PM7DialogContent>
      </PM7Dialog>
    </header>
  );
}