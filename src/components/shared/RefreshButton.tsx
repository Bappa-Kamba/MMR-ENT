'use client';

import React from 'react';
import { Button, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';

export function RefreshButton() {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries();
    setTimeout(() => {
      setIsRefreshing(false);
      message.success('Data refreshed');
    }, 500);
  };

  return (
    <Tooltip title="Refresh data">
      <Button
        type="text"
        icon={<ReloadOutlined spin={isRefreshing} />}
        onClick={handleRefresh}
      />
    </Tooltip>
  );
}
