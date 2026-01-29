'use client';

import { ReactNode } from 'react';
import { Button, Space } from 'antd';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
  };
  extra?: ReactNode;
}

export function PageHeader({ title, description, action, extra }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{title}</h1>
          {description && (
            <p style={{ margin: '8px 0 0', color: 'var(--textSecondary)' }}>
              {description}
            </p>
          )}
        </div>
        <Space>
          {extra}
          {action && (
            <Button
              type="primary"
              icon={action.icon}
              onClick={action.onClick}
              size="large"
            >
              {action.label}
            </Button>
          )}
        </Space>
      </div>
    </div>
  );
}
