'use client';

import { useState } from 'react';
import { Table, Space, Button, Dropdown, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined, SendOutlined, EditOutlined, DeleteOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableFilters } from '@/components/shared/TableFilters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useInvoices, useDeleteInvoice, useSendInvoice } from '@/hooks/use-invoices';
import { useNotification } from '@/providers/NotificationProvider';
import { InvoiceModal } from '@/components/invoices/InvoiceModal';
import type { Invoice } from '@/types/models';
import dayjs, { Dayjs } from 'dayjs';

export default function InvoicesPage() {
  const router = useRouter();
  const { openNotificationWithIcon } = useNotification();
  
  // Filters state
  const [search, setSearch] = useState('');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string | number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | number>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch data
  const { data, isLoading } = useInvoices({
    search,
    subsidiary: subsidiaryFilter,
    status: statusFilter,
    page,
    pageSize,
  });

  // Mutations
  const deleteMutation = useDeleteInvoice();
  const sendMutation = useSendInvoice();

  // Filter configuration
  const filters = [
    {
      type: 'search' as const,
      name: 'search',
      placeholder: 'Search by invoice # or client name...',
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
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Sent', value: 'SENT' },
        { label: 'Paid', value: 'PAID' },
        { label: 'Overdue', value: 'OVERDUE' },
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
    router.push(`/invoices/${id}`);
  };

  const handleCreate = () => {
    setEditingInvoice(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleSend = async (id: string, invoiceNumber: string) => {
    try {
      await sendMutation.mutateAsync(id);
      openNotificationWithIcon(
        'Invoice Sent',
        `Invoice ${invoiceNumber} has been queued for sending`,
        'success'
      );
    } catch (error) {
      console.error("Error ", error);
      openNotificationWithIcon(
        'Send Failed',
        'Failed to send invoice. Please try again.',
        'error'
      );
    }
  };

  const handleDelete = (id: string, invoiceNumber: string) => {
    Modal.confirm({
      title: 'Delete Invoice',
      content: `Are you sure you want to delete invoice ${invoiceNumber}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          openNotificationWithIcon(
            'Invoice Deleted',
            `Invoice ${invoiceNumber} has been deleted`,
            'success'
          );
        } catch (error) {
          console.error("Error ", error);
          openNotificationWithIcon(
            'Delete Failed',
            'Failed to delete invoice. Please try again.',
            'error'
          );
        }
      },
    });
  };

  // Table columns
  const columns: ColumnsType<Invoice> = [
    {
      title: 'Invoice #',
      dataIndex: 'invoice_number',
      key: 'invoice_number',
      width: 140,
      fixed: 'left',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      key: 'client_name',
      width: 200,
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
      dataIndex: 'total_cents',
      key: 'total_cents',
      width: 130,
      align: 'right',
      render: (cents) => <CurrencyDisplay cents={cents} />,
      sorter: true,
    },
    {
      title: 'Balance Due',
      dataIndex: 'balance_due_cents',
      key: 'balance_due_cents',
      width: 170,
      align: 'right',
      render: (cents) => (
        <span style={{ color: cents > 0 ? 'var(--error)' : 'var(--success)' }}>
          <CurrencyDisplay cents={cents} />
        </span>
      ),
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <StatusBadge status={status} />,
      sorter: true
    },
    {
      title: 'Issue Date',
      dataIndex: 'issue_date',
      key: 'issue_date',
      width: 120,
      render: (date) => dayjs(date).format('DD MMM YYYY'),
      sorter: true,
    },
    {
      title: 'Due Date',
      dataIndex: 'due_date',
      key: 'due_date',
      width: 120,
      render: (date) => dayjs(date).format('DD MMM YYYY'),
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
          <Dropdown
            menu={{
              items: [
                {
                  key: 'send',
                  icon: <SendOutlined />,
                  label: 'Send Invoice',
                  onClick: () => handleSend(record.id, record.invoice_number),
                  disabled: record.status === 'PAID',
                },
                {
                  key: 'edit',
                  icon: <EditOutlined />,
                  label: 'Edit',
                  onClick: () => handleEdit(record),
                  disabled: record.status !== 'DRAFT',
                },
                {
                  type: 'divider',
                },
                {
                  key: 'delete',
                  icon: <DeleteOutlined />,
                  label: 'Delete',
                  danger: true,
                  onClick: () => handleDelete(record.id, record.invoice_number),
                },
              ],
            }}
            trigger={['click']}
          >
            <Button type="text" size="small" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Invoices"
        description="Manage and track all invoices across subsidiaries"
        action={{
          label: 'Create Invoice',
          icon: <PlusOutlined />,
          onClick: handleCreate,
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
          showTotal: (total) => `Total ${total} invoices`,
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

      {/* Modal */}
      <InvoiceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editingInvoice}
        mode={modalMode}
      />
    </div>
  );
}
