import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Item.module.scss';
import { Button, ChevronLeftSVG, Refresh_spinningSVG, useModal } from 'skb_uikit';
import { apiClient } from 'api/API';
import { ItemModal } from 'components/Modals/ItemModal/ItemModal';
import { type Item as ItemBaseType } from 'types/items';
import { Tree, TreeProps } from 'components/Tree/Tree';
import { TreeNodeLabel } from './components/TreeNodeLabel/TreeNodeLabel';

export type ItemType = Omit<ItemBaseType, 'ingredients'> & { multiple?: number; have?: number; ingredients: ItemType[] };

const itemToTree = (item: ItemType, onChangeTree: (item: ItemType) => void, multiple = 1, isRoot = true): TreeProps['data'] => {
  multiple += item.multiple ?? 0;
  const label = `${item.name}: ${multiple % 1 != 0 ? multiple.toFixed(1) : multiple}`;

  const graphData: TreeProps['data'] = {
    id: item.id,
    label: <TreeNodeLabel item={item} label={label} onChangeTree={onChangeTree} isRoot={isRoot} />,
    children: [],
  };
  if (!item.ingredients?.length) return graphData;

  item.ingredients?.forEach((ingredient) => {
    graphData.children.push(
      itemToTree(ingredient, onChangeTree, multiple * ((ingredient.quantity_as_ingredient ?? 1) / item.crafted_quantity), false),
    );
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

type ItemProps = {
  item: ItemType;
};

const Item: React.FC<ItemProps> = ({ ...props }) => {
  const editItemModalState = useModal('editItemModal');

  const [item, setItem] = useState<ItemType>(props.item);

  const tree = useMemo(() => {
    if (!item) return;
    return itemToTree(item!, setItem);
  }, [item]);

  const needResources = useMemo(() => {
    return Object.entries(getNeedResources(item!))
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [item]);

  console.log(item);
  return (
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

      {/* Модалки */}
      {editItemModalState.isOpen && <ItemModal isOpen={true} onClose={editItemModalState.closeModal} item={item} />}
    </>
  );
};

const ItemContainer: React.FC = () => {
  const params = useParams();
  const id = Number(params.id);
  if (isNaN(id)) return <div>Не удалось получить ID предмета</div>;
  const navigate = useNavigate();

  const { data: item, isLoading } = apiClient.useGetItemQuery({ id: id! }, { skip: !id });

  return (
    <>
      <Button onClick={() => navigate('/')} variant={'outlined'} startIcon={<ChevronLeftSVG />} style={{ marginBottom: 24 }}>
        Список предметов
      </Button>
      {isLoading ? (
        <Refresh_spinningSVG className={styles.loader} />
      ) : !item ? (
        <div>Нет такого предмета</div>
      ) : (
        <Item item={item as ItemType} />
      )}
    </>
  );
};

export { ItemContainer as Item };
