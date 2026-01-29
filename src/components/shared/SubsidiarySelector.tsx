'use client';

import React from 'react';
import { Select } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useUIStore } from '@/stores/ui-store';

interface Subsidiary {
  id: string;
  name: string;
  code: string;
}

export function SubsidiarySelector() {
  const { currentSubsidiary, setCurrentSubsidiary } = useUIStore();

  const { data: subsidiaries, isLoading } = useQuery({
    queryKey: ['subsidiaries'],
    queryFn: async () => {
      const { data } = await apiClient.get<Subsidiary[]>('/subsidiaries');
      return data;
    },
  });

  return (
    <Select
      style={{ width: 200 }}
      placeholder="Select Subsidiary"
      value={currentSubsidiary}
      onChange={setCurrentSubsidiary}
      loading={isLoading}
      options={[
        { label: 'All Subsidiaries', value: 'all' },
        { label: 'MMR Auto', value: 'autos' },
        { label: 'MMR Logistics', value: 'logistics' },
        { label: 'MMR Cement', value: 'cement' },
        ...(subsidiaries?.map((sub) => ({
          label: sub.name,
          value: sub.id,
        })) || []),
      ]}
    />
  );
}
