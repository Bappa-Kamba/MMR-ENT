'use client';

import { Tag } from 'antd';

const statusColors: Record<string, string> = {
  // Invoice statuses
  DRAFT: 'default',
  SENT: 'processing',
  PAID: 'success',
  OVERDUE: 'error',
  CANCELLED: 'default',
  
  // Payout statuses
  PENDING: 'warning',
  PROCESSING: 'processing',
  COMPLETED: 'success',
  FAILED: 'error',
  
  // Employee statuses
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  TERMINATED: 'error',
  
  // Expense statuses
  APPROVED: 'success',
  REJECTED: 'error',
  REIMBURSED: 'success',
};

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Tag color={statusColors[status] || 'default'}>
      {status}
    </Tag>
  );
}
