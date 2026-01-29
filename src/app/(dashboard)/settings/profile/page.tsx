'use client';

import { Card, Form, Input, Button, Space, Row, Col, message } from 'antd';
import { useState } from 'react';
import { useNotification } from '@/providers/NotificationProvider';

export default function ProfileSettingsPage() {
  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const { openNotificationWithIcon } = useNotification();
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileSubmit = async (values: any) => {
    setLoadingProfile(true);
    try {
      // TODO: Call API to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      openNotificationWithIcon('Success', 'Profile updated successfully', 'success');
    } catch (error) {
      openNotificationWithIcon('Error', 'Failed to update profile', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (values: any) => {
    setLoadingPassword(true);
    try {
      // TODO: Call API to change password
      await new Promise(resolve => setTimeout(resolve, 1000));
      openNotificationWithIcon('Success', 'Password changed successfully', 'success');
      passwordForm.resetFields();
    } catch (error) {
      openNotificationWithIcon('Error', 'Failed to change password', 'error');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Profile Settings</h1>
      
      <Row gutter={[24, 24]}>
        {/* Profile Information Card */}
        <Col xs={24} lg={12}>
          <Card title="Profile Information">
            <Form
              form={profileForm}
              layout="vertical"
              onFinish={handleProfileSubmit}
              initialValues={{
                email: 'user@example.com',
                phone: '+234 XXX XXX XXXX',
                username: 'admin',
              }}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter email' },
                  { type: 'email', message: 'Please enter a valid email' }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Phone Number"
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>

              <Form.Item
                name="username"
                label="Username"
              >
                <Input placeholder="Enter username" disabled />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={loadingProfile}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Change Password Card */}
        <Col xs={24} lg={12}>
          <Card title="Change Password">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordSubmit}
            >
              <Form.Item
                name="currentPassword"
                label="Current Password"
                rules={[{ required: true, message: 'Please enter current password' }]}
              >
                <Input.Password placeholder="Enter current password" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="New Password"
                rules={[
                  { required: true, message: 'Please enter new password' },
                  { min: 8, message: 'Password must be at least 8 characters' }
                ]}
              >
                <Input.Password placeholder="Enter new password" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Confirm New Password"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Please confirm your password' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Passwords do not match'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm new password" />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" loading={loadingPassword}>
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
