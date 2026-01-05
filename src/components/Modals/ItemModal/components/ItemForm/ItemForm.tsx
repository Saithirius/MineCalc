import React, { useEffect } from 'react';
import styles from './ItemForm.module.scss';
import { BinSVG, Button, Input, PlusSVG, Refresh_spinningSVG } from 'skb_uikit';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { apiClient } from 'api/API';
import { Item } from 'types/items';
import { ItemSelect } from 'components/ItemSelect/ItemSelect';

type ItemFormIngredient = Partial<Omit<Item, 'crafted_quantity' | 'ingredients'>>;

export type ItemForm = Omit<Item, 'id' | 'ingredients'> & { ingredients: ItemFormIngredient[] | null };

type ItemFormProps = {
  onSave: (data: ItemForm) => void;
  defaultValues?: Item;
  footer?: React.ReactNode;
  onOpenNewItemModal: () => void;
};

export const ItemForm: React.FC<ItemFormProps> = ({ onSave, defaultValues, footer, onOpenNewItemModal }) => {
  const [getIngredients, { isLoading: isLoadingIngredients }] = apiClient.useLazyGetIngredientsQuery();

  const { handleSubmit, control, setValue } = useForm<ItemForm>({ defaultValues });
  const { fields, append, remove } = useFieldArray({ control, name: 'ingredients' });

  // Загрузка ингредиентов
  useEffect(() => {
    if (defaultValues) {
      getIngredients({ id: defaultValues.id }).then(({ data }) => {
        if (!data) return;
        setValue('ingredients', data);
      });
    }
  }, []);

  return (
    <form onSubmit={handleSubmit(onSave)} className={styles.form}>
      <div className={styles.row}>
        <Controller
          name={'name'}
          control={control}
          rules={{ required: true }}
          render={({ field, formState }) => (
            <Input
              label={'Название'}
              value={field.value ?? ''}
              onChangeEvent={field.onChange}
              autoComplete={'off'}
              containerClassName={styles.nameInput}
              error={!!formState?.errors?.name}
            />
          )}
        />
        <Controller
          name={'crafted_quantity'}
          control={control}
          rules={{ required: true }}
          render={({ field, formState }) => {
            const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
              const value = e.target.value;
              if (value === '' || isNaN(Number(value))) field.onChange('');
              else field.onChange(Number(value));
            };

            return (
              <Input
                label={'Кол-во'}
                value={field.value?.toString() ?? ''}
                onChangeEvent={onChange}
                type={'number'}
                autoComplete={'off'}
                error={!!formState?.errors?.crafted_quantity}
              />
            );
          }}
        />
      </div>

      {/* Ингредиенты */}
      <h6 className={styles.subTitle}>
        Ингредиенты
        <Button onClick={onOpenNewItemModal} variant={'outlined'} size={'medium'} startIcon={<PlusSVG />}>
          Создать
        </Button>
      </h6>
      {isLoadingIngredients ? (
        <div style={{ margin: '32px auto 0' }}>
          <Refresh_spinningSVG />
        </div>
      ) : (
        <>
          <div className={styles.ingredients}>
            {fields.map((field, index) => {
              const isFirst = index === 0;
              return (
                <div key={field.id} className={styles.row}>
                  <Controller
                    name={`ingredients.${index}.id`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field, formState }) => {
                      const onChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
                        field.onChange(Number(e.target.value));
                      };

                      return (
                        <ItemSelect
                          label={isFirst ? 'Название' : undefined}
                          value={field.value}
                          onChange={onChange}
                          error={!!formState?.errors?.ingredients?.[index]?.id}
                          dropdownPosition={index > 3 ? 'top' : 'bottom'}
                        />
                      );
                    }}
                  />
                  <Controller
                    key={field.id}
                    name={`ingredients.${index}.quantity_as_ingredient`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field, formState }) => {
                      const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
                        const value = e.target.value;
                        if (value === '' || isNaN(Number(value))) field.onChange('');
                        else field.onChange(Number(value));
                      };

                      return (
                        <Input
                          label={isFirst ? 'Кол-во' : undefined}
                          value={field.value?.toString() ?? ''}
                          onChangeEvent={onChange}
                          type={'number'}
                          autoComplete={'off'}
                          error={!!formState?.errors?.ingredients?.[index]?.quantity_as_ingredient}
                        />
                      );
                    }}
                  />
                  <Button onClick={() => remove(index)} variant={'text'} className={styles.removeBtn}>
                    <BinSVG />
                  </Button>
                </div>
              );
            })}
          </div>
          <Button onClick={() => append({})} variant={'outlined'} size={'medium'} startIcon={<PlusSVG />}>
            Добавить ингредиент
          </Button>
        </>
      )}
      {footer}
    </form>
  );
};
