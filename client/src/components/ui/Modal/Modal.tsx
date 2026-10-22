import type { ReactNode } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useThemeContext } from '../../../context/ThemeContext';

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
  maxWidth?: string;
}

export function Modal({ onClose, children, maxWidth = 'max-w-md' }: ModalProps) {
  const { theme } = useThemeContext();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div
        className={`${theme.bgPanel} rounded-2xl border ${theme.border} shadow-2xl ${maxWidth} w-full p-6 animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className={`${theme.textMuted} hover:${theme.textMain} p-1 rounded-md`}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
