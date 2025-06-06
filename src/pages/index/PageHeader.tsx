import ConfigurationMenu from './ConfigurationMenu';
import BuildTimestamp from '@/components/BuildTimestamp';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  onSaveNew: () => void;
  onSave: () => void;
  onExportSettings: () => void;
  onLoadSettings: () => void;
  onInfo: () => void;
  onClearSettings: () => void;
  onShowLog: () => void;
  isSaving: boolean;
}

const PageHeader = ({ onSaveNew, onSave, onExportSettings, onLoadSettings, onInfo, onClearSettings, onShowLog, isSaving }: PageHeaderProps) => {
  const [searchParams] = useSearchParams();
  const h1Param = searchParams.get('ShowH1');
  const showH1 = !h1Param || h1Param.toLowerCase() === 'yes';
  const menuParam = searchParams.get('ShowMenu');
  const showMenu = !menuParam || menuParam.toLowerCase() === 'yes';
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-8">
        <div className="w-32"> {/* Spacer to balance the menu width */}</div>
        {showH1 && (
          <h1 className="flex-1 text-3xl font-extrabold text-center sm:text-2xl md:text-3xl lg:text-4xl relative">
            <span className="absolute inset-0 bg-[linear-gradient(to_right,#7e22ce,#ec4899,#f472b6,#fbbf24,#ef4444,#7e22ce,#ec4899,#f472b6)] animate-gradient-cycle bg-[length:200%_100%] bg-clip-text text-transparent">
              {t('header.title')}
            </span>
            {/* This span is for maintaining layout since the animated span is absolute positioned */}
            <span className="invisible">
              {t('header.title')}
            </span>
          </h1>
        )}
        {!showH1 && <div className="flex-1" />}
        <div className="w-32 flex justify-end"> {/* Added flex justify-end */}
          {showMenu && (
            <ConfigurationMenu
              onSaveNew={onSaveNew}
              onSave={onSave}
              onExportSettings={onExportSettings}
              onLoadSettings={onLoadSettings}
              onInfo={onInfo}
              onClearSettings={onClearSettings}
              onShowLog={onShowLog}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
      <BuildTimestamp />
    </div>
  );
};

export default PageHeader;