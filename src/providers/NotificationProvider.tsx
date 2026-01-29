'use client';

import React, { createContext, useContext } from 'react';
import { notification } from 'antd';

interface NotificationContextType {
  openNotificationWithIcon: (
    title?: string,
    description?: string,
    type?: 'success' | 'error' | 'info'
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [api, contextHolder] = notification.useNotification();

  const openNotificationWithIcon = (
    title = '',
    description = '',
    type: 'success' | 'error' | 'info' = 'info'
  ) => {
    api[type]({
      message: title,
      key: type,
      description: description,
      duration: 3.5,
    });
  };

  return (
    <NotificationContext.Provider value={{ openNotificationWithIcon }}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
