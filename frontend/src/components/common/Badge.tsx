import React from 'react';
import { AttendanceStatus } from '../../types';

interface BadgeProps {
  status?: AttendanceStatus | 'active' | 'inactive';
  children?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  children,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  let styleClasses = 'bg-zinc-100 text-zinc-800 border border-zinc-200';
  let indicatorDot: React.ReactNode = null;

  switch (status) {
    case 'present':
      styleClasses = 'bg-zinc-950 text-zinc-50 border border-zinc-900 shadow-xs';
      indicatorDot = <span className="w-1.5 h-1.5 rounded-full bg-white inline-block mr-1.5" />;
      break;
    case 'absent':
      styleClasses = 'bg-zinc-100 text-zinc-600 border border-zinc-300';
      indicatorDot = <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block mr-1.5" />;
      break;
    case 'late':
      styleClasses = 'bg-zinc-200 text-zinc-900 border border-zinc-400 font-semibold';
      indicatorDot = <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 inline-block mr-1.5" />;
      break;
    case 'half-day':
      styleClasses = 'bg-white text-zinc-700 border border-dashed border-zinc-400';
      indicatorDot = <span className="w-1.5 h-1.5 rounded-full border border-zinc-600 inline-block mr-1.5" />;
      break;
    case 'active':
      styleClasses = 'bg-zinc-900 text-zinc-100 border border-zinc-800';
      indicatorDot = <span className="w-1.5 h-1.5 rounded-full bg-zinc-100 inline-block mr-1.5" />;
      break;
    case 'inactive':
      styleClasses = 'bg-zinc-100 text-zinc-500 border border-zinc-200';
      indicatorDot = <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 inline-block mr-1.5" />;
      break;
    default:
      break;
  }

  const label =
    children ||
    (status
      ? status === 'half-day'
        ? 'Half Day'
        : status.charAt(0).toUpperCase() + status.slice(1)
      : '');

  return (
    <span
      className={`inline-flex items-center rounded-md tracking-tight select-none transition-colors ${sizeClasses} ${styleClasses} ${className}`}
    >
      {indicatorDot}
      {label}
    </span>
  );
};
