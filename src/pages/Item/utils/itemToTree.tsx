import React from 'react';
import { Action, TreeNodeLabel } from '../components/TreeNodeLabel/TreeNodeLabel';
import { TreeProps } from 'components/Tree/Tree';
import { ItemType } from '../Item';

type ItemToTree = (
  item: ItemType,
  targetAmount: number,
  onChangeAmount: (path: number[], action: Action) => void,
  path?: number[],
) => TreeProps['data'];

const withPath = (fn: ItemToTree) => {
  return function (item, targetAmount, onChangeTree, path = []) {
    path.push(item.id);
    try {
      return fn(item, targetAmount, onChangeTree, path);
    } finally {
      path.pop();
    }
  } as ItemToTree;
};

export const itemToTree: ItemToTree = withPath((item, targetAmount = 1, onChangeAmount, path = []): TreeProps['data'] => {
  const isRoot = path.length === 1;
  const pathCopy = [...path];

  const graphData: TreeProps['data'] = {
    id: item.id,
    label: (
      <TreeNodeLabel
        item={item}
        name={item.name}
        targetAmount={targetAmount}
        onChangeAmount={(action: Action) => onChangeAmount(pathCopy, action)}
        isRoot={isRoot}
      />
    ),
    children: [],
  };
  if (!item.ingredients?.length) return graphData;

  item.ingredients?.forEach((ingredient) => {
    const ingredientTargetAmount = targetAmount * ((ingredient.quantity_as_ingredient ?? 1) / item.crafted_quantity);
    graphData.children.push(itemToTree(ingredient, ingredientTargetAmount, onChangeAmount, path));
  });

  return graphData;
});
