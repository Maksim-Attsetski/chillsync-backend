import { Document } from 'mongoose';

export interface IListForChange {
  field: string;
  value: any;
  add?: boolean;
}

type TData<T> = Document<unknown, object, Document<unknown, object, T> & any> &
  Omit<any, any>;

export const changeArray = async <T>(
  list: IListForChange[],
  dto: any,
  data: TData<T>,
) => {
  const dtoKeys: string[] = Object.keys(new dto());

  list.forEach((item) => {
    const isValidField = dtoKeys.some((key) => key === item.field);
    if (!isValidField) {
      throw new Error('Не валидное поле');
    }

    if (!Array.isArray(data[item.field])) {
      throw new Error('Не массив');
    }
    const currentField: string[] = data[item.field] || [];
    data[item.field] = item?.add
      ? [...currentField, item.value]
      : currentField.filter((key) => `${key}` !== `${item.value}`);
  });

  await data.save();
};
