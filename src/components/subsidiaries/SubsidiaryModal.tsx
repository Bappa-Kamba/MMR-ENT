'use client';

import { Modal, Form, Input, Select, Upload, Button, Space, Tabs, ColorPicker } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useCreateSubsidiary, useUpdateSubsidiary } from '@/hooks/use-subsidiaries';
import { useNotification } from '@/providers/NotificationProvider';
import type { Subsidiary } from '@/types/models';

const { TextArea } = Input;

interface SubsidiaryModalProps {
  open: boolean;
  onClose: () => void;
  item?: Subsidiary | null;
  mode: 'create' | 'edit';
}

export function SubsidiaryModal({ open, onClose, item, mode }: SubsidiaryModalProps) {
  const [form] = Form.useForm();
  const { openNotificationWithIcon } = useNotification();
  const [logoUrl, setLogoUrl] = useState<string | undefined>();
  
  const createMutation = useCreateSubsidiary();
  const updateMutation = useUpdateSubsidiary();

  // Pre-fill form when editing
  useEffect(() => {
    if (item && mode === 'edit') {
      form.setFieldsValue({
        name: item.name,
        code: item.code,
        description: item.description,
        primary_color: item.primary_color,
        invoice_template_id: item.invoice_template_id,
        business_address: item.business_address,
        contact_email: item.contact_email,
        contact_phone: item.contact_phone,
      });
      setLogoUrl(item.logo_url);
    } else {
      form.resetFields();
      setLogoUrl(undefined);
    }
  }, [item, mode, form, open]);

  const handleSubmit = async (values: any) => {
    try {
        // Handle color picker value: if object (from ColorPicker), verify its toHexString method exists
        let colorValue = values.primary_color;
        if (typeof colorValue === 'object' && colorValue !== null && 'toHexString' in colorValue) {
            colorValue = colorValue.toHexString();
        }

      const payload = {
        ...values,
        code: values.code.toUpperCase(),
        primary_color: colorValue,
        logo_url: logoUrl,
      };

      if (mode === 'create') {
        await createMutation.mutateAsync(payload);
        openNotificationWithIcon('Success', 'Subsidiary created successfully', 'success');
      } else {
        await updateMutation.mutateAsync({ id: item!.id, ...payload });
        openNotificationWithIcon('Success', 'Subsidiary updated successfully', 'success');
      }
      form.resetFields();
      setLogoUrl(undefined);
      onClose();
    } catch (error) {
      console.error("Error ", error);
      openNotificationWithIcon('Error', 'Operation failed. Please try again.', 'error');
    }
  };

  const handleLogoUpload = (info: any) => {
    // TODO: Implement actual file upload to storage
    // For now, just show a placeholder
    if (info.file.status === 'done') {
      setLogoUrl(info.file.response?.url || 'https://via.placeholder.com/150');
      openNotificationWithIcon('Success', 'Logo uploaded successfully', 'success');
    }
  };

  return (
    <Modal
      title={mode === 'create' ? 'Create Subsidiary' : 'Edit Subsidiary'}
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
                        <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
                        <Input placeholder="Enter subsidiary name" />
                        </Form.Item>
                        <Form.Item 
                            name="code" 
                            label="Code" 
                            rules={[
                                { required: true, message: 'Please enter code' },
                                { max: 20, message: 'Code must be max 20 characters' }
                            ]}
                        >
                        <Input placeholder="e.g., CEMENT" style={{ textTransform: 'uppercase' }} />
                        </Form.Item>
                        <Form.Item name="description" label="Description">
                        <TextArea rows={3} placeholder="Enter subsidiary description..." maxLength={500} />
                        </Form.Item>
                    </>
                    ),
                },
                {
                    key: 'branding',
                    label: 'Branding',
                    forceRender: true,
                    children: (
                    <>
                        <Form.Item label="Logo" name="logo">
                        <Upload
                            name="logo"
                            listType="picture-card"
                            maxCount={1}
                            onChange={handleLogoUpload}
                            beforeUpload={() => false}
                        >
                            <div>
                                <PlusOutlined />
                                <div style={{ marginTop: 8 }}>Upload</div>
                            </div>
                        </Upload>
                         {logoUrl && (
                            <div style={{ marginTop: 8 }}>
                            <img src={logoUrl} alt="Logo preview" style={{ width: 100, height: 100, objectFit: 'cover' }} />
                            </div>
                        )}
                        </Form.Item>
                        <Form.Item name="primary_color" label="Primary Color">
                        <ColorPicker showText />
                        </Form.Item>
                        <Form.Item name="invoice_template_id" label="Invoice Template" rules={[{ required: true, message: 'Please select template' }]}>
                        <Select options={[
                            { label: 'Default', value: 'default' },
                            { label: 'Cement', value: 'cement' },
                            { label: 'Automobiles', value: 'auto' },
                            { label: 'Logistics', value: 'logistics' },
                        ]} placeholder="Select template" />
                        </Form.Item>
                    </>
                    ),
                },
                {
                    key: 'contact',
                    label: 'Contact Info',
                    forceRender: true,
                    children: (
                    <>
                        <Form.Item name="business_address" label="Business Address">
                        <TextArea rows={2} placeholder="Enter business address..." />
                        </Form.Item>
                        <Form.Item name="contact_email" label="Contact Email" rules={[{ type: 'email', message: 'Please enter a valid email' }]}>
                        <Input placeholder="contact@subsidiary.com" />
                        </Form.Item>
                        <Form.Item name="contact_phone" label="Contact Phone">
                        <Input placeholder="+234 XXX XXX XXXX" />
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
