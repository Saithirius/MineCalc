import { ComponentType, useEffect, useId } from 'react';
import { ModalState, useModal } from 'skb_uikit';

const stackCloseFns: Array<() => void> = [];

const onHotkey = (e: KeyboardEvent): void => {
  if (e.code === 'Escape') {
    e.preventDefault();
    e.stopPropagation();
    stackCloseFns[stackCloseFns.length - 1]?.();
  }
};

document.addEventListener('keydown', onHotkey);

export const useItemModalSate = <T extends ComponentType<any>>(isNew = true, enabledOpenHotkey = true): ModalState<T> => {
  const id = useId();
  const itemModalState = useModal('newItemModal' + id);

  // Хоткей на открытие
  useEffect(() => {
    if (!enabledOpenHotkey) return;
    const onHotkey = (e: KeyboardEvent): void => {
      const code = isNew ? 'KeyN' : 'KeyE';
      if (e.altKey && e.code === code) {
        e.preventDefault();
        e.stopPropagation();
        itemModalState.openModal();
      }
    };
    document.addEventListener('keydown', onHotkey);

    return () => {
      document.removeEventListener('keydown', onHotkey);
    };
  }, []);

  // Хоткей на закрытие
  useEffect(() => {
    if (!itemModalState.isOpen) return;
    stackCloseFns.push(itemModalState.closeModal);

    return () => {
      stackCloseFns.pop();
    };
  }, [itemModalState.isOpen]);

  return itemModalState;
};
