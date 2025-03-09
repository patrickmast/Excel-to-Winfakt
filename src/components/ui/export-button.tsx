import { Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ExportButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

const Star = ({ index }: { index: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" xmlSpace="preserve" version="1.1" style={{shapeRendering: 'geometricPrecision', textRendering: 'geometricPrecision', imageRendering: 'auto', fillRule: 'evenodd', clipRule: 'evenodd'}} viewBox="0 0 784.11 815.53" xmlnsXlink="http://www.w3.org/1999/xlink">
    <defs>
      <linearGradient id={`starGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#2663EC' }} />
        <stop offset="100%" style={{ stopColor: '#7C3AED' }} />
      </linearGradient>
    </defs>
    <g id="Layer_x0020_1">
      <metadata id="CorelCorpID_0Corel-Layer" />
      <path fill={`url(#starGradient${index})`} d="M392.05 0c-20.9,210.08 -184.06,378.41 -392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93,-210.06 184.09,-378.37 392.05,-407.74 -207.98,-29.38 -371.16,-197.69 -392.06,-407.78z" />
    </g>
  </svg>
);

const ExportButton = ({ className, children, disabled, ...props }: ExportButtonProps) => {
  const { t } = useTranslation();
  return (
    <button
      className={cn(
        "group relative px-3 py-2 bg-[#2663EC] text-white text-sm font-medium border border-[#2663EC] rounded-md transition-all duration-300 ease-in-out hover:bg-transparent hover:text-[#2663EC] hover:shadow-[0_0_25px_rgba(38,99,236,0.55)]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#2663EC] disabled:hover:text-white disabled:hover:shadow-none",
        className
      )}
      disabled={disabled}
      {...props}
    >
      <span className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        {t('columnMapper.exportCSV')}
      </span>
      {!disabled && [...Array(6)].map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute w-[25px] h-auto z-[-5] transition-all duration-300 ease-in-out",
            "group-hover:z-[2] group-hover:drop-shadow-[0_0_10px_#fffdef]",
            {
              "top-[20%] left-[20%] w-[25px] group-hover:top-[-80%] group-hover:left-[-30%]": i === 0,
              "top-[45%] left-[45%] w-[15px] group-hover:top-[-25%] group-hover:left-[10%]": i === 1,
              "top-[40%] left-[40%] w-[5px] group-hover:top-[55%] group-hover:left-[25%]": i === 2,
              "top-[20%] left-[40%] w-[8px] group-hover:top-[30%] group-hover:left-[80%]": i === 3,
              "top-[25%] left-[45%] w-[15px] group-hover:top-[25%] group-hover:left-[115%]": i === 4,
              "top-[5%] left-[50%] w-[5px] group-hover:top-[5%] group-hover:left-[60%]": i === 5,
            }
          )}
        >
          <Star index={i} />
        </div>
      ))}
    </button>
  );
};

export { ExportButton };