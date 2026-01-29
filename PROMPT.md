# Financial Management App - Frontend Implementation Guide

## Context
You are a principal engineer implementing the frontend for a financial management application. The architecture, design patterns, and reusable components have already been established. Your task is to build the remaining pages following the exact patterns defined below.

---

## Tech Stack (DO NOT CHANGE)
- **Framework:** NextJS 15 (App Router)
- **UI Library:** Ant Design 5.x
- **State Management:** Zustand (client state) + React Query (server state)
- **Styling:** Tailwind CSS (utilities only) + Ant Design components
- **Forms:** Ant Design Form (built-in validation)
- **Date Handling:** dayjs
- **HTTP Client:** Axios (configured in `lib/api-client.ts`)
- **Notifications:** Custom NotificationProvider (use `useNotification` hook)

---

## Project Structure (STRICTLY FOLLOW)

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Uses AppLayout (already done)
│   │   ├── dashboard/page.tsx      # Dashboard (already done)
│   │   ├── invoices/
│   │   │   ├── page.tsx            # Table view (already done)
│   │   │   └── [id]/page.tsx       # Detail page (TO BUILD)
│   │   ├── payouts/
│   │   │   ├── page.tsx            # Table view (TO BUILD)
│   │   │   └── execute/page.tsx    # Wizard (TO BUILD)
│   │   ├── employees/page.tsx      # Table view (TO BUILD)
│   │   ├── expenses/page.tsx       # Table view (TO BUILD)
│   │   ├── subsidiaries/page.tsx   # Table view (TO BUILD)
│   │   └── settings/
│   │       ├── profile/page.tsx    # Form page (TO BUILD)
│   │       └── notifications/page.tsx # Template editor (TO BUILD)
│   │
├── components/
│   ├── layouts/                    # Layout components (already done)
│   ├── shared/                     # Reusable components (already done)
│   │   ├── PageHeader.tsx
│   │   ├── TableFilters.tsx
│   │   ├── StatusBadge.tsx
│   │   └── CurrencyDisplay.tsx
│   ├── invoices/
│   │   └── InvoiceModal.tsx        # Create/Edit modal (TO BUILD)
│   ├── employees/
│   │   └── EmployeeModal.tsx       # Create/Edit modal (TO BUILD)
│   ├── expenses/
│   │   └── ExpenseModal.tsx        # Create modal (TO BUILD)
│   ├── payouts/
│   │   └── PayoutExecutionWizard.tsx # Multi-step component (TO BUILD)
│   └── subsidiaries/
│       └── SubsidiaryModal.tsx     # Create/Edit modal (TO BUILD)
│
├── hooks/
│   ├── use-invoices.ts             # React Query hooks (already done)
│   ├── use-employees.ts            # (TO BUILD)
│   ├── use-payouts.ts              # (TO BUILD)
│   ├── use-expenses.ts             # (TO BUILD)
│   └── use-subsidiaries.ts         # (TO BUILD)
│
├── stores/
│   ├── auth-store.ts               # (already done)
│   ├── ui-store.ts                 # (already done)
│   └── theme-store.ts              # (already done)
│
├── providers/
│   ├── NotificationProvider.tsx    # (already done)
│   └── ...
│
└── types/
    └── models.ts                   # TypeScript interfaces (TO BUILD)
```

---

## Design Patterns (MANDATORY)

### 1. Table View Pages Pattern

**Every table page MUST follow this structure:**

```typescript
'use client';

import { useState } from 'react';
import { Table, Space, Button, Dropdown, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { TableFilters } from '@/components/shared/TableFilters';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { CurrencyDisplay } from '@/components/shared/CurrencyDisplay';
import { useNotification } from '@/providers/NotificationProvider';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

export default function ResourcePage() {
  const router = useRouter();
  const { openNotificationWithIcon } = useNotification();
  
  // 1. Filter states
  const [search, setSearch] = useState('');
  const [filterOne, setFilterOne] = useState<string | number | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // 2. Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // 3. Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Resource | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // 4. Fetch data with React Query
  const { data, isLoading } = useResources({
    search,
    filterOne,
    page,
    pageSize,
  });

  // 5. Mutations
  const deleteMutation = useDeleteResource();

  // 6. Filter configuration
  const filters = [
    {
      type: 'search' as const,
      name: 'search',
      placeholder: 'Search...',
      value: search,
      onChange: setSearch,
    },
    // Add more filters as needed
  ];

  // 7. Handlers
  const handleCreate = () => {
    setEditingItem(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (item: Resource) => {
    setEditingItem(item);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: 'Delete Resource',
      content: `Are you sure you want to delete ${name}?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          openNotificationWithIcon('Success', 'Deleted successfully', 'success');
        } catch (error) {
          openNotificationWithIcon('Error', 'Delete failed', 'error');
        }
      },
    });
  };

  // 8. Table columns
  const columns: ColumnsType<Resource> = [
    {
      title: 'Column 1',
      dataIndex: 'field1',
      key: 'field1',
      width: 150,
    },
    // Add more columns
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: 'Edit',
                onClick: () => handleEdit(record),
              },
              {
                type: 'divider',
              },
              {
                key: 'delete',
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record.id, record.name),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button type="text" size="small" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      {/* Page Header */}
      <PageHeader
        title="Resources"
        description="Manage resources"
        action={{
          label: 'Create Resource',
          icon: <PlusOutlined />,
          onClick: handleCreate,
        }}
      />

      {/* Filters */}
      <TableFilters filters={filters} onReset={() => setSearch('')} />

      {/* Table */}
      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          onChange: (page, pageSize) => {
            setPage(page);
            setPageSize(pageSize);
          },
        }}
      />

      {/* Modal */}
      <ResourceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        item={editingItem}
        mode={modalMode}
      />
    </div>
  );
}
```

---

### 2. Modal Pattern (Create/Edit)

**Every modal MUST follow this structure:**

```typescript
'use client';

import { Modal, Form, Input, Button, Space } from 'antd';
import { useEffect } from 'react';
import { useCreateResource, useUpdateResource } from '@/hooks/use-resources';
import { useNotification } from '@/providers/NotificationProvider';

interface ResourceModalProps {
  open: boolean;
  onClose: () => void;
  item?: Resource | null;
  mode: 'create' | 'edit';
}

export function ResourceModal({ open, onClose, item, mode }: ResourceModalProps) {
  const [form] = Form.useForm();
  const { openNotificationWithIcon } = useNotification();
  
  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource();

  // Pre-fill form when editing
  useEffect(() => {
    if (item && mode === 'edit') {
      form.setFieldsValue({
        field1: item.field1,
        field2: item.field2,
        // ... other fields
      });
    } else {
      form.resetFields();
    }
  }, [item, mode, form, open]);

  const handleSubmit = async (values: any) => {
    try {
      if (mode === 'create') {
        await createMutation.mutateAsync(values);
        openNotificationWithIcon('Success', 'Created successfully', 'success');
      } else {
        await updateMutation.mutateAsync({ id: item!.id, ...values });
        openNotificationWithIcon('Success', 'Updated successfully', 'success');
      }
      form.resetFields();
      onClose();
    } catch (error) {
      openNotificationWithIcon('Error', 'Operation failed', 'error');
    }
  };

  return (
    <Modal
      title={mode === 'create' ? 'Create Resource' : 'Edit Resource'}
      open={open}
      onCancel={onClose}
      width={700}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="field1"
          label="Field 1"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Input placeholder="Enter value" />
        </Form.Item>

        {/* Add more form fields */}

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
```

---

### 3. React Query Hooks Pattern

**Every resource MUST have these hooks:**

```typescript
// hooks/use-resources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Fetch list
export function useResources(filters: {
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/resources', { params: filters });
      return data;
    },
  });
}

// Fetch single
export function useResource(id: string) {
  return useQuery({
    queryKey: ['resource', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/resources/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// Create
export function useCreateResource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (resource: Partial<Resource>) => {
      const { data } = await apiClient.post('/resources', resource);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

// Update
export function useUpdateResource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...resource }: Partial<Resource> & { id: string }) => {
      const { data } = await apiClient.patch(`/resources/${id}`, resource);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}

// Delete
export function useDeleteResource() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/resources/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
  });
}
```

---

## Implementation Tasks

### Task 1: Type Definitions
**File:** `types/models.ts`

Create TypeScript interfaces for all entities:

```typescript
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
```

---

### Task 2: Build Table View Pages

#### 2.1 Payouts Page (`app/(dashboard)/payouts/page.tsx`)

**Columns:**
- Payout Date
- Employee Name
- Subsidiary
- Amount (use `<CurrencyDisplay>`)
- Type
- Status (use `<StatusBadge>`)
- Paystack Code

**Filters:**
- Search (employee name)
- Subsidiary dropdown
- Status dropdown
- Date range picker

**Actions:**
- View Details
- Retry (if status = FAILED)

**Special Feature:** Add "Execute Payout" button in PageHeader that navigates to `/payouts/execute`

---

#### 2.2 Employees Page (`app/(dashboard)/employees/page.tsx`)

**Columns:**
- Name (first_name + last_name)
- Email
- Subsidiary
- Bank Name
- Account Number
- Salary (use `<CurrencyDisplay>`)
- Status (use `<StatusBadge>`)

**Filters:**
- Search (name/email)
- Subsidiary dropdown
- Status dropdown

**Actions:**
- Edit (opens `<EmployeeModal>`)
- Delete

---

#### 2.3 Expenses Page (`app/(dashboard)/expenses/page.tsx`)

**Columns:**
- Date
- Employee Name
- Category
- Amount (use `<CurrencyDisplay>`)
- Description (ellipsis, max 50 chars)
- Status (use `<StatusBadge>`)

**Filters:**
- Search (employee name)
- Category dropdown
- Status dropdown
- Date range picker

**Actions:**
- Approve (if status = PENDING)
- Reject (if status = PENDING)
- Reimburse (if status = APPROVED)

**Special:** Approve/Reject can be inline buttons, no modal needed. Reimburse should show confirmation modal.

---

#### 2.4 Subsidiaries Page (`app/(dashboard)/subsidiaries/page.tsx`)

**Columns:**
- Logo (image thumbnail, 40x40px)
- Name
- Code
- Template
- Primary Color (show color swatch)
- Active Status (boolean badge)

**Filters:**
- Search (name/code)
- Active status toggle

**Actions:**
- Edit (opens `<SubsidiaryModal>`)
- Deactivate/Activate (toggle is_active)
- Delete (only if no invoices/employees linked)

---

### Task 3: Build Modals

#### 3.1 EmployeeModal (`components/employees/EmployeeModal.tsx`)

**Form Fields:**
- Subsidiary (Select dropdown)
- First Name (Input)
- Last Name (Input)
- Email (Input with email validation)
- Phone Number (Input, optional)
- Bank Name (Input)
- Account Number (Input)
- Account Name (Input)
- Net Salary (InputNumber with ₦ prefix, converts to cents on submit)
- Hire Date (DatePicker)
- Employment Status (Select: ACTIVE, SUSPENDED, TERMINATED)

**Validation:**
- All fields required except phone, termination_date
- Email must be valid format
- Salary must be > 0

---

#### 3.2 ExpenseModal (`components/expenses/ExpenseModal.tsx`)

**Form Fields:**
- Employee (Select dropdown with search)
- Subsidiary (Select dropdown)
- Expense Date (DatePicker, defaults to today)
- Amount (InputNumber with ₦ prefix)
- Category (Select: TRAVEL, MEALS, SUPPLIES, OTHER)
- Description (TextArea)

---

#### 3.3 SubsidiaryModal (`components/subsidiaries/SubsidiaryModal.tsx`)

**Form Fields:**
- Name (Input)
- Code (Input, uppercase, max 20 chars)
- Description (TextArea, optional)
- Logo (Upload component, accept images only)
- Primary Color (ColorPicker)
- Invoice Template (Select: default, cement, auto, logistics)
- Business Address (TextArea, optional)
- Contact Email (Input with email validation, optional)
- Contact Phone (Input, optional)

**Special:**
- Logo upload should show preview
- Color picker should show color swatch preview

---

### Task 4: Build Detail/Wizard Pages

#### 4.1 Invoice Detail Page (`app/(dashboard)/invoices/[id]/page.tsx`)

**Layout:**
- Back button (top left)
- Invoice number (header)
- Action buttons (top right): Send, Download PDF, Edit, Delete

**Sections:**
1. **Invoice Header Card**
   - Client Name, Email, Address
   - Issue Date, Due Date, Payment Terms
   - Total Amount, Balance Due

2. **Line Items Table** (read-only)
   - Description, Quantity, Unit Price, Amount

3. **PDF Preview**
   - If `pdf_storage_url` exists: Embed in iframe
   - If null: Show "PDF not generated yet" + Generate button

4. **Status Timeline** (optional, can skip for MVP)
   - Draft → Sent → Paid

**Special:**
- Send button should open confirmation modal with recipient email
- Edit button only enabled if status = DRAFT

---

#### 4.2 Payout Execution Wizard (`app/(dashboard)/payouts/execute/page.tsx`)

**Multi-step flow:**

**Step 1: Employee Selection**
- Table with checkboxes
- Show: Name, Subsidiary, Salary
- "Next" button (disabled if no selection)

**Step 2: Dry Run**
- Display selected employees count
- Total payout amount
- Current wallet balance
- Shortfall (if any)
- "Request OTP" button (disabled if insufficient funds)

**Step 3: OTP Verification**
- Input field for 6-digit OTP
- "Resend OTP" button
- Countdown timer (5 minutes)
- "Verify & Execute" button

**Step 4: Execution**
- Loading spinner with message "Processing payouts..."
- DO NOT allow user to navigate away

**Step 5: Results**
- Summary: X successful, Y failed
- Table showing each payout result
- "Done" button returns to /payouts

**Implementation Note:**
- Use Ant Design Steps component
- Store state in component (useState)
- Call API hooks: `useDryRunPayout`, `useRequestOTP`, `useVerifyOTP`, `useExecutePayout`

---

#### 4.3 Profile Settings (`app/(dashboard)/settings/profile/page.tsx`)

**Layout:**
Two cards side-by-side:

**Card 1: Profile Information**
- Email (Input)
- Phone (Input)
- Username (Input, disabled/read-only)
- "Save Changes" button

**Card 2: Change Password**
- Current Password (Input.Password)
- New Password (Input.Password)
- Confirm New Password (Input.Password)
- "Update Password" button

**Validation:**
- Passwords must match
- New password min 8 characters

---

#### 4.4 Notification Templates (`app/(dashboard)/settings/notifications/page.tsx`)

**Layout:**
- Table showing all templates
- Columns: Template Code, Channel, Subject (truncated), Last Updated
- Click row to open edit modal

**Edit Modal:**
- Template Code (read-only, badge)
- Channel (read-only, badge)
- Subject Template (Input)
- Body Template (TextArea, large)
- Variable Hints (info box showing {{clientName}}, {{invoiceNumber}}, etc.)
- Preview section (optional, can skip)
- "Save Template" button

---

## Critical Rules

### 1. **DO NOT deviate from patterns**
- All table pages use `PageHeader` + `TableFilters` + `Table`
- All modals use `Form` + validation + loading states
- All mutations invalidate React Query cache

### 2. **Use existing components**
- Import from `@/components/shared/...`
- DO NOT create duplicate components

### 3. **TypeScript is mandatory**
- Define proper interfaces in `types/models.ts`
- Use `ColumnsType<T>` for table columns
- No `any` types (use proper types from interfaces)

### 4. **Notifications**
- Always use `useNotification` hook
- Success: green notification
- Error: red notification
- Format: `openNotificationWithIcon(title, description, type)`

### 5. **Currency handling**
- Backend sends/receives amounts in cents (BIGINT)
- Display using `<CurrencyDisplay cents={amount} />`
- When submitting forms, convert `amount * 100` to cents

### 6. **Date handling**
- Use `dayjs` for all date operations
- Display: `dayjs(date).format('DD MMM YYYY')`
- Forms: Use Ant Design `<DatePicker>`
- API sends ISO strings, convert to Dayjs for display

### 7. **API endpoints**
All endpoints are prefixed with `/api` (configured in `apiClient`):
- GET `/resources` - List with filters
- POST `/resources` - Create
- GET `/resources/:id` - Get single
- PATCH `/resources/:id` - Update
- DELETE `/resources/:id` - Delete

### 8. **Loading states**
- Tables: `loading={isLoading}`
- Buttons: `loading={mutation.isPending}`
- Forms: Disable submit button while loading

### 9. **Error handling**
- React Query handles errors automatically
- Display user-friendly messages via notifications
- DO NOT show raw error objects to users

---

## Deliverables Checklist

### Pages (9 total)
- [x] Payouts table page
- [x] Employees table page
- [x] Expenses table page
- [x] Subsidiaries table page
- [x] Invoice detail page
- [x] Payout execution wizard
- [x] Profile settings page
- [x] Notification templates page

### Modals (3 total)
- [x] EmployeeModal
- [x] ExpenseModal
- [x] SubsidiaryModal

### Additional Modals
- [x] InvoiceModal

### Hooks (4 files)
- [x] use-employees.ts
- [x] use-payouts.ts
- [x] use-expenses.ts
- [x] use-subsidiaries.ts

### Types (1 file)
- [x] types/models.ts (all interfaces)

---

## Testing Checklist

For each page/modal, verify:
- [ ] TypeScript compiles with no errors
- [ ] UI matches design pattern (PageHeader, filters, table/form)
- [ ] Create operation works (modal opens, form submits, notification shows)
- [ ] Edit operation works (modal pre-fills, saves changes)
- [ ] Delete operation works (confirmation modal, deletes item)
- [ ] Filters work (search, dropdowns, date ranges)
- [ ] Pagination works
- [ ] Loading states display correctly
- [ ] Error states display notifications
- [ ] Mobile responsive (table scrolls horizontally)

---

## Example API Response Format

```json
// GET /invoices
{
  "data": [
    {
      "id": "uuid-123",
      "invoice_number": "INV-001",
      "subsidiary": { "id": "sub-1", "name": "Cement Division" },
      "client_name": "John Doe",
      "total_cents": 500000,
      "status": "SENT",
      "issue_date": "2025-01-15T00:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 10
}

// POST /invoices (request body)
{
  "subsidiaryId": "sub-1",
  "clientName": "John Doe",
  "clientEmail": "john@example.com",
  "issueDate": "2025-01-15",
  "dueDate": "2025-01-22",
  "lineItems": [
    {
      "description": "Item 1",
      "quantity": 2,
      "unitPrice": 25000 // Send in cents (250.00 NGN)
    }
  ]
}
```

---

## Start Here

1. Create `types/models.ts` with all interfaces
2. Build React Query hooks for each resource
3. Build table pages (Payouts, Employees, Expenses, Subsidiaries)
4. Build modals (Employee, Expense, Subsidiary)
5. Build detail pages (Invoice detail, Payout execution)
6. Build settings pages (Profile, Notifications)

Follow the patterns exactly. Copy from the Invoice page example. Good luck! 🚀
