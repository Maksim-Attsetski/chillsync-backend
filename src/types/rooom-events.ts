export enum ERoomEvents {
  CREATE_ROOM = 'create_room',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  CLOSE_ROOM = 'close_room',
  RELOAD_ROOM = 'reload_room',

  START_EVENT = 'event_start',
  GENRES_SELECTED = 'event_genres_selected',
  MOVIES_SELECTED = 'event_movies_selected',

  ERROR = 'error',
}

export enum ERoomEmits {
  USER_LEFT = 'user_left',
  ROOM_CREATED = 'room_created',
  ROOM_REPLENISHED = 'room_replanished',
  ROOM_CLOSED = 'room_closed',

  GENRES_LIST_UPDATED = 'genres_list',
  MOVIES_LIST_UPDATED = 'movies_list',
  EVENT_RESULTS = 'event_results',
}
