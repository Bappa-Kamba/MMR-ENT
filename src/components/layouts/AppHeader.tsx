'use client';

import React from 'react';
import { Layout, Space, Button, Avatar, Dropdown, Badge } from 'antd';
import {
  BellOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { SubsidiarySelector } from '../shared/SubsidiarySelector';
import { RefreshButton } from '../shared/RefreshButton';

const { Header } = Layout;

export function AppHeader() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => router.push('/settings/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => router.push('/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <Header
      style={{
        padding: '0 24px',
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {/* Left side - Subsidiary Selector */}
      <SubsidiarySelector />

      {/* Right side - Actions & User */}
      <Space size="large">
        {/* Refresh Button */}
        <RefreshButton />

        {/* Notifications */}
        <Badge count={5} offset={[-5, 5]}>
          <Button
            type="text"
            icon={<BellOutlined style={{ fontSize: 18 }} />}
            onClick={() => router.push('/notifications')}
          />
        </Badge>

        {/* User Menu */}
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <span>{user?.username || 'Admin'}</span>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
}
