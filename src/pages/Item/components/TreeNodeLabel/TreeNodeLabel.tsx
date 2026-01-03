import React, { ReactNode } from 'react';
import styles from './TreeNodeLabel.module.scss';
import { Button, MinusSVG, PlusSVG, useModal } from 'skb_uikit';
import { ItemModal } from 'components/Modals/ItemModal/ItemModal';
import { Item } from 'types/items';

type TreeNodeLabelProps = {
  item: Item;
  label: ReactNode;
  onClick: (id: number, event: '-' | '+') => void;
};

export const TreeNodeLabel: React.FC<TreeNodeLabelProps> = ({ item, label, onClick }) => {
  const editModalState = useModal(item.id + 'editItemModal');

  return (
    <div onClick={() => editModalState.openModal()} className={styles.nodeLabel}>
      {label}
      <div className={styles.nodeActionsBtns} onClick={(e) => e.stopPropagation()}>
        <Button onClick={() => onClick(item.id, '+')} variant={'outlined'}>
          <PlusSVG />
        </Button>
        <Button onClick={() => onClick(item.id, '-')} variant={'outlined'}>
          <MinusSVG />
        </Button>
      </div>

      {/* Модалки */}
      {editModalState.isOpen && <ItemModal isOpen={editModalState.isOpen} onClose={editModalState.closeModal} item={item} />}
    </div>
  );
};
