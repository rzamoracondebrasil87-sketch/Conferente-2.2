import React from 'react';
import { createPortal } from 'react-dom';
import { NotificationItem } from '../contexts/NotificationContext';
import { AppView } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onClearAll: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onRemove: (id: string) => void;
  onNavigate?: (view: AppView) => void;
}

const NotificationsDrawer: React.FC<Props> = ({ 
    isOpen, onClose, notifications, onClearAll, onMarkAsRead, onMarkAllAsRead, onRemove, onNavigate 
}) => {
  if (!isOpen) return null;

  const handleNotificationClick = (notif: NotificationItem) => {
      onMarkAsRead(notif.id);
      if (notif.actionRoute && onNavigate) {
          onNavigate(notif.actionRoute);
          onClose();
      }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'ai': return 'smart_toy';
      default: return 'notifications';
    }
  };

  const getStyle = (type: string, read: boolean) => {
    switch (type) {
      case 'success': return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', icon: 'text-emerald-400', border: 'border-emerald-500/20' };
      case 'warning': return { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-400', border: 'border-amber-500/20' };
      case 'error': return { bg: 'bg-red-500/10', text: 'text-red-400', icon: 'text-red-400', border: 'border-red-500/20' };
      case 'ai': return { bg: 'bg-primary/10', text: 'text-primary', icon: 'text-primary', border: 'border-primary/20' };
      default: return { bg: 'bg-white/5', text: 'text-white', icon: 'text-gray-400', border: 'border-white/10' };
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex justify-end font-body">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose}
      ></div>
      
      {/* Drawer Panel */}
      <div 
        className="relative w-full max-w-[350px] h-full bg-[#1e1626] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pt-safe pb-4 px-6 flex items-center justify-between z-10 border-b border-white/5 min-h-[90px]">
            <div>
                <h2 className="text-2xl font-bold text-white tracking-tight font-display">Notificações</h2>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-gray-500">
                        {notifications.length} {notifications.length === 1 ? 'mensagem' : 'mensagens'}
                    </span>
                    {notifications.some(n => !n.read) && (
                        <>
                        <span className="text-gray-600">•</span>
                        <button onClick={onMarkAllAsRead} className="text-xs font-bold text-primary hover:text-white transition-colors">
                            Ler tudo
                        </button>
                        </>
                    )}
                </div>
            </div>
            <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white active:scale-95"
            >
                <span className="material-symbols-rounded">close</span>
            </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 pb-24">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-4 mt-20">
                    <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/5">
                        <span className="material-symbols-rounded text-4xl opacity-50">notifications_off</span>
                    </div>
                    <span className="text-sm font-bold">Tudo limpo por aqui</span>
                </div>
            ) : (
                notifications.map((notif, i) => {
                    const style = getStyle(notif.type, notif.read);
                    return (
                        <div 
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`
                                relative p-4 rounded-[1.8rem] transition-all duration-200 group cursor-pointer border
                                ${notif.read 
                                    ? 'bg-transparent border-transparent hover:bg-white/5 opacity-60' 
                                    : `bg-[#231a2e] ${style.border} shadow-lg`
                                }
                            `}
                        >
                            {/* Unread Dot */}
                            {!notif.read && (
                                <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(127,19,236,0.6)]"></span>
                            )}
                            
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRemove(notif.id); }}
                                className="absolute top-2 right-2 p-2 rounded-full text-gray-600 hover:bg-red-500/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all z-10"
                            >
                                <span className="material-symbols-rounded text-[18px]">close</span>
                            </button>

                            <div className="flex gap-4">
                                <div className={`w-12 h-12 rounded-2xl ${style.bg} ${style.icon} flex items-center justify-center shrink-0 border border-white/5 shadow-inner`}>
                                    <span className="material-symbols-rounded text-[24px]">{getIcon(notif.type)}</span>
                                </div>
                                
                                <div className="flex flex-col flex-1 min-w-0 pt-0.5">
                                    <div className="flex justify-between items-start mb-1 pr-6">
                                        <h3 className={`text-sm font-bold leading-tight ${notif.read ? 'text-gray-500' : 'text-white'}`}>
                                            {notif.title}
                                        </h3>
                                    </div>
                                    <p className={`text-xs leading-relaxed line-clamp-2 ${notif.read ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {notif.message}
                                    </p>
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">
                                            {notif.time}
                                        </span>
                                        {notif.actionRoute && (
                                            <span className="text-[10px] font-bold text-primary flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                                                Ver
                                                <span className="material-symbols-rounded text-[12px]">arrow_forward</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>

        {/* Footer Actions */}
        {notifications.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#1e1626] via-[#1e1626] to-transparent pb-safe z-20">
                <button 
                    onClick={onClearAll}
                    className="w-full bg-[#2a2136] hover:bg-[#322840] text-gray-300 border border-white/5 py-4 rounded-[1.5rem] text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                >
                    <span className="material-symbols-rounded text-[18px]">delete_sweep</span>
                    Limpar todas
                </button>
            </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default NotificationsDrawer;