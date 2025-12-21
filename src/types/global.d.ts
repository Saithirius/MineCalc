type NonNullableT<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};

type DeepRequired<T> = T extends Function | boolean | number | string | symbol
  ? T
  : T extends Array<infer U>
    ? Array<DeepRequired<U>> // Для массивов
    : T extends object
      ? { [K in keyof T]-?: DeepRequired<T[K]> } // Для объектов
      : T; // Для других типов
