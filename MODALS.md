# Tabbed Modal Pattern - Implementation Adjustment

## Context
The current modal pattern uses a single form with all fields stacked vertically. This creates very tall modals that require excessive scrolling. We need to refactor all modals to use **Ant Design Tabs** to organize fields into logical groups.

## Reference Implementation

Based on the provided example, modals should follow this structure:

```typescript
<Modal>
  <Form>
    <Tabs
      defaultActiveKey="tab1"
      size="small"
      tabBarGutter={32}
      items={[
        {
          key: 'tab1',
          label: 'Tab 1 Name',
          forceRender: true,
          children: (
            <>
              <Form.Item>...</Form.Item>
              <Form.Item>...</Form.Item>
            </>
          ),
        },
        {
          key: 'tab2',
          label: 'Tab 2 Name',
          forceRender: true,
          children: (
            <>
              <Form.Item>...</Form.Item>
            </>
          ),
        },
      ]}
    />
  </Form>
</Modal>
```

**Key Points:**
- Use `Tabs` component inside `Form`
- Set `forceRender: true` on all tabs (ensures validation works across all tabs)
- Set `size="small"` for compact tabs
- Use `tabBarGutter={32}` for spacing
- Group related fields logically

---

## Tabbed Modal Pattern Template

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
      form.setFieldsValue({
        // Populate all fields including nested ones
        field1: item.field1,
        field2: item.field2,
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
                  {/* Basic fields go here */}
                  <Form.Item
                    name="field1"
                    label="Field 1"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input />
                  </Form.Item>
                </>
              ),
            },
            {
              key: 'additional',
              label: 'Additional Info',
              forceRender: true,
              children: (
                <>
                  {/* Additional fields go here */}
                  <Form.Item name="field2" label="Field 2">
                    <Input />
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
```

---

## Specific Modal Tab Groupings

### 1. InvoiceModal

**Tabs:**

#### Tab 1: "Basic Info"
- Subsidiary (Select)
- Client Name (Input)
- Client Email (Input)
- Client Address (TextArea)

#### Tab 2: "Dates & Terms"
- Issue Date (DatePicker)
- Due Date (DatePicker)
- Payment Terms (Select: 7 Days, Net 30, Net 60)

#### Tab 3: "Line Items"
- Line Items (Form.List with add/remove)
  - Description (TextArea)
  - Quantity (InputNumber)
  - Unit Price (InputNumber)

#### Tab 4: "Additional Info" (Optional)
- VIN Number (Input, optional)
- Vehicle Info (Input, optional)
- Shipping Info (Input, optional)
- Notes (TextArea)

**Example:**
```typescript
items={[
  {
    key: 'basic',
    label: 'Basic Info',
    forceRender: true,
    children: (
      <>
        <Form.Item name="subsidiaryId" label="Subsidiary" rules={[{ required: true }]}>
          <Select options={subsidiaryOptions} />
        </Form.Item>
        <Form.Item name="clientName" label="Client Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="clientEmail" label="Client Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="clientAddress" label="Client Address">
          <Input.TextArea rows={2} />
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
        <Form.Item name="issueDate" label="Issue Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="dueDate" label="Due Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="paymentTerms" label="Payment Terms">
          <Select options={paymentTermsOptions} />
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
                  <Form.Item {...field} name={[field.name, 'description']} style={{ flex: 1, marginBottom: 0 }}>
                    <Input.TextArea placeholder="Description" rows={2} />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'quantity']} style={{ width: 100, marginBottom: 0 }}>
                    <InputNumber placeholder="Qty" min={0} step={0.01} />
                  </Form.Item>
                  <Form.Item {...field} name={[field.name, 'unitPrice']} style={{ width: 150, marginBottom: 0 }}>
                    <InputNumber placeholder="Price" min={0} prefix="₦" />
                  </Form.Item>
                  {fields.length > 1 && (
                    <MinusCircleOutlined onClick={() => remove(field.name)} style={{ color: '#ff4d4f' }} />
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
          <Input />
        </Form.Item>
        <Form.Item name="notes" label="Notes">
          <Input.TextArea rows={4} />
        </Form.Item>
      </>
    ),
  },
]}
```

---

### 2. EmployeeModal

**Tabs:**

#### Tab 1: "Personal Info"
- First Name (Input)
- Last Name (Input)
- Email (Input with email validation)
- Phone Number (Input, optional)

#### Tab 2: "Employment"
- Subsidiary (Select)
- Employment Status (Select: ACTIVE, SUSPENDED, TERMINATED)
- Hire Date (DatePicker)
- Termination Date (DatePicker, optional, only if status = TERMINATED)

#### Tab 3: "Bank Details"
- Bank Name (Input)
- Account Number (Input)
- Account Name (Input)

#### Tab 4: "Salary"
- Net Salary (InputNumber with ₦ prefix)
- Paystack Recipient Code (Input, disabled/read-only if exists)

**Example:**
```typescript
items={[
  {
    key: 'personal',
    label: 'Personal Info',
    forceRender: true,
    children: (
      <>
        <Form.Item name="first_name" label="First Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="last_name" label="Last Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="phone_number" label="Phone Number">
          <Input />
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
        <Form.Item name="subsidiary_id" label="Subsidiary" rules={[{ required: true }]}>
          <Select options={subsidiaryOptions} />
        </Form.Item>
        <Form.Item name="employment_status" label="Status" rules={[{ required: true }]}>
          <Select options={[
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Suspended', value: 'SUSPENDED' },
            { label: 'Terminated', value: 'TERMINATED' },
          ]} />
        </Form.Item>
        <Form.Item name="hire_date" label="Hire Date" rules={[{ required: true }]}>
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
        <Form.Item name="bank_name" label="Bank Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="account_number" label="Account Number" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="account_name" label="Account Name" rules={[{ required: true }]}>
          <Input />
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
        <Form.Item name="net_salary" label="Net Salary" rules={[{ required: true }]}>
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            prefix="₦"
            placeholder="Enter monthly salary"
          />
        </Form.Item>
        <Form.Item name="paystack_recipient_code" label="Paystack Code">
          <Input disabled placeholder="Auto-generated on first payout" />
        </Form.Item>
      </>
    ),
  },
]}
```

---

### 3. ExpenseModal

**Tabs:**

#### Tab 1: "Expense Info"
- Employee (Select with search)
- Subsidiary (Select)
- Expense Date (DatePicker)

#### Tab 2: "Details"
- Category (Select: TRAVEL, MEALS, SUPPLIES, OTHER)
- Amount (InputNumber with ₦ prefix)
- Description (TextArea)

**Example:**
```typescript
items={[
  {
    key: 'info',
    label: 'Expense Info',
    forceRender: true,
    children: (
      <>
        <Form.Item name="employee_id" label="Employee" rules={[{ required: true }]}>
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={employeeOptions}
          />
        </Form.Item>
        <Form.Item name="subsidiary_id" label="Subsidiary" rules={[{ required: true }]}>
          <Select options={subsidiaryOptions} />
        </Form.Item>
        <Form.Item name="expense_date" label="Expense Date" rules={[{ required: true }]}>
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
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select options={[
            { label: 'Travel', value: 'TRAVEL' },
            { label: 'Meals', value: 'MEALS' },
            { label: 'Supplies', value: 'SUPPLIES' },
            { label: 'Other', value: 'OTHER' },
          ]} />
        </Form.Item>
        <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
          <InputNumber
            style={{ width: '100%' }}
            min={0}
            prefix="₦"
            placeholder="Enter amount"
          />
        </Form.Item>
        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={4} placeholder="Describe the expense" />
        </Form.Item>
      </>
    ),
  },
]}
```

---

### 4. SubsidiaryModal

**Tabs:**

#### Tab 1: "Basic Info"
- Name (Input)
- Code (Input, uppercase)
- Description (TextArea, optional)

#### Tab 2: "Branding"
- Logo Upload (Upload component)
- Primary Color (ColorPicker)
- Invoice Template (Select: default, cement, auto, logistics)

#### Tab 3: "Contact Info"
- Business Address (TextArea)
- Contact Email (Input with email validation)
- Contact Phone (Input)

**Example:**
```typescript
items={[
  {
    key: 'basic',
    label: 'Basic Info',
    forceRender: true,
    children: (
      <>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="code" label="Code" rules={[{ required: true, max: 20 }]}>
          <Input placeholder="e.g., CEMENT" style={{ textTransform: 'uppercase' }} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} />
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
        <Form.Item name="logo" label="Logo">
          <Upload
            listType="picture-card"
            maxCount={1}
            beforeUpload={() => false}
          >
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          </Upload>
        </Form.Item>
        <Form.Item name="primary_color" label="Primary Color">
          <ColorPicker showText />
        </Form.Item>
        <Form.Item name="invoice_template_id" label="Invoice Template">
          <Select options={[
            { label: 'Default', value: 'default' },
            { label: 'Cement', value: 'cement' },
            { label: 'Automobiles', value: 'auto' },
            { label: 'Logistics', value: 'logistics' },
          ]} />
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
          <Input.TextArea rows={2} />
        </Form.Item>
        <Form.Item name="contact_email" label="Contact Email" rules={[{ type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item name="contact_phone" label="Contact Phone">
          <Input />
        </Form.Item>
      </>
    ),
  },
]}
```

---

## Critical Implementation Rules

### 1. **Always use `forceRender: true`**
This ensures form validation works across all tabs. Without it, hidden tabs won't validate.

### 2. **Form.List in Tabs**
When using `Form.List` (like line items in invoices), place it inside a dedicated tab. This keeps the UI clean.

### 3. **Footer Actions Placement**
Place the Cancel/Submit buttons **outside** the Tabs component, at the bottom of the form:

```typescript
<Form>
  <Tabs items={[...]} />
  
  {/* Footer outside tabs */}
  <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
      <Button onClick={onClose}>Cancel</Button>
      <Button type="primary" htmlType="submit" loading={isLoading}>
        Save
      </Button>
    </Space>
  </Form.Item>
</Form>
```

### 4. **Modal Width**
Increase modal width to 800px or 900px for tabbed modals to accommodate wider forms:

```typescript
<Modal width={800} ...>
```

### 5. **Tab Naming**
Use clear, concise tab labels:
- ✅ "Basic Info", "Bank Details", "Salary"
- ❌ "Tab 1", "Information", "Data"

### 6. **Logical Grouping**
Group fields by:
- **Relationship** (personal info vs employment info)
- **Frequency of use** (common fields first)
- **Type** (contact info together, financial info together)

---

## Task: Refactor All Modals

Refactor these modals to use the tabbed pattern:

1. **InvoiceModal** - 4 tabs (Basic Info, Dates & Terms, Line Items, Additional Info)
2. **EmployeeModal** - 4 tabs (Personal Info, Employment, Bank Details, Salary)
3. **ExpenseModal** - 2 tabs (Expense Info, Details)
4. **SubsidiaryModal** - 3 tabs (Basic Info, Branding, Contact Info)

### Before (Single Form):
```typescript
<Form>
  <Form.Item name="field1" />
  <Form.Item name="field2" />
  <Form.Item name="field3" />
  <Form.Item name="field4" />
  <Form.Item name="field5" />
  <Form.Item name="field6" />
  {/* 20+ fields = very tall modal */}
</Form>
```

### After (Tabbed Form):
```typescript
<Form>
  <Tabs
    items={[
      { key: 'tab1', label: 'Group 1', children: <>{fields 1-3}</> },
      { key: 'tab2', label: 'Group 2', children: <>{fields 4-6}</> },
    ]}
  />
  {/* Footer actions */}
</Form>
```

---

## Testing Checklist

For each refactored modal:
- [ ] All tabs render correctly
- [ ] Form validation works across all tabs (required fields)
- [ ] Switching tabs doesn't lose form data
- [ ] Submit button validates all tabs
- [ ] Edit mode pre-fills all fields in all tabs
- [ ] Form.List (if any) works in dedicated tab
- [ ] Modal width is appropriate (800-900px)
- [ ] Footer buttons are outside tabs

---

## Expected Outcome

After refactoring:
- ✅ Modals are shorter (no scrolling needed)
- ✅ Fields are logically organized
- ✅ Better UX (progressive disclosure)
- ✅ Cleaner code structure
- ✅ Easier to maintain

Start with **InvoiceModal** as the reference implementation, then apply the same pattern to other modals.
