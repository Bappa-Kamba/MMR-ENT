// Type definitions for all entities in the financial management app

export interface Invoice {
  id: string;
  invoice_number: string;
  subsidiary: {
    id: string;
    name: string;
  };
  client_name: string;
  client_email: string;
  client_address?: string;
  total_cents: number;
  balance_due_cents: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issue_date: string;
  due_date: string;
  payment_terms: string;
  notes?: string;
  pdf_storage_url?: string;
  lineItems: InvoiceLineItem[];
  created_at: string;
  updated_at: string;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  amount_cents: number;
}

export interface Employee {
  id: string;
  subsidiary: {
    id: string;
    name: string;
  };
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  paystack_recipient_code?: string;
  net_salary_cents: number;
  employment_status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  hire_date: string;
  termination_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Payout {
  id: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
  };
  subsidiary: {
    id: string;
    name: string;
  };
  payout_date: string;
  amount_cents: number;
  payout_type: 'SALARY' | 'BONUS' | 'REIMBURSEMENT';
  paystack_transfer_code?: string;
  paystack_status?: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  notes?: string;
  failure_reason?: string;
  created_at: string;
  completed_at?: string;
}

export interface Expense {
  id: string;
  employee: {
    id: string;
    first_name: string;
    last_name: string;
  };
  subsidiary: {
    id: string;
    name: string;
  };
  expense_date: string;
  amount_cents: number;
  category: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REIMBURSED' | 'REJECTED';
  approved_at?: string;
  reimbursed_at?: string;
  notes?: string;
  created_at: string;
}

export interface Subsidiary {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo_url?: string;
  primary_color: string;
  invoice_template_id: string;
  business_address?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
