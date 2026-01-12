import React from 'react';
import styles from './TreeNodeLabel.module.scss';
import { Button, MinusSVG, PlusSVG } from 'skb_uikit';
import { ItemModal } from 'components/Modals/ItemModal/ItemModal';
import { ItemType } from '../../Item';
import { useItemModalSate } from 'hooks/useItemModalSate/useItemModalSate';

export type Action = '--' | '-' | '+' | '++';

type TreeNodeLabelProps = {
  item: ItemType;
  targetAmount: number;
  onChangeAmount: (action: Action) => void;
  isRoot?: boolean;
};

export const TreeNodeLabel: React.FC<TreeNodeLabelProps> = ({ item, targetAmount, onChangeAmount, isRoot }) => {
  const editModalState = useItemModalSate(false, false);

  const label = `${item.name}: ${targetAmount % 1 != 0 ? targetAmount.toFixed(1) : targetAmount}`;

  return (
    <>
      <div className={styles.nodeLabel}>
        <span onClick={() => editModalState.openModal()} style={{ cursor: 'pointer' }}>
          {label}
        </span>{' '}
        {!!item.currentAmount && (
          <span>
            (<span className={styles.needAmount}>{targetAmount - item.currentAmount}</span>)
          </span>
        )}
        <div className={styles.nodeActionsBtns} style={item.currentAmount ? { opacity: 1 } : {}}>
          {!isRoot && <span className={styles.currentAmount}>имеется: {item.currentAmount ?? 0}</span>}
          <Button onClick={() => onChangeAmount('--')} variant={'outlined'}>
            <MinusSVG />
            64
          </Button>
          <Button onClick={() => onChangeAmount('-')} variant={'outlined'}>
            <MinusSVG />1
          </Button>
          <Button onClick={() => onChangeAmount('+')} variant={'outlined'}>
            <PlusSVG />1
          </Button>
          <Button onClick={() => onChangeAmount('++')} variant={'outlined'}>
            <PlusSVG />
            64
          </Button>
        </div>
      </div>
      {/* Модалки */}
      {editModalState.isOpen && <ItemModal item={item} isOpen={editModalState.isOpen} onClose={editModalState.closeModal} />}
    </>
  );
};
