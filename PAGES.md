# Frontend Remaining Pages - Complete Implementation Guide

## Context
You are completing the frontend for a financial management application. The core architecture, design patterns, and reusable components are already established. Your task is to build the remaining pages and modals following the **exact patterns** already defined.

---

## What's Already Done ✅

### Completed:
- Layout structure (Sidebar, Header, Footer)
- Theming system (dynamic colors via CSS variables)
- Notification system (useNotification hook)
- Shared components (PageHeader, TableFilters, StatusBadge, CurrencyDisplay)
- Table view pattern (demonstrated in `/invoices` page)
- Modal pattern (tabbed modals for create/edit)
- React Query hooks pattern
- TypeScript interfaces in `types/models.ts`
- Global state (Zustand for UI, React Query for server data)

### Reference Files (DO NOT MODIFY):
- `components/shared/PageHeader.tsx`
- `components/shared/TableFilters.tsx`
- `components/shared/StatusBadge.tsx`
- `components/shared/CurrencyDisplay.tsx`
- `components/layouts/AppLayout.tsx`
- `stores/auth-store.ts`
- `stores/ui-store.ts`
- `stores/theme-store.ts`
- `providers/NotificationProvider.tsx`
- `lib/api-client.ts`

---

## Technology Stack (FIXED)

- **Framework:** NextJS 15 (App Router)
- **UI Library:** Ant Design 5.x
- **State:** Zustand (client) + React Query (server)
- **Forms:** Ant Design Form (built-in validation)
- **Styling:** Tailwind CSS (utilities only)
- **Dates:** dayjs
- **HTTP:** Axios (via `apiClient`)
- **Notifications:** Custom `useNotification` hook
- **Icons:** Ant Design Icons

---

## Pages to Build (9 Total)

### Table View Pages (5):
1. Employees (`/employees`)
2. Expenses (`/expenses`)
3. Subsidiaries (`/subsidiaries`)
4. Expense Categories (`/settings/expense-categories`)
5. Receipts (embedded in Invoice Detail, not standalone)

### Detail/Special Pages (4):
6. Invoice Detail (`/invoices/[id]`)
7. Subsidiary Detail (`/subsidiaries/[id]`)
8. Profile Settings (`/settings/profile`)
9. Notification Templates (`/settings/notifications`)

---

## Modals to Build (5 Total)

1. EmployeeModal (create/edit)
2. ExpenseModal (create)
3. ExpenseCategoryModal (create/edit)
4. ReceiptModal (create - always linked to invoice)
5. SubsidiaryModal (quick edit - for basic info only)

---

## CRITICAL: Design Patterns (MANDATORY)

### Pattern 1: Table View Pages

**MUST follow this exact structure:**

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
  
  // Filter states
  const [search, setSearch] = useState('');
  const [filter1, setFilter1] = useState<string | number | undefined>();
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Resource | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Fetch data
  const { data, isLoading } = useResources({ search, filter1, page, pageSize });

  // Mutations
  const deleteMutation = useDeleteResource();

  // Filter configuration
  const filters = [
    {
      type: 'search' as const,
      name: 'search',
      placeholder: 'Search...',
      value: search,
      onChange: setSearch,
    },
    // Add more filters
  ];

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
      content: `Delete ${name}?`,
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

  const columns: ColumnsType<Resource> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Edit', onClick: () => handleEdit(record) },
              { type: 'divider' },
              { key: 'delete', label: 'Delete', danger: true, onClick: () => handleDelete(record.id, record.name) },
            ],
          }}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Resources"
        description="Manage resources"
        action={{ label: 'Create', icon: <PlusOutlined />, onClick: handleCreate }}
      />
      <TableFilters filters={filters} onReset={() => setSearch('')} />
      <Table
        columns={columns}
        dataSource={data?.data || []}
        loading={isLoading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          current: page,
          pageSize,
          total: data?.total || 0,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          onChange: (page, pageSize) => { setPage(page); setPageSize(pageSize); },
        }}
      />
      <ResourceModal open={modalOpen} onClose={() => setModalOpen(false)} item={editingItem} mode={modalMode} />
    </div>
  );
}
```

---

### Pattern 2: Tabbed Modals

**MUST follow this exact structure:**

```typescript
'use client';

import { Modal, Form, Input, Button, Space, Tabs } from 'antd';
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

  useEffect(() => {
    if (item && mode === 'edit') {
      form.setFieldsValue({ /* populate fields */ });
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
      title={mode === 'create' ? 'Create' : 'Edit'}
      open={open}
      onCancel={onClose}
      width={800}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Tabs
          defaultActiveKey="tab1"
          size="small"
          tabBarGutter={32}
          items={[
            {
              key: 'tab1',
              label: 'Tab 1',
              forceRender: true,
              children: (
                <>
                  <Form.Item name="field1" label="Field 1" rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                </>
              ),
            },
          ]}
        />
        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onClose}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending || updateMutation.isPending}>
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

### Pattern 3: React Query Hooks

**MUST create for each resource:**

```typescript
// hooks/use-resources.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useResources(filters: { search?: string; page?: number; pageSize?: number }) {
  return useQuery({
    queryKey: ['resources', filters],
    queryFn: async () => {
      const { data } = await apiClient.get('/resources', { params: filters });
      return data;
    },
  });
}

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

## Detailed Page Specifications

### 1. Employees Page (`/employees`)

**File:** `app/(dashboard)/employees/page.tsx`

**Columns:**
- Name (first_name + last_name combined)
- Email
- Subsidiary (subsidiary.name)
- Bank Name
- Account Number
- Employment Status (use StatusBadge)

**Filters:**
- Search (name/email)
- Subsidiary dropdown
- Status dropdown (ACTIVE, SUSPENDED, TERMINATED)

**Actions:**
- Edit → Opens EmployeeModal
- Delete → Confirmation modal

**Create Button:** Opens EmployeeModal in create mode

---

### 2. Expenses Page (`/expenses`)

**File:** `app/(dashboard)/expenses/page.tsx`

**Columns:**
- Date (expense_date)
- Employee (employee.first_name + last_name)
- Category (category.name)
- Amount (use CurrencyDisplay)
- Description (truncate to 50 chars with ellipsis)
- Status (use StatusBadge)

**Filters:**
- Search (employee name)
- Category dropdown
- Status dropdown
- Date range picker

**Actions:**
- Approve (if status = PENDING, inline button)
- Reject (if status = PENDING, inline button)
- Edit (if status = PENDING)
- Delete

**Create Button:** Opens ExpenseModal

**Special Actions:**
- Approve/Reject should be inline buttons that call API directly (no modal needed)
- Show confirmation toast on success

---

### 3. Subsidiaries Page (`/subsidiaries`)

**File:** `app/(dashboard)/subsidiaries/page.tsx`

**Layout:** Card grid (3 columns, responsive)

**Card Structure:**
```tsx
<Card>
  <div style={{ textAlign: 'center' }}>
    {logo_url && <img src={logo_url} style={{ width: 60, height: 60, borderRadius: 8 }} />}
    <h3>{name}</h3>
    <Tag>{code}</Tag>
    <Divider />
    <Space direction="vertical" size="small">
      <Text>{invoices_count} Invoices</Text>
      <Text>{receipts_count} Receipts</Text>
      <Text>{employees_count} Employees</Text>
    </Space>
    <Divider />
    <Space>
      <Button type="primary" onClick={() => router.push(`/subsidiaries/${id}`)}>Manage</Button>
      <Button onClick={() => handleEdit(subsidiary)}>Edit</Button>
    </Space>
  </div>
</Card>
```

**Actions:**
- **Manage** → Navigate to `/subsidiaries/[id]`
- **Edit** → Opens SubsidiaryModal (basic info only)
- **Deactivate/Delete** → Dropdown menu (check if has invoices/employees first)

**Create Button:** Opens SubsidiaryModal

---

### 4. Expense Categories Page (`/settings/expense-categories`)

**File:** `app/(dashboard)/settings/expense-categories/page.tsx`

**Layout:** Simple table (not card grid)

**Columns:**
- Name
- Code
- Description (truncate)
- Active (Boolean badge)

**Filters:**
- Search (name/code)
- Active status toggle

**Actions:**
- Edit → Opens ExpenseCategoryModal
- Deactivate/Activate → Toggle is_active
- Delete (only if no expenses use it)

**Create Button:** Opens ExpenseCategoryModal

---

### 5. Invoice Detail Page (`/invoices/[id]`)

**File:** `app/(dashboard)/invoices/[id]/page.tsx`

**Layout:**

```
┌─────────────────────────────────────────┐
│ ← Back | Invoice #INV-001    [Send] [Download] [Edit] [Delete]
├─────────────────────────────────────────┤
│ Invoice Header Card                     │
│ - Client: John Doe                      │
│ - Issue: 2025-01-15 | Due: 2025-01-22  │
│ - Status: SENT | Payment: UNPAID        │
│ - Total: ₦50,000 | Received: ₦0        │
│ - Balance Due: ₦50,000                  │
├─────────────────────────────────────────┤
│ Line Items Table (read-only)            │
│ # | Description | Qty | Price | Amount  │
├─────────────────────────────────────────┤
│ Payment History Card                    │
│ [Record Payment] button                 │
│                                         │
│ Receipts table:                         │
│ Receipt # | Date | Amount | Method      │
├─────────────────────────────────────────┤
│ PDF Preview Card (optional)             │
│ <iframe src={pdf_storage_url} />       │
└─────────────────────────────────────────┘
```

**Actions:**
- **Send** → Calls POST `/invoices/:id/send`
- **Download** → Opens PDF in new tab
- **Edit** → Navigate to edit page or open modal (only if status = DRAFT)
- **Delete** → Confirmation modal (only if status = DRAFT)
- **Record Payment** → Opens ReceiptModal

**Payment Status Colors:**
- UNPAID → Red
- PARTIALLY_PAID → Orange
- PAID → Green
- OVERPAID → Purple

---

### 6. Subsidiary Detail Page (`/subsidiaries/[id]`)

**File:** `app/(dashboard)/subsidiaries/[id]/page.tsx`

**Layout:** Tabbed page

**Tabs:**

#### Tab 1: Basic Info (Editable Form)
- Name (Input)
- Code (Input, disabled if subsidiary has invoices)
- Description (TextArea)
- Logo (Upload component)
- Primary Color (ColorPicker)
- Contact info (address, email, phone)
- Active status (Switch)
- **Save Changes** button at bottom

#### Tab 2: Invoice Configuration
- Invoice Prefix (Input)
- Numbering Format (Input with placeholder: {PREFIX}-{YEAR}-{NUMBER})
- Invoice Template Upload:
  - Upload .html or .hbs file
  - Shows current template filename
  - Preview button (optional, can skip for MVP)
  - Reset to default button
- **Save Configuration** button

#### Tab 3: Receipt Configuration
- Same structure as Invoice Configuration
- Receipt Prefix
- Numbering Format
- Receipt Template Upload

#### Tab 4: Invoices (Filtered Table)
- Same invoice table as global page
- Automatically filtered to this subsidiary
- **Create Invoice** button (pre-fills subsidiary_id)

#### Tab 5: Receipts (Filtered Table)
- Table showing all receipts from this subsidiary's invoices
- Columns: Receipt #, Invoice #, Date, Amount, Payment Method, Payer

**Implementation Notes:**
- Template upload uses Ant Design Upload component
- File upload should POST to `/subsidiaries/:id/templates/invoice` or `/subsidiaries/:id/templates/receipt`
- Handle file size limits (max 5MB)
- Accept only .html and .hbs files

---

### 7. Profile Settings Page (`/settings/profile`)

**File:** `app/(dashboard)/settings/profile/page.tsx`

**Layout:** Two cards side-by-side

**Card 1: Profile Information**
```tsx
<Card title="Profile Information">
  <Form>
    <Form.Item name="email" label="Email">
      <Input />
    </Form.Item>
    <Form.Item name="phone_number" label="Phone">
      <Input />
    </Form.Item>
    <Form.Item name="username" label="Username">
      <Input disabled />
    </Form.Item>
    <Button type="primary">Save Changes</Button>
  </Form>
</Card>
```

**Card 2: Change Password**
```tsx
<Card title="Change Password">
  <Form>
    <Form.Item name="current_password" label="Current Password">
      <Input.Password />
    </Form.Item>
    <Form.Item name="new_password" label="New Password" rules={[{ min: 8 }]}>
      <Input.Password />
    </Form.Item>
    <Form.Item name="confirm_password" label="Confirm Password">
      <Input.Password />
    </Form.Item>
    <Button type="primary">Update Password</Button>
  </Form>
</Card>
```

**Validation:**
- Passwords must match
- New password min 8 characters
- Current password required for change

---

### 8. Notification Templates Page (`/settings/notifications`)

**File:** `app/(dashboard)/settings/notifications/page.tsx`

**Layout:** Table with edit modal

**Columns:**
- Template Code (read-only badge)
- Channel (EMAIL/SMS badge)
- Subject (truncated)
- Last Updated

**Actions:**
- Edit → Opens modal with:
  - Template Code (read-only)
  - Channel (read-only)
  - Subject (Input)
  - Body (TextArea, large)
  - Variable hints (info box: "Available: {{clientName}}, {{invoiceNumber}}, etc.")
  - Save button

**No Create/Delete** - Templates are pre-seeded

---

## Modal Specifications

### 1. EmployeeModal

**Tabs:**

#### Tab 1: Personal Info
- First Name
- Last Name
- Email
- Phone Number

#### Tab 2: Employment
- Subsidiary (Select)
- Employment Status (Select: ACTIVE, SUSPENDED, TERMINATED)
- Hire Date (DatePicker)
- Termination Date (DatePicker, optional, only show if status = TERMINATED)

#### Tab 3: Bank Details
- Bank Name
- Account Number
- Account Name

---

### 2. ExpenseModal

**Tabs:**

#### Tab 1: Expense Info
- Employee (Select with search)
- Subsidiary (Select)
- Expense Date (DatePicker, defaults to today)

#### Tab 2: Details
- Category (Select from expense_categories)
- Amount (InputNumber with ₦ prefix)
- Description (TextArea)

**Note:** Amount should be converted to cents on submit (amount * 100)

---

### 3. ExpenseCategoryModal

**Simple Modal (No Tabs):**
- Name (Input)
- Code (Input, uppercase, max 20 chars)
- Description (TextArea)
- Active (Checkbox, default true)

---

### 4. ReceiptModal

**IMPORTANT:** Receipt is ALWAYS linked to an invoice (invoice_id required)

**Tabs:**

#### Tab 1: Payment Info
- Invoice (Select/Display - pre-filled if opened from invoice detail)
- Payment Date (DatePicker, defaults to today)
- Amount Received (InputNumber with ₦ prefix)
- Payment Method (Select: BANK_TRANSFER, CASH, CHEQUE, CARD, MOBILE_MONEY)
- Reference Number (Input, optional)

#### Tab 2: Payer Details
- Payer Name
- Payer Email (optional)
- Payer Phone (optional)
- Payer Address (TextArea, optional)
- Description (TextArea, optional)
- Notes (TextArea, optional)

**Special Logic:**
- When opened from invoice detail page, invoice_id is pre-filled and disabled
- Amount should default to invoice balance_due
- On submit, convert amount to cents (amount * 100)

---

### 5. SubsidiaryModal (Quick Edit)

**Simple Modal (No Tabs) - Basic Info Only:**
- Name
- Code (disabled if subsidiary has invoices)
- Description
- Logo Upload
- Primary Color (ColorPicker)
- Active Status

**Note:** For full editing (templates, etc.), redirect to `/subsidiaries/[id]`

---

## TypeScript Interfaces (Add to `types/models.ts`)

```typescript
export interface Employee {
  id: string;
  subsidiary: { id: string; name: string };
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  employment_status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
  hire_date: string;
  termination_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  employee: { id: string; first_name: string; last_name: string };
  subsidiary: { id: string; name: string };
  category: { id: string; name: string; code: string };
  expense_date: string;
  amount_cents: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: string;
  approved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Receipt {
  id: string;
  receipt_number: string;
  invoice: { id: string; invoice_number: string };
  subsidiary: { id: string; name: string };
  payment_date: string;
  amount_received_cents: number;
  payment_method: 'BANK_TRANSFER' | 'CASH' | 'CHEQUE' | 'CARD' | 'MOBILE_MONEY';
  reference_number?: string;
  payer_name: string;
  payer_email?: string;
  payer_phone?: string;
  payer_address?: string;
  description?: string;
  notes?: string;
  pdf_storage_url?: string;
  status: 'ISSUED' | 'VOID';
  created_at: string;
  updated_at: string;
}

export interface Subsidiary {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo_url?: string;
  primary_color: string;
  invoice_prefix: string;
  receipt_prefix: string;
  invoice_template_url?: string;
  receipt_template_url?: string;
  invoice_numbering_format: string;
  receipt_numbering_format: string;
  business_address?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
  invoices_count?: number;
  receipts_count?: number;
  employees_count?: number;
  created_at: string;
  updated_at: string;
}
```

---

## Critical Rules

### 1. **Currency Handling**
```typescript
// Display
<CurrencyDisplay cents={amount_cents} />

// Form submit (convert to cents)
const payload = {
  ...values,
  amount_cents: Math.round(values.amount * 100)
};

// Form populate (convert from cents)
form.setFieldsValue({
  amount: item.amount_cents / 100
});
```

### 2. **Date Handling**
```typescript
// Display in table
dayjs(date).format('DD MMM YYYY')

// Form populate
form.setFieldsValue({
  date: dayjs(item.date)
});

// Form submit
const payload = {
  date: values.date.format('YYYY-MM-DD')
};
```

### 3. **Status Colors** (Update StatusBadge if needed)
```typescript
const statusColors = {
  ACTIVE: 'success',
  SUSPENDED: 'warning',
  TERMINATED: 'error',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'error',
  UNPAID: 'error',
  PARTIALLY_PAID: 'warning',
  PAID: 'success',
};
```

### 4. **File Upload**
```typescript
<Upload
  maxCount={1}
  beforeUpload={(file) => {
    const isValid = file.type === 'text/html' || file.name.endsWith('.hbs');
    if (!isValid) {
      message.error('Only .html or .hbs files allowed');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB');
    }
    return isValid && isLt5M;
  }}
  customRequest={async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await apiClient.post(`/subsidiaries/${id}/templates/invoice`, formData);
      onSuccess?.('ok');
    } catch (error) {
      onError?.(error);
    }
  }}
>
  <Button icon={<UploadOutlined />}>Upload Template</Button>
</Upload>
```

### 5. **Notifications**
```typescript
// Success
openNotificationWithIcon('Success', 'Operation completed', 'success');

// Error
openNotificationWithIcon('Error', 'Operation failed', 'error');

// Info
openNotificationWithIcon('Info', 'Processing...', 'info');
```

---

## Implementation Checklist

### Hooks (5 files):
- [ ] `hooks/use-employees.ts`
- [ ] `hooks/use-expenses.ts`
- [ ] `hooks/use-expense-categories.ts`
- [ ] `hooks/use-receipts.ts`
- [ ] `hooks/use-subsidiaries.ts`

### Table Pages (4 files):
- [ ] `app/(dashboard)/employees/page.tsx`
- [ ] `app/(dashboard)/expenses/page.tsx`
- [ ] `app/(dashboard)/subsidiaries/page.tsx`
- [ ] `app/(dashboard)/settings/expense-categories/page.tsx`

### Detail Pages (3 files):
- [ ] `app/(dashboard)/invoices/[id]/page.tsx`
- [ ] `app/(dashboard)/subsidiaries/[id]/page.tsx`
- [ ] `app/(dashboard)/settings/profile/page.tsx`

### Modals (5 files):
- [ ] `components/employees/EmployeeModal.tsx`
- [ ] `components/expenses/ExpenseModal.tsx`
- [ ] `components/expenses/ExpenseCategoryModal.tsx`
- [ ] `components/receipts/ReceiptModal.tsx`
- [ ] `components/subsidiaries/SubsidiaryModal.tsx`

### Updates (1 file):
- [ ] `types/models.ts` (add new interfaces)

---

## Testing Checklist

For each page/modal:
- [ ] TypeScript compiles with no errors
- [ ] Follows exact pattern (table or modal)
- [ ] Create operation works
- [ ] Edit operation works (pre-fills form)
- [ ] Delete operation works (with confirmation)
- [ ] Filters work correctly
- [ ] Pagination works
- [ ] Currency displays correctly (₦ symbol, 2 decimals)
- [ ] Dates display correctly (DD MMM YYYY)
- [ ] Status badges show correct colors
- [ ] Loading states work
- [ ] Error notifications appear on failures
- [ ] Success notifications appear on success
- [ ] Responsive on mobile (table scrolls horizontally)

---

## Final Notes

1. Copy patterns exactly - Don't invent new patterns. Use the Invoice page as your reference.
2. Test with mock data first - Before connecting to backend, test with mock data in the component.
3. Currency is always in cents - Backend sends/receives cents (kobo). Always convert:

Display: cents / 100
Submit: amount * 100


4. All modals use tabs - Even if only 2 fields, group logically in tabs for consistency.
5. Always use forceRender: true on all tabs - This ensures form validation works across tabs.
6. Foreign keys must be explicit - When referencing another entity, store both the ID and fetch the relation:
```typescript
employee_id: string;
employee: { id: string; name: string };
```
7. Use StatusBadge for all status fields - Don't create custom badges.
8. Use CurrencyDisplay for all money fields - Don't manually format currency.
9. Delete confirmations are mandatory - Always show Modal.confirm before deleting.
10. Breadcrumbs for detail pages - Invoice Detail and Subsidiary Detail should have "← Back" navigation.
11. Responsive tables - Always set scroll={{ x: 1200 }} on tables to enable horizontal scroll on mobile.
12. Loading states everywhere - Tables, buttons, forms should show loading indicators.
13. Empty states - When table has no data, show friendly empty state (Ant Design Empty component).
14. Error boundaries - Wrap pages in error boundaries to catch React errors gracefully.
15. Form field names match API - Use snake_case for form field names to match backend DTOs (e.g., first_name not firstName).
16. Date range filters - Always use [Dayjs | null, Dayjs | null] | null as the type for date ranges.
17. Subsidiary selector behavior:

- In header: Filters current page data
- In forms: Pre-fills subsidiary_id
- In detail pages: Shows only that subsidiary's data

18. Receipt creation flow:

- Always opened from Invoice Detail page
- Invoice is pre-selected and disabled
- Amount defaults to invoice balance_due
- After creation, invoice payment_status updates automatically

19. Template upload validation:

- Accept only .html and .hbs files
- Max file size: 5MB
- Show current template filename if exists
- Provide "Reset to Default" option

20. Accessibility:

- All form inputs must have labels
- Buttons must have clear text or aria-labels
- Tables must have proper headers
- Keyboard navigation must work

---

## Common Pitfalls to Avoid
- ❌ DON'T:

- Use any types (use proper TypeScript interfaces)
- Create new design patterns (follow existing patterns)
- Hardcode values (use enums and constants)
- Forget to convert currency to/from cents
- Skip loading states
- Skip error handling
- Use inline styles (use Tailwind utilities or Ant Design props)
- Create duplicate components (reuse existing shared components)
- Forget destroyOnClose on modals (prevents form state bleeding)
- Use synchronize: true in database config
- Store money as floats/decimals (always BIGINT cents)

- ✅ DO:

- Follow the exact patterns provided
- Use TypeScript strictly
- Handle errors gracefully with notifications
- Show loading states
- Validate forms properly
- Convert currency correctly
- Use existing shared components
- Test responsiveness
- Add proper indexes to database queries
- Use React Query for all API calls


## Performance Optimization

1. React Query caching - Data is cached automatically, use staleTime wisely
2. Table pagination - Always use server-side pagination, not client-side
3. Debounce search inputs - Add 300ms debounce to search filters
4. Lazy load images - Use Next.js Image component for subsidiary logos
5. Code splitting - Dynamic imports for modals: const Modal = dynamic(() => import('./Modal'))


## Deployment Checklist

- Before deploying:

- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings addressed
- [ ] Environment variables configured
- [ ] API endpoints point to production backend
- [ ] Currency conversion tested (cents ↔ display)
- [ ] Date handling tested (timezones)
- [ ] File uploads tested (template upload)
- [ ] All CRUD operations tested
- [ ] Mobile responsiveness verified
- [ ] Browser compatibility checked (Chrome, Safari, Firefox)
- [ ] Performance tested (Lighthouse score > 90)
- [ ] Error states tested (network failures)
- [ ] Loading states tested
- [ ] Empty states tested (no data scenarios)


## Getting Help

If stuck:

1. Reference the Invoice page (app/(dashboard)/invoices/page.tsx) - it's the perfect example
2. Check existing shared components before creating new ones
3. Review TypeScript interfaces in types/models.ts
4. Check React Query hooks pattern in hooks/use-invoices.ts
5. Verify Ant Design documentation for component APIs

---

Start with the hooks first, then build pages, then modals. Test each component before moving to the next.
Good luck! 🚀
