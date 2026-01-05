import React from 'react';
import styles from './NewItem.module.scss';
import { Ingredient } from 'types/items';
import { apiClient } from 'api/API';
import { Button, notify } from 'skb_uikit';
import { ItemForm, type ItemForm as ItemFormType } from '../ItemForm/ItemForm';

type NewItemProps = {
  onClose: () => void;
  onOpenNewItemModal: () => void;
};

export const NewItem: React.FC<NewItemProps> = ({ onClose, onOpenNewItemModal }) => {
  const [postItem, { isLoading: isPostingItem }] = apiClient.usePostItemMutation();
  const [postIngredients, { isLoading: isPostingIngredients }] = apiClient.usePostIngredientsMutation();
  const isLoading = isPostingItem || isPostingIngredients;

  const onSave = async (formData: ItemFormType): Promise<void> => {
    const { data: item } = await postItem({ name: formData.name, crafted_quantity: Number(formData.crafted_quantity) });

    if (!item) {
      notify({ type: 'error', content: 'Не удалось создать предмет' });
      return;
    }

    if (formData.ingredients?.length) {
      const ingredients: Ingredient[] = [];
      formData.ingredients.forEach((ingredient) => {
        if (!ingredient.id || !ingredient.quantity_as_ingredient) return;
        ingredients.push({
          item_id: item.id,
          ingredient_id: ingredient.id,
          quantity_as_ingredient: ingredient.quantity_as_ingredient,
        });
      });
      await postIngredients(ingredients);
    }

    onClose();
  };

  return (
    <ItemForm
      onSave={onSave}
      footer={
        <div className={styles.footer}>
          <Button onClick={onClose} variant={'outlined'} style={{ marginLeft: 'auto' }}>
            Отменить
          </Button>
          <Button type={'submit'} loading={isLoading}>
            Сохранить
          </Button>
        </div>
      }
      onOpenNewItemModal={onOpenNewItemModal}
    />
  );
};
