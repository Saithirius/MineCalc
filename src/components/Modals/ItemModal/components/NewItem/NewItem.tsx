import React from 'react';
import styles from './NewItem.module.scss';
import { ItemForm, type ItemForm as ItemFormType } from '../ItemForm/ItemForm';
import { apiClient } from 'api/API';
import { Button, notify } from 'skb_uikit';

type NewItemProps = {
  onClose: () => void;
};

export const NewItem: React.FC<NewItemProps> = ({ onClose }) => {
  const [postItem, { isLoading: isPostingItem }] = apiClient.usePostItemMutation();
  const [postIngredients, { isLoading: isPostingIngredients }] = apiClient.usePostIngredientsMutation();
  const isLoading = isPostingItem || isPostingIngredients;

  const onSave = async (formData: ItemFormType): Promise<void> => {
    const { data: item } = await postItem({ name: formData.name, quantity: Number(formData.quantity) });

    if (!item) {
      notify({ type: 'error', content: 'Не удалось создать предмет' });
      return;
    }

    if (formData.ingredients.length) {
      const ingredients = formData.ingredients.map((ingredient) => ({
        item_id: item.id,
        ingredient_id: ingredient.id,
        quantity: Number(ingredient.quantity),
      }));
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
    />
  );
};
