export type Item = {
  id: string;
  name: string;
  quantity: string;
  quantity_as_ingredient?: string;
  ingredients: Item[];
};
