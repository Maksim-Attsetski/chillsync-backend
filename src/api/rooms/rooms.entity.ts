import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Base } from 'src/types';

import { TRoomMovie } from './dto/get.dto';

export type RoomsDocument = HydratedDocument<Room>;

@Schema()
export class Room extends Base {
  /**
   * Итоговый список фильмов-победителей (id или tmdbId)
   */
  @Prop({
    type: [String],
    default: [],
  })
  movies: string[];

  /**
   * Пользователи в комнате
   */
  @Prop({
    type: [String],
    required: true,
  })
  users: string[];

  /**
   * Создатель комнаты
   */
  @Prop({
    type: String,
    required: true,
  })
  creator_id: string | null;

  /**
   * userId -> genreIds[]
   */
  @Prop({
    type: Object,
    of: [Number],
    default: {},
  })
  genresSelections: Record<string, number[]>;

  /**
   * userId -> выбранные фильмы
   */
  @Prop({
    type: Object,
    of: [
      {
        id: { type: Number, required: true },
        reaction: {
          type: String,
          enum: ['LIKE', 'DISLIKE'],
          required: true,
        },
      },
    ],
    default: {},
  })
  movieSelections: Record<string, TRoomMovie[]>;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
