import ConfigurationMenu from './ConfigurationMenu';

interface PageHeaderProps {
  onSaveNew: () => void;
  onSave: () => void;
  onInfo: () => void;
  isSaving: boolean;
}

const PageHeader = ({ onSaveNew, onSave, onInfo, isSaving }: PageHeaderProps) => {
  return (
    <div className="flex items-center mb-8">
      <div className="w-32"> {/* Spacer to balance the menu width */}</div>
      <h1 className="flex-1 text-3xl font-bold text-gray-900 text-center sm:text-2xl md:text-3xl lg:text-4xl">CSV for Winfakt imports</h1>
      <div className="w-32 flex justify-end"> {/* Added flex justify-end */}
        <ConfigurationMenu
          onSaveNew={onSaveNew}
          onSave={onSave}
          onInfo={onInfo}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
};

export default PageHeader;