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
      <span className="text-sm">{columnName}</span>
      {previewValue && (
        <span className="text-xs text-gray-500 block truncate mt-1">
          {previewValue}
        </span>
      )}
    </div>
  );
};

export default ColumnPreview;