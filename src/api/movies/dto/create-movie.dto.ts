export class CreateMovieDto {
  id: number;
  adult: false;
  genre_ids: number[];
  poster_path: string;
  title: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  reaction: string;
}
