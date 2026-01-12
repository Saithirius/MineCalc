import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Item.module.scss';
import { Button, ChevronLeftSVG, Refresh_spinningSVG, Switch } from 'skb_uikit';
import { apiClient } from 'api/API';
import { ItemModal } from 'components/Modals/ItemModal/ItemModal';
import { type Item as ItemBaseType } from 'types/items';
import { Tree } from 'components/Tree/Tree';
import { itemToTree } from './utils/itemToTree';
import { getNeedResources } from './utils/getNeedResources';
import { Action } from './components/TreeNodeLabel/TreeNodeLabel';
import { useItemModalSate } from 'hooks/useItemModalSate/useItemModalSate';

export type ItemType = Omit<ItemBaseType, 'ingredients'> & { targetAmount?: number; currentAmount?: number; ingredients: ItemType[] };

type ItemProps = {
  item: ItemType;
};

const Item: React.FC<ItemProps> = ({ ...props }) => {
  const editItemModalState = useItemModalSate(false);

  const [item, setItem] = useState<ItemType>(props.item);
  const [isStackView, setIsStackView] = useState(false);

  const onChangeAmount = (path: number[], action: Action) => {
    let diff = 0;
    switch (action) {
      case '--':
        diff = -64;
        break;
      case '-':
        diff = -1;
        break;
      case '++':
        diff = 64;
        break;
      case '+':
        diff = 1;
        break;
    }

    if (path.length === 1) {
      setItem((prev) => {
        const targetAmount = Math.max(1, (prev.targetAmount ?? 1) + diff);
        return { ...prev, targetAmount };
      });
    } else {
      setItem((prev) => {
        const itemClone = JSON.parse(JSON.stringify(prev));
        let curNode = itemClone as ItemType;
        path.forEach((id, index) => {
          if (index === 0) return;
          const node = curNode.ingredients.find((ing) => ing.id === id);
          if (!node) throw new Error('Не удалось найти ингредиент по пути: ' + path);
          curNode = node;
          const isTarget = index === path.length - 1;
          if (isTarget) {
            if (curNode.currentAmount === undefined) curNode.currentAmount = 0;
            curNode.currentAmount = Math.max(0, curNode.currentAmount + diff);
          }
        });
        return itemClone;
      });
    }
  };

  const tree = useMemo(() => {
    if (!item) return;
    return itemToTree(item!, item.targetAmount ?? 1, onChangeAmount);
  }, [item]);

  const needResources = useMemo(() => {
    if (!item) return [];
    return Object.entries(getNeedResources(item, item.targetAmount ?? 1))
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [item]);

  return (
    <>
      <div className={styles.header}>
        <h1>{item.name}</h1>
        <Button onClick={editItemModalState.openModal}>Редактировать</Button>
      </div>

      {/* Если нет ингредиентов */}
      {!item.ingredients?.length && <h3>Базовый предмет</h3>}

      {/* Если есть ингредиенты */}
      {!!item.ingredients?.length && (
        <div className={styles.content}>
          <div className={styles.ingredientsBlock}>
            <h3>Рецепт</h3>
            {tree ? <Tree data={tree} isOpenDefault={true} /> : <div>Нет ингредиентов</div>}
          </div>
          <div className={styles.needResourcesBlock}>
            <div className={styles.needResourcesHeader}>
              <h3>Необходимо ресурсов</h3>
              <div className={styles.viewSwitch}>
                <span>1</span>
                <Switch checked={isStackView} onChange={(e) => setIsStackView(e.target.checked)} size={'small'} />
                <span>64</span>
              </div>
            </div>
            <div className={styles.needResourcesList}>
              {needResources.map((resource) => {
                const quantity = Math.ceil(resource.quantity) / (isStackView ? 64 : 1);
                return (
                  <div key={resource.id}>
                    {resource.name}: {quantity % 1 != 0 ? quantity.toFixed(1) : quantity}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
    <div className={styles.page}>
      <Button
        onClick={() => navigate('/')}
        variant={'outlined'}
        startIcon={<ChevronLeftSVG />}
        style={{ width: 'max-content', marginBottom: 24 }}
      >
        Список предметов
      </Button>
      {isLoading ? (
        <Refresh_spinningSVG className={styles.loader} />
      ) : !item ? (
        <div>Нет такого предмета</div>
      ) : (
        <Item item={item as ItemType} />
      )}
    </div>
  );
};

export { ItemContainer as Item };
