import HandwritingCard from '@/components/HandwritingCard';

interface BrandLogoProps {
  href?: string;
  className?: string;
}

export default function BrandLogo({ href = '/', className = '' }: BrandLogoProps) {
  return <HandwritingCard href={href} className={className} />;
}

