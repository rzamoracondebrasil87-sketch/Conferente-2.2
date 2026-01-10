import React, { useEffect } from 'react';

interface Props {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<Props> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const getStyles = () => {
    switch(type) {
        case 'success': return 'bg-emerald-500 text-white shadow-emerald-500/30';
        case 'error': return 'bg-red-500 text-white shadow-red-500/30';
        case 'info': return 'bg-surface-container-high text-on-surface border border-white/10'; 
        default: return 'bg-surface text-on-surface';
    }
  };

  const getIcon = () => {
    switch(type) {
        case 'success': return 'check_circle';
        case 'error': return 'error';
        case 'info': return 'info';
        default: return 'info';
    }
  };

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] flex justify-center w-full pointer-events-none px-4">
      <div 
        className={`
          pointer-events-auto
          ${getStyles()} 
          shadow-lg backdrop-blur-md
          rounded-full py-2.5 px-5
          flex items-center gap-3
          animate-in slide-in-from-top-4 fade-in zoom-in-95 duration-300
          max-w-xs w-auto
        `}
      >
        <span className="material-symbols-rounded text-[20px]">{getIcon()}</span>
        <span className="text-sm font-bold tracking-wide">{message}</span>
      </div>
    </div>
  );
};

export default Toast;