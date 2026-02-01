import { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'pink' | 'blue' | 'cyan' | 'purple';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-bg-secondary text-text-secondary border-white/10',
    pink: 'bg-neon-pink/20 text-neon-pink border-neon-pink/30',
    blue: 'bg-neon-blue/20 text-neon-blue border-neon-blue/30',
    cyan: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30',
    purple: 'bg-neon-purple/20 text-neon-purple border-neon-purple/30',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
