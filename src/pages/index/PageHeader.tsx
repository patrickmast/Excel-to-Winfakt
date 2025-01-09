import ConfigurationMenu from './ConfigurationMenu';

interface PageHeaderProps {
  onSaveNew: () => void;
  onSave: () => void;
  onInfo: () => void;
  isSaving: boolean;
}

const PageHeader = ({ onSaveNew, onSave, onInfo, isSaving }: PageHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">CSV for Winfakt imports</h1>
      <ConfigurationMenu
        onSaveNew={onSaveNew}
        onSave={onSave}
        onInfo={onInfo}
        isSaving={isSaving}
      />
    </div>
  );
};

export default PageHeader;