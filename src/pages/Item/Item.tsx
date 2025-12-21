import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Item.module.scss';
import { type Item as ItemType } from 'types/items';
import { Button, ChevronLeftSVG, Refresh_spinningSVG, useModal } from 'skb_uikit';
import { apiClient } from 'api/API';
import { ItemModal } from '../../components/Modals/ItemModal/ItemModal';

export const Item: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const editItemModalState = useModal('editItemModal');

  const { data: item, isLoading } = apiClient.useGetItemQuery({ id: id! }, { skip: !id });
  const [getIngredientsRequest, { isLoading: isLoadingIngredients }] = apiClient.useLazyGetIngredientsQuery();

  const getIngredients = async (itemId: string): Promise<ItemType[]> => {
    const { data } = await getIngredientsRequest({ id: itemId });
    console.log(itemId, data);
    if (data) {
      const ingredients = [];
      for (const ingredient of data) {
        ingredients.push({
          ...ingredient,
          ingredients: await getIngredients(ingredient.id),
        });
      }
      return ingredients;
    }
    return [];
  };

  useEffect(() => {
    if (item) {
      getIngredients(item.id).then((allIngredients) => {
        console.log(allIngredients);
      });
    }
  }, [item]);

  return (
    <div>
      <Button onClick={() => navigate('/')} variant={'outlined'} startIcon={<ChevronLeftSVG />} style={{ marginBottom: 24 }}>
        Список предметов
      </Button>
      {isLoading ? (
        <Refresh_spinningSVG className={styles.loader} />
      ) : !item ? (
        <div>Нет такого предмета</div>
      ) : (
        <>
          <div className={styles.header}>
            <h1>{item.name}</h1>
            <Button onClick={editItemModalState.openModal}>Редактировать</Button>
          </div>
          <h3>Ингредиенты</h3>
          {isLoadingIngredients ? <Refresh_spinningSVG className={styles.loader} /> : <div></div>}
        </>
      )}

      {/* Модалки */}
      {editItemModalState.isOpen && <ItemModal isOpen={true} onClose={editItemModalState.closeModal} item={item} />}
    </div>
  );
};
