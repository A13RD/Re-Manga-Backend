import { IFavoriteRepository, Favorite } from '../../domain/favorite.js';
import { prisma } from '../database/prismaClient.js';

export class FavoriteRepository implements IFavoriteRepository {
  async findByUserId(userId: string): Promise<Favorite[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        manga: true,
      },
    });
    return favorites as any;
  }

  async isFavorite(userId: string, mangaId: string): Promise<boolean> {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
    });
    return Boolean(favorite);
  }

  async add(userId: string, mangaId: string): Promise<Favorite> {
    const created = await prisma.favorite.upsert({
      where: {
        userId_mangaId: {
          userId,
          mangaId,
        },
      },
      update: {},
      create: {
        userId,
        mangaId,
      },
      include: {
        manga: true,
      },
    });
    return created as any;
  }

  async remove(userId: string, mangaId: string): Promise<void> {
    await prisma.favorite.deleteMany({
      where: {
        userId,
        mangaId,
      },
    });
  }
}
