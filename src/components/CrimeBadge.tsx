import { CrimeCategory, CRIME_LABELS } from '@/types/crime';
import { 
  Monitor, 
  Sword, 
  DollarSign, 
  Package, 
  MessageSquareWarning, 
  HelpCircle,
  LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CrimeBadgeProps {
  category: CrimeCategory;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const categoryIcons: Record<CrimeCategory, LucideIcon> = {
  CYBER_CRIME: Monitor,
  VIOLENCE: Sword,
  FRAUD: DollarSign,
  THEFT: Package,
  HARASSMENT: MessageSquareWarning,
  OTHER: HelpCircle
};

const categoryClasses: Record<CrimeCategory, string> = {
  CYBER_CRIME: 'crime-cyber',
  VIOLENCE: 'crime-violence',
  FRAUD: 'crime-fraud',
  THEFT: 'crime-theft',
  HARASSMENT: 'crime-harassment',
  OTHER: 'crime-other'
};

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-1.5',
  lg: 'text-base px-4 py-2'
};

const iconSizes = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5'
};

export function CrimeBadge({ 
  category, 
  size = 'md', 
  showIcon = true,
  className 
}: CrimeBadgeProps) {
  const Icon = categoryIcons[category];
  
  return (
    <span 
      className={cn(
        'crime-badge inline-flex items-center gap-1.5 font-semibold',
        categoryClasses[category],
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{CRIME_LABELS[category]}</span>
    </span>
  );
}

export function getCrimeIcon(category: CrimeCategory): LucideIcon {
  return categoryIcons[category];
}
