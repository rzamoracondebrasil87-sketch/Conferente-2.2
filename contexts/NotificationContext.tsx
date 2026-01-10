import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppView } from '../types';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
  read: boolean;
  actionRoute?: AppView;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (title: string, message: string, type?: NotificationItem['type'], actionRoute?: AppView) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  removeNotification: (id: string) => void;
  showBrowserNotification: (title: string, message?: string, icon?: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
        id: 'welcome-1',
        title: 'Sistema Iniciado',
        message: 'Conferente 2.1 pronto para operação.',
        time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        timestamp: Date.now(),
        type: 'info',
        read: false
    }
  ]);

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'info', actionRoute?: AppView) => {
    const newNotif: NotificationItem = {
      id: Date.now().toString() + Math.random().toString().slice(2, 5),
      title,
      message,
      time: new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
      timestamp: Date.now(),
      type,
      read: false,
      actionRoute
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const removeNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const showBrowserNotification = async (title: string, message = '', icon = '/icon-192.png') => {
    try {
      if (!('Notification' in window)) return;

      let permission = Notification.permission;
      if (permission !== 'granted') {
        permission = await Notification.requestPermission();
      }

      if (permission === 'granted') {
        // Use the Notification constructor so it shows while the app is open
        new Notification(title, { body: message, icon });
      }
    } catch (err) {
      // ignore notification errors
      console.warn('Notification error', err);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll, removeNotification, showBrowserNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};