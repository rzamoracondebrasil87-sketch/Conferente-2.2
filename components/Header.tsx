import React, { useState } from 'react';
import { AppView } from '../types';
import NotificationsDrawer from './NotificationsDrawer';
import SettingsDrawer from './SettingsDrawer';
import { useNotifications } from '../contexts/NotificationContext';

interface Props {
    currentView?: AppView;
    isMenuOpen: boolean;
    onCloseMenu: () => void;
    onNavigate?: (view: AppView) => void;
    userName: string;
    userPhoto: string | null;
    onUpdateProfile: (name: string, photo: string | null) => void;
}

const Header: React.FC<Props> = ({ isMenuOpen, onCloseMenu, onNavigate, userName, userPhoto, onUpdateProfile }) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { notifications, unreadCount, clearAll, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  return (
    <>
    {/* Header Area */}
    <header className="pt-8 px-6 pb-6 flex items-center justify-between sticky top-0 z-20 bg-background/90 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full border border-white/10 shadow-lg shadow-purple-900/20 overflow-hidden">
             {userPhoto ? (
                 <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
             ) : (
                 <div className="w-full h-full bg-surface-container flex items-center justify-center">
                    <span className="material-symbols-rounded text-gray-400">person</span>
                 </div>
             )}
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1.5 font-display">Olá, {userName}</p>
          <h1 className="text-lg font-bold text-on-surface tracking-tight leading-none font-display">Painel Logístico</h1>
        </div>
      </div>
      
      <div className="flex gap-2">
          {/* Notifications Button */}
          <button 
              onClick={() => setIsNotifOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-white/5 hover:bg-surface-container transition-colors group relative"
          >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-xl">notifications</span>
              {unreadCount > 0 && (
                  <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
          </button>

          {/* Settings Button */}
          <button 
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-surface border border-white/5 hover:bg-surface-container transition-colors group"
          >
              <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors text-xl">settings</span>
          </button>
      </div>
    </header>

    <NotificationsDrawer 
        isOpen={isNotifOpen} 
        onClose={() => setIsNotifOpen(false)} 
        notifications={notifications}
        onClearAll={clearAll}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onRemove={removeNotification}
        onNavigate={onNavigate}
    />

    <SettingsDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userName={userName}
        userPhoto={userPhoto}
        onUpdateProfile={onUpdateProfile}
    />
    </>
  );
};

export default Header;