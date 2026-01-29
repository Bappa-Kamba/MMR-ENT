'use client';

import React from 'react';
import { Card, Row, Col, Button, Space, ColorPicker, InputNumber } from 'antd';
import { useThemeStore } from '@/stores/theme-store';
import type { Color } from 'antd/es/color-picker';
import useAppNotification from '@/hooks/use-app-notification';


export default function ThemePage() {
  const { theme, updateTheme, resetTheme, applyPreset } = useThemeStore();
  const { openNotificationWithIcon } = useAppNotification();

  const handleColorChange = (key: keyof typeof theme, color: Color) => {
    updateTheme({ [key]: color.toHexString() });
  };

  const handlePresetApply = (presetName: string) => {
    applyPreset(presetName);
    openNotificationWithIcon(`${presetName.charAt(0).toUpperCase() + presetName.slice(1)} theme applied!`, '', 'success');
  };

  const colorGroups = [
    {
      title: 'Brand Colors',
      colors: [
        { key: 'primary', label: 'Primary Color', description: 'Used for buttons, links, active states' },
        { key: 'secondary', label: 'Secondary Color', description: 'Accent color for secondary actions' },
      ],
    },
    {
      title: 'Sidebar Colors',
      colors: [
        { key: 'sidebarGradientStart', label: 'Sidebar Gradient Start', description: 'Top color of sidebar gradient' },
        { key: 'sidebarGradientEnd', label: 'Sidebar Gradient End', description: 'Bottom color of sidebar gradient' },
        { key: 'sidebarText', label: 'Sidebar Text', description: 'Default menu item text color' },
        { key: 'sidebarTextHover', label: 'Sidebar Text Hover', description: 'Menu item text color on hover' },
        { key: 'sidebarActiveItem', label: 'Active Item Background', description: 'Background for selected menu item' },
      ],
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'textMain', label: 'Main Text', description: 'Primary content text color' },
        { key: 'textSecondary', label: 'Secondary Text', description: 'Muted/helper text color' },
        { key: 'textMenu', label: 'Menu Text', description: 'Header menu text color' },
      ],
    },
    {
      title: 'Background Colors',
      colors: [
        { key: 'bgMain', label: 'Main Background', description: 'Page background color' },
        { key: 'bgCard', label: 'Card Background', description: 'Card/panel background color' },
        { key: 'bgHeader', label: 'Header Background', description: 'Top header background color' },
      ],
    },
    {
      title: 'Status Colors',
      colors: [
        { key: 'success', label: 'Success', description: 'Success states and confirmations' },
        { key: 'warning', label: 'Warning', description: 'Warning messages and alerts' },
        { key: 'error', label: 'Error', description: 'Error states and destructive actions' },
        { key: 'info', label: 'Info', description: 'Informational messages' },
      ],
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1>Theme Customization</h1>
          <p style={{ color: theme.textSecondary }}>
            Customize your application&apos;s color scheme
          </p>
        </div>
        <Space>
          <Button onClick={resetTheme}>Reset to Default</Button>
        </Space>
      </div>

      {/* Theme Presets */}
      <Card title="Quick Presets" style={{ marginBottom: 24 }}>
        <Space>
          <Button onClick={() => handlePresetApply('burgundy')} type="primary">
            Burgundy (Default)
          </Button>
          <Button onClick={() => handlePresetApply('ocean')} style={{ background: '#0284c7', color: '#fff', borderColor: '#0284c7' }}>
            Ocean Blue
          </Button>
          <Button onClick={() => handlePresetApply('forest')} style={{ background: '#059669', color: '#fff', borderColor: '#059669' }}>
            Forest Green
          </Button>
          <Button onClick={() => handlePresetApply('sunset')} style={{ background: '#dc2626', color: '#fff', borderColor: '#dc2626' }}>
            Sunset Red
          </Button>
        </Space>
      </Card>

      {/* Color Groups */}
      {colorGroups.map((group) => (
        <Card key={group.title} title={group.title} style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            {group.colors.map((colorItem) => (
              <Col key={colorItem.key} xs={24} md={12} lg={8}>
                <div style={{ padding: 16, border: `1px solid ${theme.border}`, borderRadius: 8 }}>
                  <div style={{ marginBottom: 8, fontWeight: 500 }}>
                    {colorItem.label}
                  </div>
                  <div style={{ marginBottom: 12, fontSize: 12, color: theme.textSecondary }}>
                    {colorItem.description}
                  </div>
                  <Space>
                    <ColorPicker
                      value={theme[colorItem.key as keyof typeof theme] as string}
                      onChange={(color) => handleColorChange(colorItem.key as keyof typeof theme, color)}
                      showText
                    />
                    <span style={{ fontFamily: 'monospace', fontSize: 12 }}>
                      {theme[colorItem.key as keyof typeof theme]}
                    </span>
                  </Space>
                </div>
              </Col>
            ))}
          </Row>
        </Card>
      ))}

      {/* Border Radius */}
      <Card title="UI Elements">
        <div style={{ maxWidth: 300 }}>
          <div style={{ marginBottom: 8, fontWeight: 500 }}>Border Radius</div>
          <div style={{ marginBottom: 12, fontSize: 12, color: theme.textSecondary }}>
            Controls the roundness of corners throughout the app
          </div>
          <InputNumber
            value={theme.borderRadius}
            onChange={(value) => updateTheme({ borderRadius: value || 8 })}
            min={0}
            max={24}
            addonAfter="px"
            style={{ width: '100%' }}
          />
        </div>
      </Card>

      {/* Preview */}
      <Card title="Live Preview" style={{ marginTop: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="primary">Primary Button</Button>
          <Button>Default Button</Button>
          <Button type="primary" danger>Danger Button</Button>
          <div style={{ 
            padding: 16, 
            background: theme.bgCard, 
            border: `1px solid ${theme.border}`,
            borderRadius: theme.borderRadius 
          }}>
            <div style={{ color: theme.textMain }}>This is main text</div>
            <div style={{ color: theme.textSecondary }}>This is secondary text</div>
          </div>
        </Space>
      </Card>
    </div>
  );
}
