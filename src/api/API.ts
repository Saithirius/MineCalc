import { createClient } from '@supabase/supabase-js';
import { Ingredient, Item } from 'types/items';
import { createApi } from '@reduxjs/toolkit/query/react';

const API_URL = 'https://efhzdixocsqwiuzqtaff.supabase.co';
const API_KEY = 'sb_publishable_7wsC25W1qejOJZlnWg5vwg_BY3mZ1N6';

const supabase = createClient(API_URL, API_KEY);

export const apiClient = createApi({
  reducerPath: 'supabase_api',
  baseQuery: () => ({ data: null }), // Пустая заглушка
  tagTypes: ['items', 'ingredients'],
  endpoints: (build) => ({
    getItems: build.query<Item[], { search: string } | void>({
      queryFn: async (args) => {
        let search = '';
        if (args && 'search' in args) search = args.search;

        const req = supabase
          .from('items')
          .select('id, name, crafted_quantity, ingredients!ingredients_item_id_fkey (item_id, ingredient_id, quantity_as_ingredient)')
          .order('name');
        if (search) req.ilike('name', `%${search}%`);
        const { data, error } = await req;

        if (error) return { data: [] };

        return { data } as unknown as { data: Item[] };
      },
      providesTags: (result) => (result ? ['items'] : []),
    }),

    getItem: build.query<Item | undefined, { id: number }>({
      queryFn: async ({ id }) => {
        const { data, error } = await supabase.rpc('get_recipe', { p_item_id: id });

        if (error) return { data: undefined };

        return { data } as { data: Item };
      },
      providesTags: (result, _, args) => (result ? [{ type: 'items', id: args.id }] : []),
    }),

    postItem: build.mutation<Item | undefined, { name: string; crafted_quantity: number }>({
      queryFn: async ({ name, crafted_quantity }) => {
        const { data, error } = await supabase.from('items').insert([{ name, crafted_quantity }]).select();

        if (error) return { data: undefined };

        return { data: data[0] } as { data: Item };
      },
      invalidatesTags: (_, error) => (!error ? [{ type: 'items' }] : []),
    }),

    patchItem: build.mutation<Item | undefined, { id: number; name: string; crafted_quantity: number }>({
      queryFn: async ({ id, name, crafted_quantity }) => {
        const { data, error } = await supabase.from('items').update({ name, crafted_quantity }).eq('id', id).select();

        if (error) return { data: undefined };

        return { data: data[0] } as { data: Item };
      },
      invalidatesTags: (_, error, args) => (!error ? [{ type: 'items' }, { type: 'items', id: args.id }] : []),
    }),

    deleteItem: build.mutation<undefined, { id: number }>({
      queryFn: async ({ id }) => {
        await supabase.from('items').delete().eq('id', id);
        return { data: undefined };
      },
      invalidatesTags: (_, error, args) => (!error ? [{ type: 'items' }, { type: 'items', id: args.id }] : []),
    }),

    getIngredients: build.query<Item[], { id: number }>({
      queryFn: async ({ id }) => {
        const { data: row_ingredients, error: row_ingredients_error } = await supabase.from('ingredients').select().eq('item_id', id);

        if (row_ingredients_error || row_ingredients === null) return { data: [] };

        const ingredientIds = row_ingredients.map((row) => row.ingredient_id);

        const { data: ingredients, error } = await supabase.from('items').select().in('id', ingredientIds);

        if (error) return { data: [] };

        return {
          data: ingredients?.map((ingredient) => {
            return {
              ...ingredient,
              quantity_as_ingredient: row_ingredients.find((row) => row.ingredient_id === ingredient.id)?.quantity_as_ingredient,
            };
          }),
        };
      },
      providesTags: (result, _, args) => (result ? [{ type: 'ingredients', id: args.id }] : []),
    }),

    postIngredients: build.mutation<Item | undefined, Ingredient[]>({
      queryFn: async (ingredients) => {
        const { data, error } = await supabase.from('ingredients').insert(ingredients).select();
        if (error) return { data: undefined };
        return { data: data[0] };
      },
      invalidatesTags: (_, error, args) => (!error ? [{ type: 'ingredients', id: args[0].item_id }] : []),
    }),

    deleteIngredients: build.mutation<undefined, { item_id: number }>({
      queryFn: async ({ item_id }) => {
        await supabase.from('ingredients').delete().eq('item_id', item_id);
        return { data: undefined };
      },
      invalidatesTags: (_, error, args) => (!error ? [{ type: 'items', id: args.item_id }] : []),
    }),
  }),
});
