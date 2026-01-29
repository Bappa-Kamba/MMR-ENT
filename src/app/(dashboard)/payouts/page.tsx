'use client';

import { useState } from 'react';
import { Table, Space, Button, Dropdown, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, MoreOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableFilters } from '@/components/shared/TableFilters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { usePayouts, useRetryPayout } from '@/hooks/use-payouts';
import { useNotification } from '@/providers/NotificationProvider';
import type { Payout } from '@/types/models';
import dayjs, { Dayjs } from 'dayjs';

export default function PayoutsPage() {
  const router = useRouter();
  const { openNotificationWithIcon } = useNotification();
  
  // Filters state
  const [search, setSearch] = useState('');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string | number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | number | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch data
  const { data, isLoading } = usePayouts({
    search,
    subsidiary: subsidiaryFilter,
    status: statusFilter,
    dateRange: dateRange ? [
      dateRange[0]?.toISOString() || null,
      dateRange[1]?.toISOString() || null
    ] : null,
    page,
    pageSize,
  });

  // Mutations
  const retryMutation = useRetryPayout();

  // Filter configuration
  const filters = [
    {
      type: 'search' as const,
      name: 'search',
      placeholder: 'Search by employee name...',
      value: search,
      onChange: setSearch,
    },
    {
      type: 'select' as const,
      name: 'subsidiary',
      placeholder: 'All Subsidiaries',
      value: subsidiaryFilter,
      onChange: setSubsidiaryFilter,
      options: [
        { label: 'Cement Division', value: 'cement' },
        { label: 'Automobiles', value: 'auto' },
        { label: 'Logistics', value: 'logistics' },
      ],
    },
    {
      type: 'select' as const,
      name: 'status',
      placeholder: 'All Statuses',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Processing', value: 'PROCESSING' },
        { label: 'Completed', value: 'COMPLETED' },
        { label: 'Failed', value: 'FAILED' },
      ],
    },
    {
      type: 'dateRange' as const,
      name: 'dateRange',
      placeholder: 'Select date range',
      value: dateRange,
      onChange: setDateRange,
    },
  ];

  const handleResetFilters = () => {
    setSearch('');
    setSubsidiaryFilter(undefined);
    setStatusFilter(undefined);
    setDateRange(null);
  };

  const handleView = (id: string) => {
    router.push(`/payouts/${id}`);
  };

  const handleRetry = async (id: string, employeeName: string) => {
    Modal.confirm({
      title: 'Retry Payout',
      content: `Are you sure you want to retry the payout for ${employeeName}?`,
      okText: 'Retry',
      onOk: async () => {
        try {
          await retryMutation.mutateAsync(id);
          openNotificationWithIcon(
            'Payout Retried',
            'The payout has been queued for retry',
            'success'
          );
        } catch (error) {
          console.error("Error ", error);
          openNotificationWithIcon(
            'Retry Failed',
            'Failed to retry payout. Please try again.',
            'error'
          );
        }
      },
    });
  };

  // Table columns
  const columns: ColumnsType<Payout> = [
    {
      title: 'Payout Date',
      dataIndex: 'payout_date',
      key: 'payout_date',
      width: 120,
      render: (date) => dayjs(date).format('DD MMM YYYY'),
      sorter: true,
    },
    {
      title: 'Employee',
      key: 'employee',
      width: 200,
      render: (_, record) => `${record.employee.first_name} ${record.employee.last_name}`,
      ellipsis: true,
    },
    {
      title: 'Subsidiary',
      dataIndex: ['subsidiary', 'name'],
      key: 'subsidiary',
      width: 150,
    },
    {
      title: 'Amount',
      dataIndex: 'amount_cents',
      key: 'amount_cents',
      width: 130,
      align: 'right',
      render: (cents) => <CurrencyDisplay cents={cents} />,
      sorter: true,
    },
    {
      title: 'Type',
      dataIndex: 'payout_type',
      key: 'payout_type',
      width: 130,
      render: (type) => type,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => <StatusBadge status={status} />,
      sorter: true,
    },
    {
      title: 'Paystack Code',
      dataIndex: 'paystack_transfer_code',
      key: 'paystack_transfer_code',
      width: 150,
      ellipsis: true,
      render: (code) => code || '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record.id)}
          >
            View
          </Button>
          {record.status === 'FAILED' && (
            <Button
              type="link"
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => handleRetry(record.id, `${record.employee.first_name} ${record.employee.last_name}`)}
            >
              Retry
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Payouts"
        description="Manage and track employee payouts across subsidiaries"
        action={{
          label: 'Execute Payout',
          icon: <PlusOutlined />,
          onClick: () => router.push('/payouts/execute'),
        }}
      />

      {/* Filters */}
      <TableFilters filters={filters} onReset={handleResetFilters} />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} payouts`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
        onChange={(pagination, filters, sorter) => {
          // Handle sorting
          console.log('Sorter:', sorter);
        }}
      />
    </div>
  );
}
