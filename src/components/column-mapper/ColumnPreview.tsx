import React from 'react';
import { cn } from '@/lib/utils';
import { Settings } from 'lucide-react';

interface ColumnPreviewProps {
  columnName: string;
  originalColumnName?: string;
  previewValue?: string | null;
  isSelected?: boolean;
  onClick?: () => void;
  showSettings?: boolean;
  className?: string;
  showPreview?: boolean;
}

const ColumnPreview: React.FC<ColumnPreviewProps> = ({
  columnName,
  originalColumnName,
  previewValue,
  isSelected,
  onClick,
  showSettings = false,
  className,
  showPreview = true
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 rounded-md cursor-pointer transition-colors relative",
        isSelected || showSettings
          ? 'bg-[#F0FEF5] border border-[#BBF7D0]'
          : 'bg-[#F9FAFB] hover:bg-[#F0FFF6] hover:border-[#BBF7D0] border border-[#E5E7EB]',
        className
      )}
    >
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center justify-between flex-1 min-w-0">
          <span className="text-sm truncate">{columnName}</span>
          {previewValue && showPreview && (
            <span className="text-xs text-gray-500 ml-2 truncate max-w-[50%]">
              {previewValue}
            </span>
          )}
        </div>
        {showSettings && (
          <Settings className="h-4 w-4 text-gray-500 ml-2 flex-shrink-0" />
        )}
      </div>
    </div>
  );
};

export default ColumnPreview;