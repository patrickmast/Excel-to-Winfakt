import PM7ConfigurationMenu from './PM7ConfigurationMenu';
import BuildTimestamp from '@/components/BuildTimestamp';
import ConfigurationIndicator from '@/components/ConfigurationIndicator';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  onNew: () => void;
  onSave: () => void;
  onLoad: () => void;
  onDelete: () => void;
  onInfo: () => void;
  onClearSettings: () => void;
  onShowLog: () => void;
  isSaving: boolean;
  hasUnsavedChanges?: boolean;
  isLoadingConfig?: boolean;
}

const PageHeader = ({ onNew, onSave, onLoad, onDelete, onInfo, onClearSettings, onShowLog, isSaving, hasUnsavedChanges = false, isLoadingConfig = false }: PageHeaderProps) => {
  const [searchParams] = useSearchParams();
  const h1Param = searchParams.get('ShowH1');
  const showH1 = !h1Param || h1Param.toLowerCase() === 'yes';
  const menuParam = searchParams.get('ShowMenu');
  const showMenu = !menuParam || menuParam.toLowerCase() === 'yes';
  const { t } = useTranslation();

  return (
    <div className="flex flex-col">
      <div className="flex items-center mb-0 justify-between">
        <div className="w-32"> {/* Left spacer */}</div>
        {showH1 && (
          <h1 className="flex-1 text-2xl font-extrabold text-center md:text-3xl lg:text-4xl relative">
            <span className="absolute inset-0 bg-[linear-gradient(to_right,#7e22ce,#ec4899,#f472b6,#fbbf24,#ef4444,#7e22ce,#ec4899,#f472b6)] animate-gradient-cycle bg-[length:200%_100%] bg-clip-text text-transparent">
              {t('header.title')}
            </span>
            {/* This span is for maintaining layout since the animated span is absolute positioned */}
            <span className="invisible">
              {t('header.title')}
            </span>
          </h1>
        )}
        <div className="w-32 flex justify-end">
          {showMenu && (
            <PM7ConfigurationMenu
              onNew={onNew}
              onSave={onSave}
              onLoad={onLoad}
              onDelete={onDelete}
              onInfo={onInfo}
              onClearSettings={onClearSettings}
              onShowLog={onShowLog}
              isSaving={isSaving}
            />
          )}
        </div>
      </div>
      <ConfigurationIndicator className="mt-0 md:mt-1 lg:mt-2 mb-6" onSaveConfiguration={onSave} hasUnsavedChanges={hasUnsavedChanges} isLoadingConfig={isLoadingConfig} />
    </div>
  );
};

export default PageHeader;