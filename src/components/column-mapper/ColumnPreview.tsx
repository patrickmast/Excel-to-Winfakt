// Updated to add info icon to source column cards that displays the first 5 rows of data for the selected column
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Settings, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useTranslation } from 'react-i18next';

interface ColumnPreviewProps {
  columnName: string;
  originalColumnName?: string;
  previewValue?: string | null;
  isSelected?: boolean;
  onClick?: () => void;
  showSettings?: boolean;
  showInfo?: boolean;
  className?: string;
  showPreview?: boolean;
  sourceData?: any[];
}

const ColumnPreview: React.FC<ColumnPreviewProps> = ({
  columnName,
  originalColumnName,
  previewValue,
  isSelected,
  onClick,
  showSettings = false,
  showInfo = false,
  className,
  showPreview = true,
  sourceData = []
}) => {
  // Force showInfo to true if we have sourceData and originalColumnName
  // Add more debug information to understand why the icon isn't showing
  console.log('ColumnPreview props:', { showInfo, sourceDataLength: sourceData?.length, hasOriginalName: !!originalColumnName });
  
  // Simplify the condition - just check if showInfo is true
  const shouldShowInfo = showInfo;
  
  // Debug: Log the source data when component mounts
  useEffect(() => {
    if (showInfo && originalColumnName) {
      console.log('ColumnPreview for:', originalColumnName);
      console.log('showInfo:', showInfo);
      console.log('sourceData length:', sourceData?.length || 0);
      console.log('First row of sourceData:', sourceData?.[0]);
    }
  }, [showInfo, originalColumnName, sourceData]);
  const [showDataPreview, setShowDataPreview] = useState(false);
  const { t } = useTranslation();

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDataPreview(true);
    console.log('Info icon clicked for column:', columnName);
  };

  // Get the first 5 rows of data for this column
  const getColumnData = () => {
    if (!originalColumnName || !sourceData || sourceData.length === 0) {
      return [];
    }
    
    return sourceData.slice(0, 5).map(row => ({
      rowIndex: sourceData.indexOf(row) + 1,
      value: row[originalColumnName] !== undefined ? String(row[originalColumnName]) : ''
    }));
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 rounded-md cursor-pointer transition-colors relative h-[48px]",
        isSelected || showSettings
          ? 'bg-[#F0FEF5] border border-[#BBF7D0]'
          : 'bg-[#F9FAFB] hover:bg-[#F0FFF6] hover:border-[#BBF7D0] border border-[#E5E7EB]',
        className
      )}
    >
      <div className="flex justify-between items-center w-full" style={{height: '24px'}}>
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="text-sm truncate">{columnName}</span>
          {previewValue && showPreview && (
            <span className={cn("text-xs text-gray-500 truncate max-w-[50%]", showSettings ? "ml-2 mr-1" : "ml-2")}>
              {previewValue}
            </span>
          )}
        </div>
        <div className="flex items-center">
          {shouldShowInfo && (
            <button 
              className="p-1 rounded-full focus:outline-none" 
              onClick={handleInfoClick}
              title={t('columnMapper.dataPreview')}
              aria-label={t('columnMapper.dataPreview')}
            >
              <Info className="h-4 w-4 text-gray-300 hover:text-gray-700 flex-shrink-0" />
            </button>
          )}
          {showSettings && (
            <Settings className="h-4 w-4 text-gray-500 flex-shrink-0" />
          )}
        </div>
      </div>
      
      {/* Column Data Preview Dialog */}
      {showDataPreview && (
        <Dialog open={showDataPreview} onOpenChange={setShowDataPreview}>
          <DialogContent className="min-w-[500px] max-w-md border-0 overflow-hidden p-0">
            <DialogHeader className="bg-slate-700 p-5 rounded-t-lg">
              <DialogTitle className="text-white m-0 text-base">{t('columnMapper.dataPreview')}: {columnName}</DialogTitle>
            </DialogHeader>
            <div className="py-8 px-6">
              <p className="text-sm text-slate-500 mb-4">{t('columnMapper.firstFiveRows')}</p>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">{t('columnMapper.row')}</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-slate-600">{t('columnMapper.value')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getColumnData().map((row) => (
                      <tr key={row.rowIndex} className="border-t">
                        <td className="px-4 py-2 text-sm text-slate-600">{row.rowIndex}</td>
                        <td className="px-4 py-2 text-sm text-slate-700 break-all">{row.value}</td>
                      </tr>
                    ))}
                    {getColumnData().length === 0 && (
                      <tr>
                        <td colSpan={2} className="px-4 py-2 text-sm text-center text-slate-500">{t('columnMapper.noDataAvailable')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <DialogFooter className="mt-6 gap-2">
                <button 
                  onClick={() => setShowDataPreview(false)}
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {t('dialogs.close')}
                </button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ColumnPreview;