import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import 'pm7-ui-style-guide/src/components/button/pm7-button.css';

interface ExportButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const ExportButton = ({ className, children, disabled, ...props }: ExportButtonProps) => {
  const { t } = useTranslation();
  return (
    <Button
      className={className}
      disabled={disabled}
      icon={<Download />}
      effect="6stars"
      {...props}
    >
      {t('columnMapper.exportCSV')}
    </Button>
  );
};

export { ExportButton };