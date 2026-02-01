import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-bg-card rounded-2xl p-4 border border-white/5 ${className}`}>
      {children}
    </div>
  );
}
