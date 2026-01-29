'use client';

import { Modal, Form, Input, DatePicker, Select, Button, Space, Tabs, InputNumber } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { useEffect } from 'react';
import { useCreateInvoice, useUpdateInvoice } from '@/hooks/use-invoices';
import { useNotification } from '@/providers/NotificationProvider';
import type { Invoice } from '@/types/models';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface InvoiceModalProps {
  open: boolean;
  onClose: () => void;
  item?: Invoice | null;
  mode: 'create' | 'edit';
}

export function InvoiceModal({ open, onClose, item, mode }: InvoiceModalProps) {
  const [form] = Form.useForm();
  const { openNotificationWithIcon } = useNotification();
  
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();

  // Pre-fill form when editing
  useEffect(() => {
    if (item && mode === 'edit') {
      form.setFieldsValue({
        subsidiaryId: item.subsidiary.id,
        client_name: item.client_name,
        client_email: item.client_email,
        client_address: item.client_address,
        issue_date: dayjs(item.issue_date),
        due_date: dayjs(item.due_date),
        payment_terms: item.payment_terms,
        notes: item.notes,
        lineItems: item.lineItems?.map(li => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unit_price_cents / 100,
        })) || [{ description: '', quantity: 1, unitPrice: 0 }],
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
      });
    }
  }, [item, mode, form, open]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        issue_date: values.issue_date.toISOString(),
        due_date: values.due_date.toISOString(),
        lineItems: values.lineItems.map((item: any) => ({
          description: item.description,
          quantity: item.quantity,
          unit_price_cents: Math.round(item.unitPrice * 100),
          amount_cents: Math.round(item.quantity * item.unitPrice * 100),
        })),
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        openNotificationWithIcon('Success', 'Invoice created successfully', 'success');
      } else {
        await updateMutation.mutateAsync({ id: item!.id, ...payload });
        openNotificationWithIcon('Success', 'Invoice updated successfully', 'success');
      }
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error ", error);
      openNotificationWithIcon('Error', 'Operation failed. Please try again.', 'error');
    }
  };

  const paymentTermsOptions = [
    { label: '7 Days', value: '7 Days' },
    { label: 'Net 30', value: 'Net 30' },
    { label: 'Net 60', value: 'Net 60' },
  ];

  const subsidiaryOptions = [
    { label: 'Cement Division', value: 'cement' },
    { label: 'Automobiles', value: 'auto' },
    { label: 'Logistics', value: 'logistics' },
  ];

  return (
    <Modal
      title={mode === 'create' ? 'Create Invoice' : 'Edit Invoice'}
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tabs
          defaultActiveKey="basic"
          size="small"
          tabBarGutter={32}
          items={[
            {
              key: 'basic',
              label: 'Basic Info',
              forceRender: true,
              children: (
                <>
                  <Form.Item
                    name="subsidiaryId"
                    label="Subsidiary"
                    rules={[{ required: true, message: 'Please select a subsidiary' }]}
                  >
                    <Select options={subsidiaryOptions} placeholder="Select subsidiary" />
                  </Form.Item>
                  <Form.Item
                    name="client_name"
                    label="Client Name"
                    rules={[{ required: true, message: 'Please enter client name' }]}
                  >
                    <Input placeholder="Enter client name" />
                  </Form.Item>
                  <Form.Item
                    name="client_email"
                    label="Client Email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="client@example.com" />
                  </Form.Item>
                  <Form.Item name="client_address" label="Client Address">
                    <TextArea rows={2} placeholder="Enter client address..." />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'dates',
              label: 'Dates & Terms',
              forceRender: true,
              children: (
                <>
                  <Form.Item
                    name="issue_date"
                    label="Issue Date"
                    rules={[{ required: true, message: 'Please select issue date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    name="due_date"
                    label="Due Date"
                    rules={[{ required: true, message: 'Please select due date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                  <Form.Item
                    name="payment_terms"
                    label="Payment Terms"
                    rules={[{ required: true, message: 'Please select payment terms' }]}
                  >
                    <Select options={paymentTermsOptions} placeholder="Select payment terms" />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'lineItems',
              label: 'Line Items',
              forceRender: true,
              children: (
                <>
                  <Form.List name="lineItems">
                    {(fields, { add, remove }) => (
                      <>
                        {fields.map((field) => (
                          <Space key={field.key} style={{ width: '100%', marginBottom: 8 }} align="start">
                            <Form.Item
                              {...field}
                              name={[field.name, 'description']}
                              style={{ flex: 1, marginBottom: 0 }}
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <TextArea placeholder="Description" rows={2} />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, 'quantity']}
                              style={{ width: 100, marginBottom: 0 }}
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <InputNumber placeholder="Qty" style={{ width: '100%' }} />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[field.name, 'unitPrice']}
                              style={{ width: 150, marginBottom: 0 }}
                              rules={[{ required: true, message: 'Required' }]}
                            >
                              <InputNumber 
                                placeholder="Price" 
                                min={0} 
                                prefix="₦" 
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => value!.replace(/,/g, '') as any}
                              />
                            </Form.Item>
                            {fields.length > 1 && (
                              <MinusCircleOutlined 
                                onClick={() => remove(field.name)} 
                                style={{ color: '#ff4d4f', fontSize: 18 }} 
                              />
                            )}
                          </Space>
                        ))}
                        <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                          Add Line Item
                        </Button>
                      </>
                    )}
                  </Form.List>
                </>
              ),
            },
            {
              key: 'notes',
              label: 'Additional Info',
              forceRender: true,
              children: (
                <>
                  <Form.Item name="vinNumber" label="VIN Number">
                    <Input placeholder="Vehicle Identification Number (optional)" />
                  </Form.Item>
                  <Form.Item name="notes" label="Notes">
                    <TextArea rows={4} placeholder="Additional notes..." />
                  </Form.Item>
                </>
              ),
            },
          ]}
        />

        {/* Footer Actions (outside tabs) */}
        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {mode === 'create' ? 'Create Invoice' : 'Save Changes'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
