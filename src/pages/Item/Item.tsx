import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Item.module.scss';
import { Button, ChevronLeftSVG, MinusSVG, PlusSVG, Refresh_spinningSVG, useModal } from 'skb_uikit';
import { apiClient } from 'api/API';
import { ItemModal } from 'components/Modals/ItemModal/ItemModal';
import { type Item as ItemType } from 'types/items';
import { Tree, TreeProps } from 'components/Tree/Tree';
import { TreeNodeLabel } from './components/TreeNodeLabel/TreeNodeLabel';

const itemToTree = (item: ItemType, multiple = 1, onClick: (id: number, event: '-' | '+') => void): TreeProps['data'] => {
  const label = `${item.name}: ${multiple}`;

  const graphData: TreeProps['data'] = {
    id: item.id,
    label: <TreeNodeLabel item={item} label={label} onClick={onClick} />,
    children: [],
  };
  if (!item.ingredients?.length) return graphData;

  item.ingredients?.forEach((ingredient) => {
    graphData.children.push(itemToTree(ingredient, multiple * ((ingredient.quantity_as_ingredient ?? 1) / item.crafted_quantity), onClick));
  });

  return graphData;
};

type NeedResources = { [key: string]: { id: number; quantity: number } };

const getNeedResources = (item: ItemType, multiple = 1, needResources: NeedResources = {}): NeedResources => {
  if (!item) return needResources;
  if (!item.ingredients?.length) {
    if (needResources[item.name] === undefined) needResources[item.name] = { id: item.id, quantity: multiple };
    else needResources[item.name].quantity += multiple;
  } else {
    item.ingredients.forEach((ingredient) => {
      getNeedResources(ingredient, multiple * ((ingredient.quantity_as_ingredient ?? 1) / ingredient.crafted_quantity), needResources);
    });
  }

  return needResources;
};

export const Item: React.FC = () => {
  const params = useParams();
  const id = Number(params.id);
  if (isNaN(id)) return <div>Не удалось получить ID предмета</div>;

  const navigate = useNavigate();

  const editItemModalState = useModal('editItemModal');

  const [tree, setTree] = useState<TreeProps['data']>();
  const [multiple, setMultiple] = useState(1);

  const { data: item, isLoading } = apiClient.useGetItemQuery({ id: id! }, { skip: !id });

  const onChangeIngredientQuantity = useRef((id: number, event: '-' | '+'): void => {
    console.log('onClick', id, event);
    if (id === item?.id) setMultiple(Math.max(1, multiple + (event === '-' ? -1 : 1)));
  });

  useEffect(() => {
    if (!item) return;
    const tree = itemToTree(item!, multiple, onChangeIngredientQuantity.current);
    setTree(tree);
  }, [item, multiple]);

  const needResources = useMemo(() => {
    return Object.entries(getNeedResources(item!, multiple))
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [item, multiple]);

  return (
    <div>
      <canvas id={'canvas'} style={{ opacity: 0, pointerEvents: 'none', position: 'absolute', top: 0, left: 0 }} />
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
          <div className={styles.ingredientsBlock}>
            <h3>Рецепт</h3>
            {tree ? <Tree data={tree} isOpenDefault={true} /> : <div>Нет ингредиентов</div>}
          </div>
          <div className={styles.needResourcesBlock}>
            <h3>Необходимо ресурсов</h3>
            <div className={styles.needResourcesList}>
              {needResources.map((resource) => (
                <div key={resource.id}>
                  {resource.name}: {resource.quantity}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Модалки */}
      {editItemModalState.isOpen && <ItemModal isOpen={true} onClose={editItemModalState.closeModal} item={item} />}
    </div>
  );
};
