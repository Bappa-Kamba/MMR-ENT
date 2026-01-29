'use client';

import { Modal, Form, Input, InputNumber, Select, DatePicker, Button, Space, Tabs } from 'antd';
import { useEffect } from 'react';
import { useCreateEmployee, useUpdateEmployee } from '@/hooks/use-employees';
import { useNotification } from '@/providers/NotificationProvider';
import type { Employee } from '@/types/models';
import dayjs from 'dayjs';

interface EmployeeModalProps {
  open: boolean;
  onClose: () => void;
  item?: Employee | null;
  mode: 'create' | 'edit';
}

export function EmployeeModal({ open, onClose, item, mode }: EmployeeModalProps) {
  const [form] = Form.useForm();
  const { openNotificationWithIcon } = useNotification();
  
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();

  // Pre-fill form when editing
  useEffect(() => {
    if (item && mode === 'edit') {
      form.setFieldsValue({
        first_name: item.first_name,
        last_name: item.last_name,
        email: item.email,
        phone_number: item.phone_number,
        subsidiaryId: item.subsidiary.id,
        employment_status: item.employment_status,
        hire_date: dayjs(item.hire_date),
        bank_name: item.bank_name,
        account_number: item.account_number,
        account_name: item.account_name,
        net_salary: item.net_salary_cents / 100,
        paystack_recipient_code: item.paystack_recipient_code,
      });
    } else {
      form.resetFields();
    }
  }, [item, mode, form, open]);

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        net_salary_cents: Math.round(values.net_salary * 100),
        hire_date: values.hire_date.toISOString(),
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        openNotificationWithIcon('Success', 'Employee created successfully', 'success');
      } else {
        await updateMutation.mutateAsync({ id: item!.id, ...payload });
        openNotificationWithIcon('Success', 'Employee updated successfully', 'success');
      }
      form.resetFields();
      onClose();
    } catch (error) {
      console.error("Error ", error);
      openNotificationWithIcon('Error', 'Operation failed. Please try again.', 'error');
    }
  };

  const subsidiaryOptions = [
    { label: 'Cement Division', value: 'cement' },
    { label: 'Automobiles', value: 'auto' },
    { label: 'Logistics', value: 'logistics' },
  ];

  const statusOptions = [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Suspended', value: 'SUSPENDED' },
    { label: 'Terminated', value: 'TERMINATED' },
  ];

  return (
    <Modal
      title={mode === 'create' ? 'Create Employee' : 'Edit Employee'}
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tabs
          defaultActiveKey="personal"
          size="small"
          tabBarGutter={32}
          items={[
            {
              key: 'personal',
              label: 'Personal Info',
              forceRender: true,
              children: (
                <>
                  <Form.Item
                    name="first_name"
                    label="First Name"
                    rules={[{ required: true, message: 'Please enter first name' }]}
                  >
                    <Input placeholder="Enter first name" />
                  </Form.Item>
                  <Form.Item
                    name="last_name"
                    label="Last Name"
                    rules={[{ required: true, message: 'Please enter last name' }]}
                  >
                    <Input placeholder="Enter last name" />
                  </Form.Item>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: 'Please enter email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="employee@example.com" />
                  </Form.Item>
                  <Form.Item name="phone_number" label="Phone Number">
                    <Input placeholder="+234 XXX XXX XXXX" />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'employment',
              label: 'Employment',
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
                    name="employment_status"
                    label="Employment Status"
                    rules={[{ required: true, message: 'Please select status' }]}
                  >
                    <Select options={statusOptions} placeholder="Select status" />
                  </Form.Item>
                  <Form.Item
                    name="hire_date"
                    label="Hire Date"
                    rules={[{ required: true, message: 'Please select hire date' }]}
                  >
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'bank',
              label: 'Bank Details',
              forceRender: true,
              children: (
                <>
                  <Form.Item
                    name="bank_name"
                    label="Bank Name"
                    rules={[{ required: true, message: 'Please enter bank name' }]}
                  >
                    <Input placeholder="Enter bank name" />
                  </Form.Item>
                  <Form.Item
                    name="account_number"
                    label="Account Number"
                    rules={[{ required: true, message: 'Please enter account number' }]}
                  >
                    <Input placeholder="Enter account number" />
                  </Form.Item>
                  <Form.Item
                    name="account_name"
                    label="Account Name"
                    rules={[{ required: true, message: 'Please enter account name' }]}
                  >
                    <Input placeholder="Enter account name" />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'salary',
              label: 'Salary',
              forceRender: true,
              children: (
                <>
                  <Form.Item
                    name="net_salary"
                    label="Net Salary"
                    rules={[
                      { required: true, message: 'Please enter salary' },
                      { type: 'number', min: 1, message: 'Salary must be greater than 0' }
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      prefix="₦"
                      placeholder="Enter monthly salary"
                      formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value!.replace(/,/g, '') as any}
                    />
                  </Form.Item>
                  <Form.Item name="paystack_recipient_code" label="Paystack Recipient Code">
                    <Input disabled placeholder="Auto-generated on first payout" />
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
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
