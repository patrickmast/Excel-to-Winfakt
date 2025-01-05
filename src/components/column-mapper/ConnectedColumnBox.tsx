import React from 'react';
import { X } from 'lucide-react';

interface ConnectedColumnBoxProps {
  sourceColumn: string;
  targetColumn: string;
  onDisconnect: () => void;
  previewValue: string;
}

const ConnectedColumnBox: React.FC<ConnectedColumnBoxProps> = ({
  sourceColumn,
  targetColumn,
  onDisconnect,
  previewValue,
}) => {
  return (
    <div className="flex items-center space-x-2 mb-2">
      <div className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md p-3 relative group">
        <div className="flex justify-between items-center">
          <span className="text-sm">{sourceColumn}</span>
          <X
            className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            onClick={onDisconnect}
          />
        </div>
        {previewValue && (
          <div className="text-right text-xs text-gray-500 mt-1 truncate">
            {previewValue}
          </div>
        )}
      </div>
      <div className="flex items-center">
        <div className="w-8 h-[2px] bg-gray-300"></div>
        <div className="arrow-right"></div>
      </div>
      <div className="flex-1 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md p-3">
        <span className="text-sm">{targetColumn}</span>
      </div>
    </div>
  );
};

export default ConnectedColumnBox;