'use client';

import { Card, Row, Col, Input, Select, DatePicker, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;


// Separate type for each filter
type SearchFilter = {
  type: 'search';
  name: string;
  placeholder?: string;
  onChange: (value: string) => void;
  value?: string;
};

type SelectFilter = {
  type: 'select';
  name: string;
  placeholder?: string;
  options?: { label: string; value: string | number }[];
  onChange: (value: string | number| undefined) => void;
  value?: string | number;
};

type DateRangeFilter = {
  type: 'dateRange';
  name: string;
  placeholder?: string;
  onChange: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  value?: [Dayjs | null, Dayjs | null] | null;
};

type FilterConfig = SearchFilter | SelectFilter | DateRangeFilter;

interface TableFiltersProps {
  filters: FilterConfig[];
  onReset?: () => void;
}

export function TableFilters({ filters, onReset }: TableFiltersProps) {
  return (
    <Card style={{ marginBottom: 16 }} styles={{ body: { paddingBottom: 8 } }}>
      <Row gutter={[16, 16]} align="middle">
        {filters.map((filter, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={6}>
            {filter.type === 'search' && (
              <Input
                placeholder={filter.placeholder || 'Search...'}
                prefix={<SearchOutlined />}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                allowClear
              />
            )}
            {filter.type === 'select' && (
              <Select
                placeholder={filter.placeholder || 'Select...'}
                value={filter.value}
                onChange={filter.onChange}
                options={filter.options}
                style={{ width: '100%' }}
                allowClear
              />
            )}
            {filter.type === 'dateRange' && (
              <RangePicker
                value={filter.value}
                onChange={filter.onChange}
                style={{ width: '100%' }}
              />
            )}
          </Col>
        ))}
        {onReset && (
          <Col>
            <Button icon={<ReloadOutlined />} onClick={onReset}>
              Reset
            </Button>
          </Col>
        )}
      </Row>
    </Card>
  );
}
