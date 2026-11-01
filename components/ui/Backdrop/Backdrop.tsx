import type { ReactNode, MouseEventHandler } from 'react';

interface BackdropProps {
  onClick: MouseEventHandler<HTMLDivElement>;
  className?: string;
  children?: ReactNode;
}

export function Backdrop({ onClick, className = '', children }: BackdropProps) {
  return (
    <div
      onClick={onClick}
      className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-xs ${className}`}
    >
      {children}
    </div>
  );
}
