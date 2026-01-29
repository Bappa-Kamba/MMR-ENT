import React from 'react';
import { Layout } from 'antd';

const { Footer } = Layout;

export function AppFooter() {
  return (
    <Footer style={{ textAlign: 'center', background: '#fafafa' }}>
      Financial Management System ©{new Date().getFullYear()} Created with ❤️
    </Footer>
  );
}
