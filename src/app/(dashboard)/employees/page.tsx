'use client';

import { useState } from 'react';
import { Table, Space, Button, Dropdown, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableFilters } from '@/components/shared/TableFilters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useEmployees, useDeleteEmployee } from '@/hooks/use-employees';
import { useNotification } from '@/providers/NotificationProvider';
import type { Employee } from '@/types/models';
import dayjs, { Dayjs } from 'dayjs';
import { EmployeeModal } from '@/components/employees/EmployeeModal';


export default function EmployeesPage() {
  const router = useRouter();
  const { openNotificationWithIcon } = useNotification();
  
  // Filters state
  const [search, setSearch] = useState('');
  const [subsidiaryFilter, setSubsidiaryFilter] = useState<string | number | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | number | undefined>();
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch data
  const { data, isLoading } = useEmployees({
    search,
    subsidiary: subsidiaryFilter,
    status: statusFilter,
    page,
    pageSize,
  });

  // Mutations
  const deleteMutation = useDeleteEmployee();

  // Filter configuration
  const filters = [
    {
      type: 'search' as const,
      name: 'search',
      placeholder: 'Search by name or email...',
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
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Suspended', value: 'SUSPENDED' },
        { label: 'Terminated', value: 'TERMINATED' },
      ],
    },
  ];

  const handleResetFilters = () => {
    setSearch('');
    setSubsidiaryFilter(undefined);
    setStatusFilter(undefined);
  };

  const handleCreate = () => {
    setEditingEmployee(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setModalMode('edit');
    setModalOpen(true);
  };


  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Employee',
      content: `Are you sure you want to delete ${name}? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          openNotificationWithIcon(
            'Employee Deleted',
            `${name} has been deleted`,
            'success'
          );
        } catch (error) {
          console.error("Error ", error);
          openNotificationWithIcon(
            'Delete Failed',
            'Failed to delete employee. Please try again.',
            'error'
          );
        }
      },
    });
  };

  // Table columns
  const columns: ColumnsType<Employee> = [
    {
      title: 'Name',
      key: 'name',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <strong>{`${record.first_name} ${record.last_name}`}</strong>
      ),
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
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
      title: 'Bank Name',
      dataIndex: 'bank_name',
      key: 'bank_name',
      width: 150,
    },
    {
      title: 'Account Number',
      dataIndex: 'account_number',
      key: 'account_number',
      width: 150,
    },
    {
      title: 'Salary',
      dataIndex: 'net_salary_cents',
      key: 'net_salary_cents',
      width: 130,
      align: 'right',
      render: (cents) => <CurrencyDisplay cents={cents} />,
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'employment_status',
      key: 'employment_status',
      width: 120,
      render: (status) => <StatusBadge status={status} />,
      sorter: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <EditOutlined />,
                label: 'Edit',
                onClick: () => handleEdit(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record.id, `${record.first_name} ${record.last_name}`),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Employees"
        description="Manage employee information and payroll details"
        action={{
          label: 'Create Employee',
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
          showTotal: (total) => `Total ${total} employees`,
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
      <EmployeeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editingEmployee}
        mode={modalMode}
      />
    </div>
  );
}

