import { JSX } from "react";

export type Movies = MovieDetails[];

export interface MovieDetails {
  id: string;
  name: string;
  backdrop_path: string;
  poster: string;
  poster_alt?: string;
  duration: string;
  year: string;
  language?: string;
  description: string | null;
  download_links?: {
    name: string;
    url: string;
    quality?: string;
  }[];
  genre?: string[];
  iframe_src?: string;
  quality?: string;
  rating?: string;
  release_date?: string;
  tags?: string[];
  url?: string;
}