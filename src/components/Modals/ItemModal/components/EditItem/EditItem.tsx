import React from 'react';
import styles from './EditItem.module.scss';
import { ItemForm, type ItemForm as ItemFormType } from '../ItemForm/ItemForm';
import { Button } from 'skb_uikit';
import { Ingredient, Item } from 'types/items';
import { apiClient } from 'api/API';

type NewItemProps = {
  item: Item;
  onClose: () => void;
};

export const EditItem: React.FC<NewItemProps> = ({ item, onClose }) => {
  const [patchItem, { isLoading: isPatchingItem }] = apiClient.usePatchItemMutation();
  const [deleteItem, { isLoading: isDeletingItem }] = apiClient.useDeleteItemMutation();
  const [deleteIngredients, { isLoading: isDeletingIngredients }] = apiClient.useDeleteIngredientsMutation();
  const [postIngredients, { isLoading: isPostingIngredients }] = apiClient.usePostIngredientsMutation();
  const isLoading = isPatchingItem || isDeletingItem || isDeletingIngredients || isPostingIngredients;

  const onSave = async (formData: ItemFormType): Promise<void> => {
    if (item.name !== formData.name || item.crafted_quantity !== formData.crafted_quantity) {
      await patchItem({ id: item.id, name: formData.name, crafted_quantity: formData.crafted_quantity });
    }

    await deleteIngredients({ item_id: item.id });

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

  const onDelete = async (): Promise<void> => {
    if (!item) return;

    await deleteItem({ id: item.id }); // Удаляем предмет из базы

    onClose();
  };

  return (
    <ItemForm
      defaultValues={item}
      onSave={onSave}
      footer={
        <div className={styles.footer}>
          <Button onClick={onDelete} danger loading={isLoading}>
            Удалить
          </Button>
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
