import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import Fuse from 'fuse.js';
import { Model } from 'mongoose';
import { Errors, IQuery, MongoUtils } from 'src/utils';

import { CreateMovieDto } from './dto/create-movie.dto';
import { GetMovieDto } from './dto/get-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie, MovieDocument } from './movies.entity';

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
  ) {}

  // нормализатор (вставь сюда тот, что выше)
  private normalizeTitle(s: string) {
    return s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  async createManyMovies(dtoList: CreateMovieDto[]) {
    await this.movieModel.bulkWrite(
      dtoList.map((obj) => ({
        updateOne: {
          filter: { id: obj?.id }, // например email
          update: {
            $set: { ...obj, normalized_title: this.normalizeTitle(obj?.title) },
          },
          upsert: true,
        },
      })),
    );

    const movies = await this.movieModel.find({
      id: { $in: dtoList.map((d) => d.id) },
    });
    return movies;
  }

  async findAll(query: IQuery) {
    return await MongoUtils.getAll({
      model: this.movieModel,
      dto: GetMovieDto,
      query,
    });
  }

  /**
   * raw — строка с названиями (переносы строк)
   * options — пороги/параметры для настройки
   */
  async findMoviesByTitles(
    raw: string,
    options?: {
      maxCandidatesPerQuery?: number; // сколько кандидатов брать с текстового поиска
      fuseThreshold?: number; // порог Fuse (0..1, меньше — строже)
      limitPerTitle?: number; // сколько результатов вернуть на одно название
    },
  ) {
    const {
      maxCandidatesPerQuery = 200,
      fuseThreshold = 0.4,
      limitPerTitle = 10,
    } = options ?? {};

    // 1) подготовка входа
    const titles = Array.from(
      new Set(
        raw
          .split('#$%')
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    );

    if (titles.length === 0) return [];

    const normalizedMap = new Map<string, string>(); // orig -> normalized
    for (const t of titles) normalizedMap.set(t, this.normalizeTitle(t));

    const normalizedTitles = Array.from(
      new Set(Array.from(normalizedMap.values())),
    );

    // 2) быстрый точный поиск по title_normalized
    const exactMatches = await this.movieModel
      .find({ title_normalized: { $in: normalizedTitles } })
      .lean()
      .exec();

    // Map normalized -> movie[]
    const foundByNormalized = new Map<string, MovieDocument[]>();
    for (const m of exactMatches) {
      const key = (
        m.normalized_title ?? this.normalizeTitle(m.title)
      ).toString();
      const arr = foundByNormalized.get(key) ?? [];
      arr.push(m);
      foundByNormalized.set(key, arr);
    }

    // 3) для тех оригинальных названий, которые не совпали точно — fuzzy flow
    const remaining = titles.filter(
      (t) => !foundByNormalized.has(normalizedMap.get(t)!),
    );

    // результатовый контейнер: origTitle -> MovieDoc[]
    const resultsMap = new Map<string, MovieDocument[]>();

    // добавляем найденные точные совпадения
    for (const [orig, norm] of normalizedMap.entries()) {
      if (foundByNormalized.has(norm)) {
        resultsMap.set(orig, foundByNormalized.get(norm)!);
      }
    }

    // 4) для оставшихся: получить кандидатов через text search и прогнать Fuse
    // Важно: делаем по одному запросу на каждое оставшееся название, но ограничиваем кандидатов.
    // Если список очень большой — нужно батчить / ограничивать parallelism (ниже совет).
    for (const title of remaining) {
      const norm = normalizedMap.get(title)!;

      // попытка: text search по исходной (или нормализованной) — отдаёт релевантных кандидатов
      // Используем text index: этот запрос будет быстрым и вернёт релевантные топы
      const candidates: MovieDocument[] = await this.movieModel
        .find(
          { $text: { $search: `"${title}"` } },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(maxCandidatesPerQuery)
        .lean()
        .exec();

      // если text search ничего не дал — как fallback берём ближайшие по prefix (малый набор)
      if (!candidates.length) {
        const fallback = await this.movieModel
          .find({
            title_normalized: {
              $regex: new RegExp(norm.split(' ')[0] || norm, 'i'),
            },
          })
          .limit(50)
          .lean()
          .exec();
        candidates.push(...fallback);
      }

      if (!candidates.length) {
        resultsMap.set(title, []);
        continue;
      }

      // 5) fuzzy match на кандидатах с Fuse.js
      const fuse = new Fuse(candidates, {
        keys: ['title', 'title_normalized'],
        threshold: fuseThreshold, // 0.4 — разумный старт (меньше = строже)
        ignoreLocation: true,
        useExtendedSearch: true,
      });

      const fuseRes = fuse.search(title, { limit: limitPerTitle });

      const matches = fuseRes.map((r) => r?.item);
      resultsMap.set(title, matches);
    }

    // 6) формируем финальный массив: можно вернуть map или список совпадений
    // Верну массив объектов { query: string, matches: MovieDoc[] }
    const output = Array.from(normalizedMap.keys()).map((orig) => ({
      query: orig,
      matches: resultsMap.get(orig) ?? [],
    }));

    return output;
  }

  async findOne(id: string) {
    return await MongoUtils.get({
      model: this.movieModel,
      error: 'Movie',
      id,
      dto: GetMovieDto,
    });
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    return await MongoUtils.update({
      model: this.movieModel,
      error: 'Movie',
      id,
      data: updateMovieDto,
    });
  }

  async remove(id: string) {
    const item = await this.movieModel.findByIdAndDelete(id);

    if (!item) throw Errors.notFound('Movie');
    return item._id;
  }
}
