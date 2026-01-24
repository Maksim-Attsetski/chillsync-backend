import { Document, Model, PopulateOptions } from 'mongoose';

import { Errors, FindUtils, IQuery } from '.';

type DTOClass<R> = new () => R; // DTO без параметров конструктора

export interface IArrayRes<R extends Document<any> = any> {
  data: R[];
  count: number;
  last: boolean;
}

interface IProps<D extends Model<any>> {
  model: D;
  data?: Partial<any>;
  id?: string;
  dto?: DTOClass<any> | boolean;
  error?: string;
  query?: IQuery;
  findParams?: Partial<D>;
  populate?: string | PopulateOptions | PopulateOptions[];
}

class MongoUtils {
  private getPopulateKeys<R extends Document<any>>(
    dto?: DTOClass<R> | boolean,
  ): string[] | undefined {
    if (!dto || typeof dto === 'boolean') return undefined;
    // берём только собственные свойства DTO, методы игнорируются
    return Object.getOwnPropertyNames(new dto());
  }

  async getAll<D extends Model<any>, R extends Document<any>>({
    model,
    dto,
    query,
    populate,
  }: IProps<D>): Promise<IArrayRes<R>> {
    const all = (await FindUtils.getAllWithQuery(
      model,
      query,
      dto,
      populate,
    )) as unknown as R[];

    const count = await model.countDocuments(
      FindUtils.getFilter(query?.filter),
    );
    const last =
      query?.page && query?.limit ? count / query.limit <= query.page : false;

    return { data: all, count, last };
  }

  async get<D extends Model<any>, R extends Document<any>>({
    model,
    id,
    dto,
    error,
  }: IProps<D>): Promise<R> {
    const item = await model.findById(id);
    if (!item) throw Errors.notFound(error);

    if (dto) {
      const keys = this.getPopulateKeys(dto);
      const populated: R = keys ? await item.populate(keys) : item;
      return populated;
    }

    return item as R;
  }

  async create<D extends Model<any>, R extends Document<any>>({
    model,
    findParams,
    data,
    dto,
    error,
  }: IProps<D>): Promise<R> {
    const item = findParams ? await model.findOne(findParams) : null;
    if (item) throw Errors.badRequest(error);

    const newItem = await model.create({
      ...(data as R),
      created_at: new Date(),
    });

    if (dto) {
      const keys = this.getPopulateKeys(dto);
      const populated = keys ? await newItem.populate(keys) : newItem;
      return populated as unknown as R;
    }

    return newItem as R;
  }

  async update<D extends Model<any>, R extends Document<any>>({
    model,
    id,
    data,
    dto,
    error,
    populate,
  }: IProps<D>): Promise<R> {
    const item = await model.findByIdAndUpdate(
      id,
      { ...(data as Partial<D>), updated_at: new Date() },
      { new: true },
    );
    if (!item) throw Errors.notFound(error);

    if (dto) {
      const keys = populate || this.getPopulateKeys(dto);
      const populated = keys ? await item.populate(keys as any) : item;
      return populated as unknown as R;
    }

    return item as R;
  }

  async delete<D extends Model<any>>({
    model,
    id,
    error,
  }: IProps<D>): Promise<string | null> {
    const item = await model.findOneAndDelete({ _id: id });
    if (!item) throw Errors.notFound(error);
    return item as string | null;
  }
}

export default new MongoUtils();
