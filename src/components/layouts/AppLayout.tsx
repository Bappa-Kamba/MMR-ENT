'use client';

import React from 'react';
import { Layout } from 'antd';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';
import { useUIStore } from '@/stores/ui-store';

const { Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <AppSidebar collapsed={sidebarCollapsed} onCollapse={toggleSidebar} />

      {/* Main Content Area */}
      <Layout>
        {/* Header */}
        <AppHeader />

        {/* Page Content */}
        <Content style={{ margin: '0 16px' }}>
          <div
            style={{
              padding: 24,
              minHeight: 360,
              marginTop: 16,
              background: '#fff',
              borderRadius: 8,
            }}
          >
            {children}
          </div>
        </Content>

        {/* Footer */}
        <AppFooter />
      </Layout>
    </Layout>
  );
}
