import { IMangaRepository, CreateMangaDTO, UpdateMangaDTO, Manga, MangaFilterOptions } from '../../domain/manga';
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

function buildGenreWhere(genreRaw: string): Prisma.MangaWhereInput {
  const normalized = genreRaw.trim().toLowerCase();
  if (normalized === 'shonen' || normalized === 'shounen') {
    return {
      OR: [
        { genre: { equals: 'Shonen', mode: 'insensitive' } },
        { genre: { equals: 'Shounen', mode: 'insensitive' } },
      ],
    };
  }
  if (normalized === 'shojo' || normalized === 'shoujo') {
    return {
      OR: [
        { genre: { equals: 'Shojo', mode: 'insensitive' } },
        { genre: { equals: 'Shoujo', mode: 'insensitive' } },
      ],
    };
  }
  return {
    genre: { equals: genreRaw.trim(), mode: 'insensitive' },
  };
}

export class MangaRepository implements IMangaRepository {
  async findAll(
    page: number,
    pageSize: number,
    filters?: MangaFilterOptions
  ): Promise<{ data: Manga[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const andConditions: Prisma.MangaWhereInput[] = [];

    if (filters?.search && filters.search.trim().length > 0) {
      andConditions.push({
        title: {
          contains: filters.search.trim(),
          mode: 'insensitive',
        },
      });
    }

    if (filters?.genre && filters.genre.trim().length > 0 && filters.genre.trim().toLowerCase() !== 'todos') {
      andConditions.push(buildGenreWhere(filters.genre));
    }

    const where: Prisma.MangaWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const [data, total] = await Promise.all([
      prisma.manga.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.manga.count({ where }),
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
    const dataToUpdate: Record<string, unknown> = {};

    if (manga.title !== undefined) dataToUpdate.title = manga.title;
    if (manga.volume !== undefined) dataToUpdate.volume = manga.volume;
    if (manga.author !== undefined) dataToUpdate.author = manga.author;
    if (manga.genre !== undefined) dataToUpdate.genre = manga.genre;
    if (manga.description !== undefined) dataToUpdate.description = manga.description;
    if (manga.image !== undefined) dataToUpdate.image = manga.image || null;
    if (manga.stock !== undefined) dataToUpdate.stock = manga.stock;
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
