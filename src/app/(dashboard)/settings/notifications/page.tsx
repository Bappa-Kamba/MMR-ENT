'use client';

import { useState } from 'react';
import { Table, Modal, Form, Input, Button, Space, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EditOutlined } from '@ant-design/icons';
import { useNotification } from '@/providers/NotificationProvider';

const { TextArea } = Input;

interface NotificationTemplate {
  id: string;
  code: string;
  channel: string;
  subject: string;
  body: string;
  updated_at: string;
}

// Mock data
const mockTemplates: NotificationTemplate[] = [
  {
    id: '1',
    code: 'INVOICE_SENT',
    channel: 'EMAIL',
    subject: 'Invoice {{invoiceNumber}} from {{companyName}}',
    body: 'Dear {{clientName}},\n\nYour invoice {{invoiceNumber}} is ready...',
    updated_at: '2025-01-20T10:00:00Z',
  },
  {
    id: '2',
    code: 'PAYMENT_RECEIVED',
    channel: 'EMAIL',
    subject: 'Payment Received - Invoice {{invoiceNumber}}',
    body: 'Dear {{clientName}},\n\nWe have received your payment...',
    updated_at: '2025-01-20T10:00:00Z',
  },
];

export default function NotificationTemplatesPage() {
  const [form] = Form.useForm();
  const { openNotificationWithIcon } = useNotification();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEdit = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    form.setFieldsValue({
      subject: template.subject,
      body: template.body,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      // TODO: Call API to update template
      await new Promise(resolve => setTimeout(resolve, 1000));
      openNotificationWithIcon('Success', 'Template updated successfully', 'success');
      setModalOpen(false);
      form.resetFields();
    } catch (error) {
      openNotificationWithIcon('Error', 'Failed to update template', 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<NotificationTemplate> = [
    {
      title: 'Template Code',
      dataIndex: 'code',
      key: 'code',
      width: 200,
      render: (code) => <Tag color="blue">{code}</Tag>,
    },
    {
      title: 'Channel',
      dataIndex: 'channel',
      key: 'channel',
      width: 100,
      render: (channel) => <Tag>{channel}</Tag>,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Notification Templates</h1>
      <p style={{ marginBottom: 24, color: '#666' }}>
        Manage email and SMS notification templates. Click on a row to edit.
      </p>

      <Table
        columns={columns}
        dataSource={mockTemplates}
        rowKey="id"
        pagination={false}
        onRow={(record) => ({
          onClick: () => handleEdit(record),
          style: { cursor: 'pointer' },
        })}
      />

      <Modal
        title={`Edit Template: ${editingTemplate?.code}`}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        width={800}
        footer={null}
        destroyOnClose
      >
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
          <strong>Available Variables:</strong>
          <div style={{ marginTop: 8 }}>
            <Tag>{'{{clientName}}'}</Tag>
            <Tag>{'{{invoiceNumber}}'}</Tag>
            <Tag>{'{{companyName}}'}</Tag>
            <Tag>{'{{amount}}'}</Tag>
            <Tag>{'{{dueDate}}'}</Tag>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="subject"
            label="Subject Template"
            rules={[{ required: true, message: 'Please enter subject' }]}
          >
            <Input placeholder="Enter subject template" />
          </Form.Item>

          <Form.Item
            name="body"
            label="Body Template"
            rules={[{ required: true, message: 'Please enter body' }]}
          >
            <TextArea
              rows={10}
              placeholder="Enter body template..."
              showCount
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Save Template
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
