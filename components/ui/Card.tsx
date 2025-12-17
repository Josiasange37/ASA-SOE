import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, subtitle }) => {
  return (
    <div className={`bg-surface border border-white/5 rounded-xl p-6 shadow-sm ${className}`}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-white tracking-tight">{title}</h3>}
          {subtitle && <p className="text-sm text-secondary">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
