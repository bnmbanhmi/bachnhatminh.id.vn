'use client';

export interface SegmentedOption {
  key: string;
  label: React.ReactNode;
  badge?: string;
  title?: string;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  activeKey: string;
  onChange: (key: string) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean | 'mobile';
  className?: string;
  ariaLabel?: string;
}

export default function SegmentedControl({
  options,
  activeKey,
  onChange,
  size = 'md',
  fullWidth = false,
  className = '',
  ariaLabel,
}: SegmentedControlProps) {
  const isSm = size === 'sm';

  const containerWidthClass =
    fullWidth === 'mobile'
      ? 'w-full flex md:w-auto md:inline-flex'
      : fullWidth
      ? 'w-full flex'
      : 'inline-flex';

  const buttonWidthClass =
    fullWidth === 'mobile'
      ? 'flex-1 md:flex-initial text-center'
      : fullWidth
      ? 'flex-1 text-center'
      : 'text-center';

  return (
    <div
      className={`items-stretch gap-1 bg-neutral border border-secondary/60 p-1 rounded-lg ${containerWidthClass} ${className}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((opt) => {
        const isActive = opt.key === activeKey;
        return (
          <button
            key={opt.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            title={opt.title}
            onClick={() => onChange(opt.key)}
            className={`flex items-center justify-center gap-1.5 font-bold rounded-md transition-all cursor-pointer select-none ${buttonWidthClass} ${
              isSm
                ? 'px-2.5 py-1 text-xs'
                : 'px-3.5 py-1.5 text-xs md:text-sm'
            } ${
              isActive
                ? 'bg-primary text-white shadow-xs'
                : 'text-primary/80 hover:text-primary hover:bg-surface'
            }`}
          >
            <span className="leading-tight text-center flex flex-col items-center justify-center h-full">{opt.label}</span>
            {opt.badge && (
              <span
                className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-secondary/15 text-primary/80'
                }`}
              >
                {opt.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
