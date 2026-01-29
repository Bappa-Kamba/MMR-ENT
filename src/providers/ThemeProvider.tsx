'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();

  useEffect(() => {
    // Apply CSS variables to root element
    const root = document.documentElement;
    
    Object.entries(theme).forEach(([key, value]) => {
      if (typeof value === 'number') {
        root.style.setProperty(`--${key}`, `${value}px`);
      } else {
        root.style.setProperty(`--${key}`, value);
      }
    });
  }, [theme]);

  return <>{children}</>;
}
