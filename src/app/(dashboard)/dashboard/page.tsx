'use client';

import { Card, Row, Col, Statistic, Table, Tag, Space, Button } from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  WalletOutlined,
  EyeOutlined,
  SendOutlined,
} from '@ant-design/icons';

export default function DashboardPage() {
  // Mock data for testing
  const stats = {
    walletBalance: 800000000, // 8,000,000 in cents
    pendingInvoices: 12,
    activeEmployees: 87,
    payoutsThisMonth: 45,
  };

  const recentInvoices = [
    {
      key: '1',
      invoice_number: 'INV-01349',
      client_name: 'MUNIR RABIU',
      amount: 197500,
      status: 'SENT',
      date: '2025-01-15',
    },
    {
      key: '2',
      invoice_number: 'INV-01350',
      client_name: 'John Doe',
      amount: 345000,
      status: 'DRAFT',
      date: '2025-01-20',
    },
    {
      key: '3',
      invoice_number: 'INV-01351',
      client_name: 'Jane Smith',
      amount: 520000,
      status: 'PAID',
      date: '2025-01-18',
    },
  ];

  const invoiceColumns = [
    {
      title: 'Invoice #',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      key: 'client_name',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (cents: number) => `₦${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          DRAFT: 'default',
          SENT: 'processing',
          PAID: 'success',
          OVERDUE: 'error',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />}>
            View
          </Button>
          <Button type="link" size="small" icon={<SendOutlined />}>
            Send
          </Button>
        </Space>
      ),
    },
  ];

  const formatCurrency = (cents: number) => {
    return `₦${(cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  };

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Dashboard</h1>

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Wallet Balance"
              value={formatCurrency(stats.walletBalance)}
              prefix={<WalletOutlined />}
              style={{ color: '#8B2F39', fontSize: 24 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
              Last synced: 2 hours ago
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Pending Invoices"
              value={stats.pendingInvoices}
              prefix={<FileTextOutlined />}
              style={{ color: '#F59E0B', fontSize: 24 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
              Total: ₦2,500,000.00
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Employees"
              value={stats.activeEmployees}
              prefix={<TeamOutlined />}
              style={{ color: '#10B981', fontSize: 24 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
              Across 4 subsidiaries
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Payouts This Month"
              value={stats.payoutsThisMonth}
              prefix={<DollarOutlined />}
              style = {{ color: '#2C5F7C', fontSize: 24 }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
              Total: ₦25,000,000.00
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Invoices Table */}
      <Card title="Recent Invoices" style={{ marginBottom: 24 }}>
        <Table
          columns={invoiceColumns}
          dataSource={recentInvoices}
          pagination={false}
          size="small"
        />
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <Space>
          <Button type="primary" icon={<FileTextOutlined />}>
            Create Invoice
          </Button>
          <Button icon={<DollarOutlined />}>Execute Payout</Button>
          <Button icon={<TeamOutlined />}>Add Employee</Button>
        </Space>
      </Card>
    </div>
  );
}
