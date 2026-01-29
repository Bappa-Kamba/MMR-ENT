'use client';

import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  UserOutlined,
  NotificationOutlined,
  BgColorsOutlined,
  TeamOutlined,
  WalletOutlined,
  ShopOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation';
import { useThemeStore } from '@/stores/theme-store';

const { Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const menuItems: MenuItem[] = [
  getItem('Dashboard', '/dashboard', <DashboardOutlined />),
  getItem('Divisions', '', '', [
    getItem('Subsidiaries', '/subsidiaries', <ShopOutlined />),
    getItem('Invoices', '/invoices', <FileTextOutlined />),
    getItem('Employees', '/employees', <TeamOutlined />),
    getItem('Expenses', '/expenses', <WalletOutlined />),
  ]),
  getItem('App Settings', '', '',[
    getItem('Settings', '/settings', <SettingOutlined />),
    getItem('Profile', '/settings/profile', <UserOutlined />),
    getItem('Notifications', '/settings/notifications', <NotificationOutlined />),
    getItem('Theme', '/settings/theme', <BgColorsOutlined />),
  ]),
];

interface AppSidebarProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

export function AppSidebar({ collapsed, onCollapse }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme } = useThemeStore();

  // Determine selected key based on current path
  const selectedKey = pathname.startsWith('/settings') 
    ? pathname 
    : `/${pathname.split('/')[1]}`;

  const handleMenuClick: MenuProps['onClick'] = (e) => {
    router.push(e.key);
  };

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={onCollapse}
      theme="dark"
      width={250}
       style={{
        background: `linear-gradient(135deg, ${theme.sidebarGradientStart} 0%, ${theme.secondary} 50%, ${theme.sidebarGradientEnd} 100%)`,
        boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        overflow: 'auto',
        height: '100vh',
        position: 'sticky',
        insetInlineStart: 0,
        top: 0,
        scrollbarWidth: 'thin',
        scrollbarGutter: 'stable',
      }}
    >
      {/* Logo */}
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold',
          borderBottom: `1px solid ${theme.sidebarActiveItem}33`,
          background: 'rgba(0,0,0,0.1)',
        }}
      >
        {collapsed ? 'FM' : 'Finance Manager'}
      </div>

      {/* Menu */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        defaultOpenKeys={['dashboard']}
        items={menuItems}
        onClick={handleMenuClick}
        style={{
          background: 'transparent',
          border: 'none',
          color: theme.sidebarText,
        }}
        theme="dark"
        // Override Ant Design menu item styles
        className="custom-sidebar-menu"
      />

      <style jsx global>{`
        .custom-sidebar-menu .ant-menu-item,
        .custom-sidebar-menu .ant-menu-submenu-title {
          color: ${theme.sidebarText} !important;
        }
        
        .custom-sidebar-menu .ant-menu-item:hover,
        .custom-sidebar-menu .ant-menu-submenu-title:hover {
          color: ${theme.sidebarTextHover} !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        
        .custom-sidebar-menu .ant-menu-item-selected {
          background: ${theme.sidebarActiveItem} !important;
          color: #fff !important;
        }
        
        .custom-sidebar-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
          color: ${theme.sidebarTextHover} !important;
        }
      `}</style>

    </Sider>
  );
}
