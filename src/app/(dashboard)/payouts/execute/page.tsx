'use client';

import { useState } from 'react';
import { Steps, Card, Table, Button, Space, Input, Statistic, Row, Col, Alert, Spin, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useEmployees } from '@/hooks/use-employees';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useNotification } from '@/providers/NotificationProvider';
import type { Employee } from '@/types/models';

export default function PayoutExecutionPage() {
  const router = useRouter();
  const { openNotificationWithIcon } = useNotification();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [executing, setExecuting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const { data: employeesData } = useEmployees({ page: 1, pageSize: 100 });

  const calculateTotalPayout = () => {
    if (!employeesData?.data) return 0;
    return selectedEmployees.reduce((sum, id) => {
      const employee = employeesData.data.find((e: Employee) => e.id === id);
      return sum + (employee?.net_salary_cents || 0);
    }, 0);
  };

  const mockWalletBalance = 50000000; // ₦500,000 in cents

  const handleNext = () => {
    if (currentStep === 0 && selectedEmployees.length === 0) {
      openNotificationWithIcon('Error', 'Please select at least one employee', 'error');
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleRequestOTP = () => {
    // TODO: Call API to request OTP
    openNotificationWithIcon('Success', 'OTP sent to your email', 'success');
    // Start countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleExecute = async () => {
    if (!otp || otp.length !== 6) {
      openNotificationWithIcon('Error', 'Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setExecuting(true);
    setCurrentStep(3); // Move to execution step

    // Simulate execution
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock results
    const mockResults = selectedEmployees.map((id) => {
      const employee = employeesData?.data.find((e: Employee) => e.id === id);
      return {
        id,
        employee_name: `${employee?.first_name} ${employee?.last_name}`,
        amount_cents: employee?.net_salary_cents || 0,
        status: Math.random() > 0.1 ? 'SUCCESS' : 'FAILED',
        message: Math.random() > 0.1 ? 'Transfer successful' : 'Insufficient funds',
      };
    });

    setResults(mockResults);
    setExecuting(false);
    setCurrentStep(4); // Move to results step
  };

  const employeeColumns = [
    {
      title: 'Name',
      key: 'name',
      render: (_: any, record: Employee) => `${record.first_name} ${record.last_name}`,
    },
    {
      title: 'Subsidiary',
      dataIndex: ['subsidiary', 'name'],
      key: 'subsidiary',
    },
    {
      title: 'Salary',
      dataIndex: 'net_salary_cents',
      key: 'salary',
      align: 'right' as const,
      render: (cents: number) => <CurrencyDisplay cents={cents} />,
    },
  ];

  const resultColumns = [
    {
      title: 'Employee',
      dataIndex: 'employee_name',
      key: 'employee_name',
    },
    {
      title: 'Amount',
      dataIndex: 'amount_cents',
      key: 'amount',
      align: 'right' as const,
      render: (cents: number) => <CurrencyDisplay cents={cents} />,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'SUCCESS' ? 'green' : 'red' }}>
          {status === 'SUCCESS' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} {status}
        </span>
      ),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      key: 'message',
    },
  ];

  const steps = [
    {
      title: 'Select Employees',
      content: (
        <Card>
          <Table
            columns={employeeColumns}
            dataSource={employeesData?.data || []}
            rowKey="id"
            rowSelection={{
              selectedRowKeys: selectedEmployees,
              onChange: (keys) => setSelectedEmployees(keys as string[]),
            }}
            pagination={{ pageSize: 10 }}
          />
          <div style={{ marginTop: 16, textAlign: 'right' }}>
            <Button type="primary" onClick={handleNext} disabled={selectedEmployees.length === 0}>
              Next
            </Button>
          </div>
        </Card>
      ),
    },
    {
      title: 'Dry Run',
      content: (
        <Card>
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={8}>
              <Statistic title="Selected Employees" value={selectedEmployees.length} />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Total Payout" 
                value={calculateTotalPayout() / 100} 
                prefix="₦"
                precision={2}
              />
            </Col>
            <Col span={8}>
              <Statistic 
                title="Wallet Balance" 
                value={mockWalletBalance / 100} 
                prefix="₦"
                precision={2}
              />
            </Col>
          </Row>

          {calculateTotalPayout() > mockWalletBalance && (
            <Alert
              message="Insufficient Funds"
              description={`Shortfall: ₦${((calculateTotalPayout() - mockWalletBalance) / 100).toFixed(2)}`}
              type="error"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          <Space>
            <Button onClick={handleBack}>Back</Button>
            <Button 
              type="primary" 
              onClick={handleRequestOTP}
              disabled={calculateTotalPayout() > mockWalletBalance}
            >
              Request OTP
            </Button>
            <Button type="primary" onClick={handleNext}>
              Next
            </Button>
          </Space>
        </Card>
      ),
    },
    {
      title: 'OTP Verification',
      content: (
        <Card>
          <div style={{ maxWidth: 400, margin: '0 auto' }}>
            <p>Enter the 6-digit OTP sent to your email:</p>
            <Input
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              style={{ fontSize: 24, textAlign: 'center', marginBottom: 16 }}
            />
            <p style={{ textAlign: 'center', color: '#666' }}>
              Time remaining: {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}
            </p>
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button onClick={handleBack}>Back</Button>
              <Button onClick={handleRequestOTP}>Resend OTP</Button>
              <Button type="primary" onClick={handleExecute} disabled={otp.length !== 6}>
                Verify & Execute
              </Button>
            </Space>
          </div>
        </Card>
      ),
    },
    {
      title: 'Execution',
      content: (
        <Card>
          <div style={{ textAlign: 'center', padding: 48 }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, fontSize: 16 }}>Processing payouts...</p>
            <p style={{ color: '#666' }}>Please do not navigate away from this page</p>
          </div>
        </Card>
      ),
    },
    {
      title: 'Results',
      content: (
        <Card>
          <Result
            status={results.filter(r => r.status === 'FAILED').length === 0 ? 'success' : 'warning'}
            title={`Payout Execution Complete`}
            subTitle={`${results.filter(r => r.status === 'SUCCESS').length} successful, ${results.filter(r => r.status === 'FAILED').length} failed`}
          />
          
          <Table
            columns={resultColumns}
            dataSource={results}
            rowKey="id"
            pagination={false}
          />

          <div style={{ marginTop: 24, textAlign: 'center' }}>
            <Button type="primary" size="large" onClick={() => router.push('/payouts')}>
              Done
            </Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>Execute Payout</h1>
      
      <Steps 
        current={currentStep} 
        style={{ marginBottom: 24 }}
        items={steps.map((step) => ({ title: step.title }))}
      />

      <div>{steps[currentStep].content}</div>
    </div>
  );
}
