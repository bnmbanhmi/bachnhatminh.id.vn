import Link from 'next/link';

interface BrandLogoProps {
  href?: string;
  className?: string;
}

export default function BrandLogo({ href = '/', className = '' }: BrandLogoProps) {
  const content = (
    <div className={`group flex flex-col items-start w-fit leading-none shrink-0 select-none py-0.5 ${className}`}>
      <span className="text-xl md:text-2xl font-bold tracking-tight text-primary font-space-grotesk group-hover:text-tertiary transition-colors">
        Bạch Nhật Minh
      </span>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
