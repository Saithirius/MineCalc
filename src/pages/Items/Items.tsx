import React, { useState } from 'react';
import styles from './Items.module.scss';
import { Button, Input, PlusSVG, Refresh_spinningSVG, useModal, withDebouncedChange } from 'skb_uikit';
import { ItemModal } from 'components/Modals/ItemModal/ItemModal';
import { apiClient } from 'api/API';
import { useNavigate } from 'react-router-dom';

const InputWithDebounce = withDebouncedChange(Input);

export const Items: React.FC = () => {
  const navigate = useNavigate();

  const itemModalState = useModal('itemModal');

  const [search, setSearch] = useState<string>('');

  const { data: items, isLoading } = apiClient.useGetItemsQuery({ search });

  return (
    <div className={styles.page}>
      <h1 style={{ marginBottom: 24 }}>Список предметов</h1>
      <InputWithDebounce onChange={(v) => setSearch(v ?? '')} placeholder={'Поиск'} autoComplete={'off'} style={{ marginBottom: 24 }} />
      <Button onClick={itemModalState.openModal} variant={'outlined'} startIcon={<PlusSVG />} className={styles.addBtn}>
        Создать новый
      </Button>
      <div className={styles.list}>
        {isLoading ? (
          <Refresh_spinningSVG className={styles.loader} />
        ) : (
          (items ?? []).map((item) => (
            <div key={item.id} onClick={() => navigate('/' + item.id)}>
              {item.name}
            </div>
          ))
        )}

        {/*//# Модалки  */}
        {itemModalState.isOpen && <ItemModal isOpen={itemModalState.isOpen} onClose={itemModalState.closeModal} />}
      </div>
    </div>
  );
};
