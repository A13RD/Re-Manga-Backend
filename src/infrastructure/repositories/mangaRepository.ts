import { IMangaRepository, CreateMangaDTO, UpdateMangaDTO, Manga } from '../../domain/manga';
import { prisma } from '../database/prismaClient';
import { MangaCondition, Prisma } from '@prisma/client';

function mapCondition(condition: string): MangaCondition {
  switch (condition.toUpperCase()) {
    case 'NEW': return MangaCondition.NEW;
    case 'LIKE_NEW': return MangaCondition.LIKE_NEW;
    case 'GOOD': return MangaCondition.GOOD;
    case 'FAIR': return MangaCondition.FAIR;
    case 'POOR': return MangaCondition.POOR;
    default: return MangaCondition.GOOD;
  }
}

export class MangaRepository implements IMangaRepository {
  async findAll(page: number, pageSize: number): Promise<{ data: Manga[]; total: number }> {
    const skip = (page - 1) * pageSize;
    
    const [data, total] = await Promise.all([
      prisma.manga.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.manga.count()
    ]);

    return { data: data as any, total };
  }

  async findById(id: string): Promise<Manga | null> {
    const manga = await prisma.manga.findUnique({ where: { id } });
    return manga as any;
  }

  async create(manga: CreateMangaDTO): Promise<Manga> {
    const created = await prisma.manga.create({
      data: {
        title: manga.title,
        volume: manga.volume ?? null,
        author: manga.author,
        genre: manga.genre,
        description: manga.description,
        image: manga.image ?? null,
        price: new Prisma.Decimal(manga.price),
        condition: mapCondition(manga.condition),
        stock: manga.stock
      }
    });
    return created as any;
  }

  async update(id: string, manga: UpdateMangaDTO): Promise<Manga> {
    const dataToUpdate: any = { ...manga };
    
    if (manga.price !== undefined) {
      dataToUpdate.price = new Prisma.Decimal(manga.price);
    }
    if (manga.condition !== undefined) {
      dataToUpdate.condition = mapCondition(manga.condition);
    }

    const updated = await prisma.manga.update({
      where: { id },
      data: dataToUpdate
    });
    return updated as any;
  }

  async delete(id: string): Promise<void> {
    await prisma.manga.delete({ where: { id } });
  }
}
