import { ItemType } from '../Item';

type NeedResources = { [key: string]: { id: number; quantity: number } };

export const getNeedResources = (item: ItemType, targetAmount: number, needResources: NeedResources = {}): NeedResources => {
  if (!item) return needResources;
  targetAmount = Math.max(0, targetAmount - (item.currentAmount ?? 0));

  if (!item.ingredients?.length) {
    if (needResources[item.name] === undefined) needResources[item.name] = { id: item.id, quantity: targetAmount };
    else needResources[item.name].quantity += targetAmount;
  } else {
    item.ingredients.forEach((ingredient) => {
      getNeedResources(ingredient, targetAmount * ((ingredient.quantity_as_ingredient ?? 1) / item.crafted_quantity), needResources);
    });
  }

  return needResources;
};
