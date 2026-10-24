"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleRequestRepository = void 0;
const prismaClient_1 = require("../database/prismaClient");
const client_1 = require("@prisma/client");
function mapCondition(condition) {
    switch (condition.toUpperCase()) {
        case 'NEW': return client_1.MangaCondition.NEW;
        case 'LIKE_NEW': return client_1.MangaCondition.LIKE_NEW;
        case 'GOOD': return client_1.MangaCondition.GOOD;
        case 'FAIR': return client_1.MangaCondition.FAIR;
        case 'POOR': return client_1.MangaCondition.POOR;
        default: return client_1.MangaCondition.GOOD;
    }
}
class SaleRequestRepository {
    async findAll() {
        const requests = await prismaClient_1.prisma.saleRequest.findMany({
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true, email: true } }, manga: { select: { title: true } } }
        });
        return requests;
    }
    async findByUserId(userId) {
        const requests = await prismaClient_1.prisma.saleRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: { manga: { select: { title: true } } }
        });
        return requests;
    }
    async create(userId, request) {
        const created = await prismaClient_1.prisma.saleRequest.create({
            data: {
                userId: userId,
                title: request.title,
                volume: request.volume,
                author: request.author,
                genre: request.genre,
                description: request.description,
                image: request.image,
                proposedPrice: new client_1.Prisma.Decimal(request.proposedPrice),
                condition: mapCondition(request.condition),
                mangaId: request.mangaId
            }
        });
        return created;
    }
}
exports.SaleRequestRepository = SaleRequestRepository;
//# sourceMappingURL=saleRequestRepository.js.map