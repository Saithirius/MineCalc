import React, { ReactNode, useId } from 'react';
import styles from './TreeNodeLabel.module.scss';
import { Button, MinusSVG, PlusSVG, useModal } from 'skb_uikit';
import { ItemModal } from 'components/Modals/ItemModal/ItemModal';
import { ItemType } from '../../Item';

type TreeNodeLabelProps = {
  item: ItemType;
  label: ReactNode;
  onChangeTree: (item: ItemType) => void;
  isRoot?: boolean;
};

export const TreeNodeLabel: React.FC<TreeNodeLabelProps> = ({ item, label, onChangeTree, isRoot }) => {
  const id = useId();
  const editModalState = useModal(id + item.id + 'editItemModal');

  const onChangeRoot = (action: '-' | '+'): void => {
    switch (action) {
      case '+':
        onChangeTree({ ...item, multiple: (item.multiple ?? 0) + 1 });
        break;
      case '-':
        onChangeTree({ ...item, multiple: (item.multiple ?? 0) - 1 });
        break;
    }
  };

  const onChangeIngredient = (action: '-' | '+'): void => {
    switch (action) {
      case '+':
        onChangeTree({ ...item, have: (item.have ?? 0) + 1 });
        break;
      case '-':
        onChangeTree({ ...item, have: (item.have ?? 0) - 1 });
        break;
    }
  };

  const onChangeCount = (action: '-' | '+'): void => {
    if (isRoot) onChangeRoot(action);
    else onChangeIngredient(action);
  };

  return (
    <>
      <div onClick={() => editModalState.openModal()} className={styles.nodeLabel}>
        {label}
        <div onClick={(e) => e.stopPropagation()} className={styles.nodeActionsBtns} style={item.have ? { opacity: 1 } : {}}>
          {!isRoot && <span style={{ marginLeft: 16 }}>имеется: {item.have ?? 0}</span>}
          <Button onClick={() => onChangeCount('+')} variant={'outlined'}>
            <PlusSVG />
          </Button>
          <Button onClick={() => onChangeCount('-')} variant={'outlined'}>
            <MinusSVG />
          </Button>
        </div>
      </div>
      {/* Модалки */}
      {editModalState.isOpen && <ItemModal item={item} isOpen={editModalState.isOpen} onClose={editModalState.closeModal} />}
    </>
  );
};
