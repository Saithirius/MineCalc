import React from 'react';
import { Select } from 'skb_uikit';
import { apiClient } from 'api/API';

type ItemSelectProps = {
  label?: string;
  value?: number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: boolean;
};

export const ItemSelect: React.FC<ItemSelectProps> = ({ label, value, onChange, error }) => {
  const { data: items, isLoading } = apiClient.useGetItemsQuery();

  return (
    <Select
      label={label}
      value={value?.toString()}
      options={(items ?? []).map((item) => ({ value: item.id, label: item.name }))}
      onChange={onChange}
      isLoading={isLoading}
      // search
      // dropdownPosition={'top'}
      portal
      error={error}
    />
  );
};
