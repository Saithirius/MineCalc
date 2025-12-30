export type Item = {
  id: number;
  name: string;
  crafted_quantity: number;
  quantity_as_ingredient?: number;
  ingredients: Item[] | null;
};
