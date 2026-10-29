import { IFavoriteRepository, Favorite } from '../domain/favorite.js';

export class FavoriteUseCase {
  constructor(private favoriteRepository: IFavoriteRepository) {}

  async getUserFavorites(userId: string): Promise<Favorite[]> {
    return this.favoriteRepository.findByUserId(userId);
  }

  async isFavorite(userId: string, mangaId: string): Promise<boolean> {
    return this.favoriteRepository.isFavorite(userId, mangaId);
  }

  async addFavorite(userId: string, mangaId: string): Promise<Favorite> {
    return this.favoriteRepository.add(userId, mangaId);
  }

  async removeFavorite(userId: string, mangaId: string): Promise<void> {
    return this.favoriteRepository.remove(userId, mangaId);
  }
}

