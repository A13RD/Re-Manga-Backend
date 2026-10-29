import { Manga } from './manga.js';

export interface Favorite {
  id: string;
  userId: string;
  mangaId: string;
  createdAt: Date;
  manga?: Manga;
}

export interface IFavoriteRepository {
  findByUserId(userId: string): Promise<Favorite[]>;
  isFavorite(userId: string, mangaId: string): Promise<boolean>;
  add(userId: string, mangaId: string): Promise<Favorite>;
  remove(userId: string, mangaId: string): Promise<void>;
}
