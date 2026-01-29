'use client';

import { useParams, useRouter } from 'next/navigation';
import { Card, Button, Space, Descriptions, Table, Modal, Spin, Alert } from 'antd';
import { ArrowLeftOutlined, SendOutlined, DownloadOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useInvoice, useDeleteInvoice, useSendInvoice } from '@/hooks/use-invoices';
import { useNotification } from '@/providers/NotificationProvider';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { StatusBadge } from '@/components/shared/StatusBadge';
import type { ColumnsType } from 'antd/es/table';
import type { InvoiceLineItem } from '@/types/models';
import dayjs from 'dayjs';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { openNotificationWithIcon } = useNotification();
  const invoiceId = params.id as string;

  const { data: invoice, isLoading } = useInvoice(invoiceId);
  const deleteMutation = useDeleteInvoice();
  const sendMutation = useSendInvoice();

  const handleBack = () => {
    router.push('/invoices');
  };

  const handleSend = () => {
    Modal.confirm({
      title: 'Send Invoice',
      content: `Send invoice to ${invoice?.client_email}?`,
      okText: 'Send',
      onOk: async () => {
        try {
          await sendMutation.mutateAsync(invoiceId);
          openNotificationWithIcon('Success', 'Invoice sent successfully', 'success');
        } catch (error) {
          openNotificationWithIcon('Error', 'Failed to send invoice', 'error');
        }
      },
    });
  };

  const handleDownload = () => {
    if (invoice?.pdf_storage_url) {
      window.open(invoice.pdf_storage_url, '_blank');
    } else {
      openNotificationWithIcon('Info', 'PDF not yet generated', 'info');
    }
  };

  const handleEdit = () => {
    router.push(`/invoices/${invoiceId}/edit`);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Invoice',
      content: `Are you sure you want to delete invoice ${invoice?.invoice_number}?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(invoiceId);
          openNotificationWithIcon('Success', 'Invoice deleted', 'success');
          router.push('/invoices');
        } catch (error) {
          openNotificationWithIcon('Error', 'Failed to delete invoice', 'error');
        }
      },
    });
  };

  const lineItemColumns: ColumnsType<InvoiceLineItem> = [
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price_cents',
      key: 'unit_price_cents',
      width: 150,
      align: 'right',
      render: (cents) => <CurrencyDisplay cents={cents} />,
    },
    {
      title: 'Amount',
      dataIndex: 'amount_cents',
      key: 'amount_cents',
      width: 150,
      align: 'right',
      render: (cents) => <CurrencyDisplay cents={cents} />,
    },
  ];

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <Alert
        message="Invoice Not Found"
        description="The invoice you're looking for doesn't exist."
        type="error"
        showIcon
      />
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            Back
          </Button>
          <div>
            <h1 style={{ margin: 0, fontSize: 24 }}>Invoice {invoice.invoice_number}</h1>
            <div style={{ marginTop: 4 }}>
              <StatusBadge status={invoice.status} />
            </div>
          </div>
        </div>
        
        <Space>
          <Button icon={<SendOutlined />} onClick={handleSend} disabled={invoice.status === 'PAID'}>
            Send
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleDownload}>
            Download PDF
          </Button>
          <Button icon={<EditOutlined />} onClick={handleEdit} disabled={invoice.status !== 'DRAFT'}>
            Edit
          </Button>
          <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
            Delete
          </Button>
        </Space>
      </div>

      {/* Invoice Header Card */}
      <Card title="Invoice Details" style={{ marginBottom: 16 }}>
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Client Name">{invoice.client_name}</Descriptions.Item>
          <Descriptions.Item label="Client Email">{invoice.client_email}</Descriptions.Item>
          <Descriptions.Item label="Client Address" span={2}>
            {invoice.client_address || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Subsidiary">{invoice.subsidiary.name}</Descriptions.Item>
          <Descriptions.Item label="Payment Terms">{invoice.payment_terms}</Descriptions.Item>
          <Descriptions.Item label="Issue Date">
            {dayjs(invoice.issue_date).format('DD MMM YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Due Date">
            {dayjs(invoice.due_date).format('DD MMM YYYY')}
          </Descriptions.Item>
          <Descriptions.Item label="Total Amount">
            <strong><CurrencyDisplay cents={invoice.total_cents} /></strong>
          </Descriptions.Item>
          <Descriptions.Item label="Balance Due">
            <strong style={{ color: invoice.balance_due_cents > 0 ? 'var(--error)' : 'var(--success)' }}>
              <CurrencyDisplay cents={invoice.balance_due_cents} />
            </strong>
          </Descriptions.Item>
        </Descriptions>
        
        {invoice.notes && (
          <div style={{ marginTop: 16 }}>
            <strong>Notes:</strong>
            <p style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{invoice.notes}</p>
          </div>
        )}
      </Card>

      {/* Line Items */}
      <Card title="Line Items" style={{ marginBottom: 16 }}>
        <Table
          columns={lineItemColumns}
          dataSource={invoice.lineItems}
          pagination={false}
          rowKey="id"
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <strong>Total:</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} align="right">
                  <strong><CurrencyDisplay cents={invoice.total_cents} /></strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      {/* PDF Preview */}
      <Card title="PDF Preview">
        {invoice.pdf_storage_url ? (
          <iframe
            src={invoice.pdf_storage_url}
            style={{ width: '100%', height: 600, border: 'none' }}
            title="Invoice PDF"
          />
        ) : (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <p>PDF not generated yet</p>
            <Button type="primary">Generate PDF</Button>
          </div>
        )}
      </Card>
    </div>
  );
}
