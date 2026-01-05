import React, { useId } from 'react';
import styles from './ItemModal.module.scss';
import { Modal, useModal } from 'skb_uikit';
import { Item } from 'types/items';
import { EditItem } from './components/EditItem/EditItem';
import { NewItem } from './components/NewItem/NewItem';

type ItemModalProps = {
  isOpen: boolean;
  onClose: () => void;
  item?: Item;
};

export const ItemModal: React.FC<ItemModalProps> = ({ isOpen, onClose, item }) => {
  const modalId = useId();
  const newItemModalState = useModal(modalId);

  return (
    <>
      <Modal
        open={isOpen}
        onClose={onClose}
        title={item ? item.name : 'Новый рецепт'}
        // showCloseBtn={false}
        cardClassName={styles.modal}
        contentClassName={styles.content}
      >
        {item ? (
          <EditItem item={item} onClose={onClose} onOpenNewItemModal={newItemModalState.openModal} />
        ) : (
          <NewItem onClose={onClose} onOpenNewItemModal={newItemModalState.openModal} />
        )}
      </Modal>

      {/* Модалки */}
      {newItemModalState.isOpen && <ItemModal isOpen={true} onClose={newItemModalState.closeModal} />}
    </>
  );
};
