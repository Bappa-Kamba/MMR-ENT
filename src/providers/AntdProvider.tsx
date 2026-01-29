'use client';

import React from 'react';
import { ConfigProvider } from 'antd';
import { useThemeStore } from '@/stores/theme-store';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  const antdConfig = {
    token: {
      colorPrimary: theme.primary,
      colorSuccess: theme.success,
      colorWarning: theme.warning,
      colorError: theme.error,
      colorInfo: theme.info,
      borderRadius: theme.borderRadius,
      colorText: theme.textMain,
      colorTextSecondary: theme.textSecondary,
      colorBgContainer: theme.bgCard,
      colorBorder: theme.border,
      fontFamily: 'Inter, -apple-system, sans-serif',
    },
    components: {
      Button: {
        controlHeight: 40,
      },
      Input: {
        controlHeight: 40,
      },
      Select: {
        controlHeight: 40,
      },
    },
  };

  return (
    <ConfigProvider theme={antdConfig}>
      {children}
    </ConfigProvider>
  );
}
