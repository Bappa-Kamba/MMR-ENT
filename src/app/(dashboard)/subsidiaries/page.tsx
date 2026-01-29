'use client';

import { useState } from 'react';
import { Table, Space, Button, Dropdown, Modal, Tag, Avatar } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined, DeleteOutlined, MoreOutlined, PlusOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableFilters } from '@/components/shared/TableFilters';
import { useSubsidiaries, useDeleteSubsidiary, useToggleSubsidiaryStatus } from '@/hooks/use-subsidiaries';
import { useNotification } from '@/providers/NotificationProvider';
import type { Subsidiary } from '@/types/models';
import { SubsidiaryModal } from '@/components/subsidiaries/SubsidiaryModal';

export default function SubsidiariesPage() {
  const router = useRouter();
  const { openNotificationWithIcon } = useNotification();
  
  // Filters state
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | undefined>();
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubsidiary, setEditingSubsidiary] = useState<Subsidiary | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch data
  const { data, isLoading } = useSubsidiaries({
    search,
    isActive: activeFilter,
    page,
    pageSize,
  });

  // Mutations
  const deleteMutation = useDeleteSubsidiary();
  const toggleStatusMutation = useToggleSubsidiaryStatus();

  // Filter configuration
  const filters = [
    {
      type: 'search' as const,
      name: 'search',
      placeholder: 'Search by name or code...',
      value: search,
      onChange: setSearch,
    },
    {
      type: 'select' as const,
      name: 'active',
      placeholder: 'All Status',
      value: activeFilter as any, // Cast to any to allow boolean values
      onChange: setActiveFilter as any,
      options: [
        { label: 'Active', value: true as any },
        { label: 'Inactive', value: false as any },
      ],
    },
  ];

  const handleResetFilters = () => {
    setSearch('');
    setActiveFilter(undefined);
  };

  const handleCreate = () => {
    setEditingSubsidiary(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (subsidiary: Subsidiary) => {
    setEditingSubsidiary(subsidiary);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleToggleStatus = async (id: string, name: string, currentStatus: boolean) => {
    const action = currentStatus ? 'deactivate' : 'activate';
    Modal.confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} Subsidiary`,
      content: `Are you sure you want to ${action} ${name}?`,
      okText: action.charAt(0).toUpperCase() + action.slice(1),
      onOk: async () => {
        try {
          await toggleStatusMutation.mutateAsync({ id, isActive: !currentStatus });
          openNotificationWithIcon(
            'Success',
            `${name} has been ${action}d`,
            'success'
          );
        } catch (error) {
          console.error("Error ", error);
          openNotificationWithIcon(
            'Error',
            `Failed to ${action} subsidiary. Please try again.`,
            'error'
          );
        }
      },
    });
  };

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Subsidiary',
      content: `Are you sure you want to delete ${name}? This action cannot be undone and will fail if there are linked invoices or employees.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          openNotificationWithIcon(
            'Subsidiary Deleted',
            `${name} has been deleted`,
            'success'
          );
        } catch (error) {
          console.error("Error ", error);
          openNotificationWithIcon(
            'Delete Failed',
            'Failed to delete subsidiary. It may have linked records.',
            'error'
          );
        }
      },
    });
  };

  // Table columns
  const columns: ColumnsType<Subsidiary> = [
    {
      title: 'Logo',
      dataIndex: 'logo_url',
      key: 'logo_url',
      width: 80,
      render: (url, record) => (
        <Avatar 
          src={url} 
          size={40} 
          shape="square"
          style={{ backgroundColor: record.primary_color }}
        >
          {record.name.charAt(0)}
        </Avatar>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => <strong>{text}</strong>,
      ellipsis: true,
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 120,
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: 'Template',
      dataIndex: 'invoice_template_id',
      key: 'invoice_template_id',
      width: 150,
      render: (text) => text || '-',
    },
    {
      title: 'Primary Color',
      dataIndex: 'primary_color',
      key: 'primary_color',
      width: 150,
      render: (color) => (
        <Space>
          <div 
            style={{ 
              width: 24, 
              height: 24, 
              backgroundColor: color, 
              border: '1px solid #d9d9d9',
              borderRadius: 4
            }} 
          />
          <span>{color}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'default'} icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
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
                key: 'toggle',
                icon: record.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
                label: record.is_active ? 'Deactivate' : 'Activate',
                onClick: () => handleToggleStatus(record.id, record.name, record.is_active),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                icon: <DeleteOutlined />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record.id, record.name),
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
        title="Subsidiaries"
        description="Manage subsidiary companies and their configurations"
        action={{
          label: 'Create Subsidiary',
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
        scroll={{ x: 1000 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} subsidiaries`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
      />

      {/* Modal */}
      <SubsidiaryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editingSubsidiary}
        mode={modalMode}
      />
    </div>
  );
}
