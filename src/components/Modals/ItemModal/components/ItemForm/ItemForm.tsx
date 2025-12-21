import React, { useEffect, useId } from 'react';
import styles from './ItemForm.module.scss';
import { BinSVG, Button, Input, PlusSVG, Refresh_spinningSVG, useModal, useStateBool } from 'skb_uikit';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { apiClient } from 'api/API';
import { Item } from 'types/items';
import { ItemModal } from 'components/Modals/ItemModal/ItemModal';
import { ItemSelect } from 'components/ItemSelect/ItemSelect';

export type ItemForm = Omit<Item, 'id' | 'ingredients'> & { ingredients: { id: string; name: string; quantity: string }[] };

type ItemFormProps = {
  onSave: (data: ItemForm) => void;
  defaultValues?: Item;
  footer?: React.ReactNode;
};

export const ItemForm: React.FC<ItemFormProps> = ({ onSave, defaultValues, footer }) => {
  const modalId = useId();
  const newItemModalState = useModal(modalId);

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
    <>
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
            name={'quantity'}
            control={control}
            rules={{ required: true }}
            render={({ field, formState }) => (
              <Input
                label={'Кол-во'}
                value={field.value ?? ''}
                onChangeEvent={field.onChange}
                type={'number'}
                autoComplete={'off'}
                error={!!formState?.errors?.quantity}
              />
            )}
          />
        </div>

        {/* Ингредиенты */}
        <h6 className={styles.subTitle}>
          Ингредиенты
          <Button onClick={newItemModalState.openModal} variant={'outlined'} size={'medium'} startIcon={<PlusSVG />}>
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
                        return (
                          <ItemSelect
                            label={isFirst ? 'Название' : undefined}
                            value={field.value ?? ''}
                            onChange={field.onChange}
                            error={!!formState?.errors?.ingredients?.[index]?.id}
                          />
                        );
                      }}
                    />
                    <Controller
                      key={field.id}
                      name={`ingredients.${index}.quantity`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field, formState }) => (
                        <Input
                          label={isFirst ? 'Кол-во' : undefined}
                          value={field.value ?? ''}
                          onChangeEvent={field.onChange}
                          type={'number'}
                          autoComplete={'off'}
                          error={!!formState?.errors?.ingredients?.[index]?.quantity}
                        />
                      )}
                    />
                    <Button onClick={() => remove(index)} variant={'text'} className={styles.removeBtn}>
                      <BinSVG />
                    </Button>
                  </div>
                );
              })}
            </div>
            <Button onClick={() => append({ id: '', name: '', quantity: '' })} variant={'outlined'} size={'medium'} startIcon={<PlusSVG />}>
              Добавить ингредиент
            </Button>
          </>
        )}
        {footer}
      </form>

      {/* Модалки */}
      {newItemModalState.isOpen && <ItemModal isOpen={true} onClose={newItemModalState.closeModal} />}
    </>
  );
};
