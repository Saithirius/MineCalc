// Проверяет наличие "непустых" значений
export const hasNonEmptyValues = (filters: Record<string, any>): boolean => {
  return Object.values(filters).some((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    return value !== undefined && value !== null;
  });
};

// Функция очищает объект от пустых значений
export const cleanObject = (obj: Record<string, any>): Record<string, any> => {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        return acc; // пропускаем, не добавляем в итоговый объект
      }

      // Если значение — вложенный объект, рекурсивно очищаем его
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedValue = cleanObject(value); // рекурсивно очищаем вложенный объект
        if (Object.keys(cleanedValue).length > 0) {
          acc[key] = cleanedValue;
        }
      } else {
        acc[key] = value; // добавляем в итоговый объект только "чистые" значения
      }

      return acc;
    },
    {} as Record<string, any>,
  );
};

/**
 * Создает новый объект без указанных ключей
 */
export const omit = <T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
  const result = {} as T;
  Object.keys(obj).forEach((key) => {
    if (!keys.includes(key as K)) {
      result[key as K] = obj[key];
    }
  });
  return result as Omit<T, K>;
};
