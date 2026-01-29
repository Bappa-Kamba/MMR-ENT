'use client';

import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, Space, Tabs, Row, Col } from 'antd';
import { useEffect } from 'react';
import { useCreateExpense } from '@/hooks/use-expenses';
import { useNotification } from '@/providers/NotificationProvider';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExpenseModal({ open, onClose }: ExpenseModalProps) {
  const [form] = Form.useForm();
  const { openNotificationWithIcon } = useNotification();
  
  const createMutation = useCreateExpense();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        expense_date: dayjs(), // Default to today
      });
    } else {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        amount_cents: Math.round(values.amount * 100), // Convert to cents
        expense_date: values.expense_date.toISOString(),
      };

      await createMutation.mutateAsync(payload);
      openNotificationWithIcon('Success', 'Expense created successfully', 'success');
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error ", error);
      openNotificationWithIcon('Error', 'Failed to create expense. Please try again.', 'error');
    }
  };

  return (
    <Modal
      title="Create Expense"
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tabs
            defaultActiveKey="info"
            size="small"
            tabBarGutter={32}
            items={[
                {
                    key: 'info',
                    label: 'Expense Info',
                    forceRender: true,
                    children: (
                    <>
                        <Form.Item
                        name="employeeId"
                        label="Employee"
                        rules={[{ required: true, message: 'Please select an employee' }]}
                        >
                        <Select
                            placeholder="Select employee"
                            showSearch
                            optionFilterProp="children"
                        >
                            {/* TODO: Load from API */}
                            <Select.Option value="emp1">John Doe</Select.Option>
                            <Select.Option value="emp2">Jane Smith</Select.Option>
                        </Select>
                        </Form.Item>
                        <Form.Item
                        name="subsidiaryId"
                        label="Subsidiary"
                        rules={[{ required: true, message: 'Please select a subsidiary' }]}
                        >
                        <Select placeholder="Select subsidiary">
                            <Select.Option value="cement">Cement Division</Select.Option>
                            <Select.Option value="auto">Automobiles</Select.Option>
                            <Select.Option value="logistics">Logistics</Select.Option>
                        </Select>
                        </Form.Item>
                        <Form.Item
                        name="expense_date"
                        label="Expense Date"
                        rules={[{ required: true, message: 'Please select date' }]}
                        >
                        <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </>
                    ),
                },
                {
                    key: 'details',
                    label: 'Details',
                    forceRender: true,
                    children: (
                    <>
                        <Form.Item
                        name="category"
                        label="Category"
                        rules={[{ required: true, message: 'Please select a category' }]}
                        >
                        <Select placeholder="Select category">
                            <Select.Option value="TRAVEL">Travel</Select.Option>
                            <Select.Option value="MEALS">Meals</Select.Option>
                            <Select.Option value="SUPPLIES">Supplies</Select.Option>
                            <Select.Option value="OTHER">Other</Select.Option>
                        </Select>
                        </Form.Item>
                        <Form.Item
                        name="amount"
                        label="Amount (₦)"
                        rules={[
                            { required: true, message: 'Please enter amount' },
                            { type: 'number', min: 1, message: 'Amount must be greater than 0' }
                        ]}
                        >
                        <InputNumber
                            placeholder="Enter amount"
                            style={{ width: '100%' }}
                            formatter={value => `₦ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={value => value!.replace(/₦\s?|(,*)/g, '')}
                        />
                        </Form.Item>
                        <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description' }]}
                        >
                        <TextArea
                            rows={4}
                            placeholder="Enter expense description..."
                            maxLength={500}
                            showCount
                        />
                        </Form.Item>
                    </>
                    ),
                },
            ]}
        />
        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={createMutation.isPending}
            >
              Create
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
