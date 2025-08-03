import { PopulateOptions } from 'mongoose';
import { Errors } from '.';

export interface IQuery {
  limit?: number;
  page?: number;
  dependencies?: boolean | string[];
  search?: string;
  filter?: string;
  sort?: string;
}

class FindUtils {
  splitter(params: string, separator: RegExp | string) {
    return (
      params
        .split(separator)
        .filter((el) => el.trim() !== '')
        .map((el) => el.trim().replace(/(%20)/g, ' ')) || []
    );
  }

  formatFilter(query: string) {
    const arrayConditions = {
      _in_: 'in',
      _not_in_: 'not-in',
      _contains_any_: 'array-contains-any',
      _contains_: 'array-contains',
    };
    // ***
    // NOTE:
    //   The order of the symbols is very important for RegExp creating!
    // ***
    const validConditionSymbols = [
      '<=',
      '>=',
      '>',
      '<',
      '==',
      '!=',
      ...Object.keys(arrayConditions),
    ];

    const reValidConditionSymbols = `(${validConditionSymbols.join('|')}){1}`;
    const re = new RegExp(
      `${reValidConditionSymbols}|[a-zа-я\\d;,_.+@ -]`,
      'gi',
    );
    const parsedFilterKeyValues = this.splitter(query, ';');

    if (
      query.replace(re, '').length ||
      !parsedFilterKeyValues ||
      !parsedFilterKeyValues.length
    ) {
      throw Errors.badRequest(
        `Filter template can be the following: filter=k1==v1;k2>=v2;k3!=v3;k4_in_v4,v5;k5_contains_v6,v7\nValid condition symbols are ${validConditionSymbols}.`,
      );
    }

    return parsedFilterKeyValues.reduce((acc, keyValues) => {
      const separator = new RegExp(reValidConditionSymbols, 'gi');
      const [key, parsedCondition, parsedValue] = this.splitter(
        keyValues,
        separator,
      );

      const condition = arrayConditions[parsedCondition] || parsedCondition;

      let value: any;

      value = /,/g.test(parsedValue) ? parsedValue.split(',') : parsedValue; // check on Array<string>
      value =
        Array.isArray(value) && value.every((item) => !Number.isNaN(+item))
          ? value.map((item) => +item)
          : value; // check on Array<number>
      value = !Number.isNaN(+value) && !value.startsWith('+') ? +value : value; // check on number
      value = value === 'null' ? null : value; // check on null
      value = value === 'true' ? true : value; // check on boolean true
      value = value === 'false' ? false : value; // check on boolean false

      if (
        Object.keys(arrayConditions).some((item) => item === parsedCondition) &&
        !Array.isArray(value)
      ) {
        value = [value];
      }

      return [...acc, { key, condition, value }];
    }, []);
  }

  getFilter(query?: string) {
    if (!query) {
      return {};
    }

    const curFilter = this.formatFilter(query);

    return curFilter.reduce(
      (result: any, { key, condition, value }) => {
        result.$and.push(
          {
            '!=': { [key]: { $ne: value } },
            '==': { [key]: value },
            '>=': { [key]: { $gte: value } },
            '>': { [key]: { $gt: value } },
            '<=': { [key]: { $lte: value } },
            '<': { [key]: { $lt: value } },
            'array-contains': {
              $and: Array.isArray(value)
                ? value.map((it) => ({ [key]: { $in: it } }))
                : [{}],
            },
            'array-contains-any': { [key]: { $in: value } },
            'not-in': { [key]: { $nin: value } },
            in: { [key]: { $in: value } },
            expr: { $expr: value },
          }[condition],
        );

        return result;
      },
      { $and: [] },
    );
  }

  getSearch(searchQuery?: string) {
    if (!searchQuery) return {};
    const curFilter = this.formatFilter(searchQuery);

    return curFilter.reduce((result, { key, value }) => {
      return { ...result, [key]: { $regex: new RegExp(value, 'gim') } };
    }, {});
  }

  getPagination(query?: IQuery) {
    if (!query) return {};
    const currentQuery = {} as IQuery;
    const page = query?.page || 0;
    const dependencies = query?.dependencies || 'false';

    currentQuery.limit = query?.limit || 10;
    currentQuery.page = (page > 1 ? page - 1 : 0) * currentQuery.limit;
    currentQuery.dependencies = JSON.parse(`${dependencies}`);

    return currentQuery;
  }

  getSorting(value?: string) {
    if (!value) return {};
    const sort = this.formatFilter(value);

    return sort.reduce((acc: any, { key, value }) => {
      return {
        ...acc,
        [key]: { asc: 1, desc: -1 }[value],
      };
    }, {});
  }

  async getAllWithQuery(
    model: any,
    query?: IQuery,
    dto: any = {},
    options?: string | PopulateOptions | PopulateOptions[],
  ) {
    const { limit, page, dependencies } = this.getPagination(query);
    const search = this.getSearch(query?.search);
    const filter = this.getFilter(query?.filter);
    const sorting = this.getSorting(query?.sort);

    const keys = Object.keys(new dto());
    const dependenciesIsObj =
      typeof dependencies === 'object' ? dependencies : keys;

    const populateDocs = dependencies ? dependenciesIsObj : [];

    return await model
      .find({ ...search, ...filter })
      .select(keys)
      .limit(limit)
      .skip(page)
      .populate(populateDocs)
      .populate(dependencies ? options : [])
      .sort(sorting);
  }
}

export default new FindUtils();
