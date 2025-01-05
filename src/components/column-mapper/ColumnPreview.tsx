import React from 'react';
import { cn } from '@/lib/utils';

interface ColumnPreviewProps {
  columnName: string;
  previewValue?: string | null;
  isSelected?: boolean;
  onClick?: () => void;
}

const ColumnPreview: React.FC<ColumnPreviewProps> = ({
  columnName,
  previewValue,
  isSelected,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "p-3 rounded-md cursor-pointer transition-colors relative",
        isSelected
          ? 'bg-[#F0FEF5] border border-[#BBF7D0]'
          : 'bg-[#F9FAFB] hover:bg-white hover:border-[#BBF7D0] border border-[#E5E7EB]'
      )}
    >
      <div className="flex justify-between items-center">
        <span className="text-sm">{columnName}</span>
        {previewValue && (
          <span className="text-xs text-gray-500 ml-2 truncate">
            {previewValue}
          </span>
        )}
      </div>
    </div>
  );
};

export default ColumnPreview;