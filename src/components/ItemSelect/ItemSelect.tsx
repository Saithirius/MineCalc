import React, { useState } from 'react';
import styles from './ItemSelect.module.scss';
import { Input, Select } from 'skb_uikit';
import { apiClient } from 'api/API';

type ItemSelectProps = {
  label?: string;
  value?: number;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: boolean;
  dropdownPosition?: 'top' | 'bottom';
};

export const ItemSelect: React.FC<ItemSelectProps> = ({ label, value, onChange, error, dropdownPosition = 'bottom' }) => {
  const { data: items, isLoading } = apiClient.useGetItemsQuery();
  const [search, setSearch] = useState('');

  const options = (items ?? [])
    .filter((item) => !search || item.name.toLowerCase().includes(search.toLowerCase()))
    .map((item) => ({ value: item.id, label: item.name }));

  return (
    <Select
      label={label}
      value={value?.toString()}
      options={[
        {
          label: '',
          value: -1,
          labelComponent: (
            <div onClick={(e) => e.stopPropagation()} style={{ margin: '-8px -10px' }}>
              <Input value={search} onChange={(e) => setSearch(e ?? '')} placeholder={'Поиск'} autoComplete={'off'} type={'newpassword'} />
            </div>
          ),
        },
        ...options,
      ]}
      onChange={onChange}
      isLoading={isLoading}
      dropdownPosition={dropdownPosition}
      portal
      error={error}
      selectContainerClassName={styles.container}
    />
  );
};
