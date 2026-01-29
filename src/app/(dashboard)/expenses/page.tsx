'use client';

import { useState } from 'react';
import { Table, Space, Button, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckOutlined, CloseOutlined, DollarOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableFilters } from '@/components/shared/TableFilters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useExpenses, useApproveExpense, useRejectExpense, useReimburseExpense } from '@/hooks/use-expenses';
import { useNotification } from '@/providers/NotificationProvider';
import type { Expense } from '@/types/models';
import dayjs, { Dayjs } from 'dayjs';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';


export default function ExpensesPage() {
  const router = useRouter();
  const { openNotificationWithIcon } = useNotification();
  
  // Filters state
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | number | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch data
  const { data, isLoading } = useExpenses({
    search,
    category: categoryFilter,
    status: statusFilter,
    dateRange: dateRange ? [
      dateRange[0]?.toISOString() || null,
      dateRange[1]?.toISOString() || null
    ] : null,
    page,
    pageSize,
  });

  // Mutations
  const approveMutation = useApproveExpense();
  const rejectMutation = useRejectExpense();
  const reimburseMutation = useReimburseExpense();

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
      name: 'category',
      placeholder: 'All Categories',
      value: categoryFilter,
      onChange: setCategoryFilter,
      options: [
        { label: 'Travel', value: 'TRAVEL' },
        { label: 'Meals', value: 'MEALS' },
        { label: 'Supplies', value: 'SUPPLIES' },
        { label: 'Other', value: 'OTHER' },
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
        { label: 'Approved', value: 'APPROVED' },
        { label: 'Reimbursed', value: 'REIMBURSED' },
        { label: 'Rejected', value: 'REJECTED' },
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
    setCategoryFilter(undefined);
    setStatusFilter(undefined);
    setDateRange(null);
  };

  const handleCreate = () => {
    setModalOpen(true);
  };

  const handleApprove = async (id: string, employeeName: string) => {
    try {
      await approveMutation.mutateAsync(id);
      openNotificationWithIcon(
        'Expense Approved',
        `Expense for ${employeeName} has been approved`,
        'success'
      );
    } catch (error) {
      console.error("Error ", error);
      openNotificationWithIcon(
        'Approval Failed',
        'Failed to approve expense. Please try again.',
        'error'
      );
    }
  };

  const handleReject = async (id: string, employeeName: string) => {
    try {
      await rejectMutation.mutateAsync(id);
      openNotificationWithIcon(
        'Expense Rejected',
        `Expense for ${employeeName} has been rejected`,
        'success'
      );
    } catch (error) {
      console.error("Error ", error);
      openNotificationWithIcon(
        'Rejection Failed',
        'Failed to reject expense. Please try again.',
        'error'
      );
    }
  };

  const handleReimburse = (id: string, employeeName: string, amount: number) => {
    Modal.confirm({
      title: 'Reimburse Expense',
      content: (
        <div>
          <p>Are you sure you want to reimburse this expense?</p>
          <p><strong>Employee:</strong> {employeeName}</p>
          <p><strong>Amount:</strong> <CurrencyDisplay cents={amount} /></p>
        </div>
      ),
      okText: 'Reimburse',
      onOk: async () => {
        try {
          await reimburseMutation.mutateAsync(id);
          openNotificationWithIcon(
            'Expense Reimbursed',
            `Expense for ${employeeName} has been reimbursed`,
            'success'
          );
        } catch (error) {
          console.error("Error ", error);
          openNotificationWithIcon(
            'Reimbursement Failed',
            'Failed to reimburse expense. Please try again.',
            'error'
          );
        }
      },
    });
  };

  // Table columns
  const columns: ColumnsType<Expense> = [
    {
      title: 'Date',
      dataIndex: 'expense_date',
      key: 'expense_date',
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
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 120,
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 250,
      ellipsis: true,
      render: (text) => {
        if (text.length > 50) {
          return `${text.substring(0, 50)}...`;
        }
        return text;
      },
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
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'PENDING' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id, `${record.employee.first_name} ${record.employee.last_name}`)}
                style={{ color: 'var(--success)' }}
              >
                Approve
              </Button>
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id, `${record.employee.first_name} ${record.employee.last_name}`)}
                danger
              >
                Reject
              </Button>
            </>
          )}
          {record.status === 'APPROVED' && (
            <Button
              type="link"
              size="small"
              icon={<DollarOutlined />}
              onClick={() => handleReimburse(
                record.id,
                `${record.employee.first_name} ${record.employee.last_name}`,
                record.amount_cents
              )}
            >
              Reimburse
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
        title="Expenses"
        description="Track and manage employee expense claims"
        action={{
          label: 'Create Expense',
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
        scroll={{ x: 1300 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} expenses`,
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
      <ExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

