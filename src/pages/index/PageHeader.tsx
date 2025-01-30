import ConfigurationMenu from './ConfigurationMenu';
import BuildTimestamp from '@/components/BuildTimestamp';
import { useSearchParams } from 'react-router-dom';

interface PageHeaderProps {
  onSaveNew: () => void;
  onSave: () => void;
  onInfo: () => void;
  isSaving: boolean;
}

const PageHeader = ({ onSaveNew, onSave, onInfo, isSaving }: PageHeaderProps) => {
  const [searchParams] = useSearchParams();
  const showH1 = searchParams.get('ShowH1')?.toLowerCase() === 'yes';

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-8">
        <div className="w-32"> {/* Spacer to balance the menu width */}</div>
        {showH1 && (
          <h1 className="flex-1 text-3xl font-extrabold text-center sm:text-2xl md:text-3xl lg:text-4xl relative">
            <span className="absolute inset-0 bg-[linear-gradient(to_right,#7e22ce,#ec4899,#f472b6,#fbbf24,#ef4444,#7e22ce,#ec4899,#f472b6)] animate-gradient-cycle bg-[length:200%_100%] bg-clip-text text-transparent">
              CSV for Winfakt imports
            </span>
            {/* This span is for maintaining layout since the animated span is absolute positioned */}
            <span className="invisible">
              CSV for Winfakt imports
            </span>
          </h1>
        )}
        {!showH1 && <div className="flex-1" />}
        <div className="w-32 flex justify-end"> {/* Added flex justify-end */}
          <ConfigurationMenu
            onSaveNew={onSaveNew}
            onSave={onSave}
            onInfo={onInfo}
            isSaving={isSaving}
          />
        </div>
      </div>
      <BuildTimestamp />
    </div>
  );
};

export default PageHeader;