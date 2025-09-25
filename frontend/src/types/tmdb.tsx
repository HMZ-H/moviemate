export interface TMDBItem {
    id: number;
    title?: string;          // movies
    name?: string;           // tv shows
    release_date?: string;
    first_air_date?: string;
    poster_path: string | null;
    backdrop_path?: string | null;
    overview?: string;
    vote_average?: number;
    runtime?: number;        // movies
    episode_run_time?: number[]; // tv
    genres?: { id: number; name: string }[];
    media_type?: "movie" | "tv";
    videos?: {
      results: TMDBVideo[];
    };
  }

export interface TMDBVideo {
  key: string;
  site: string;
  type: string;
  official: boolean;
  name: string;
  published_at: string;
}
  