import { ISaleRequestRepository, CreateSaleRequestDTO, SaleRequest } from '../../domain/saleRequest';
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

export class SaleRequestRepository implements ISaleRequestRepository {
  async findAll(): Promise<SaleRequest[]> {
    const requests = await prisma.saleRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, email: true } }, manga: { select: { title: true } } }
    });
    return requests as any;
  }

  async findByUserId(userId: string): Promise<SaleRequest[]> {
    const requests = await prisma.saleRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { manga: { select: { title: true } } }
    });
    return requests as any;
  }

  async create(userId: string, request: CreateSaleRequestDTO): Promise<SaleRequest> {
    const created = await prisma.saleRequest.create({
      data: {
        userId: userId,
        title: request.title,
        volume: request.volume ?? null,
        author: request.author,
        genre: request.genre,
        description: request.description,
        image: request.image ?? null,
        proposedPrice: new Prisma.Decimal(request.proposedPrice),
        condition: mapCondition(request.condition),
        mangaId: request.mangaId ?? null
      }
    });
    return created as any;
  }
}
