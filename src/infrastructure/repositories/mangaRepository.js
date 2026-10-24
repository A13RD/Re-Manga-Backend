"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaRepository = void 0;
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
class MangaRepository {
    async findAll(page, pageSize) {
        const skip = (page - 1) * pageSize;
        const [data, total] = await Promise.all([
            prismaClient_1.prisma.manga.findMany({
                skip,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prismaClient_1.prisma.manga.count()
        ]);
        return { data: data, total };
    }
    async findById(id) {
        const manga = await prismaClient_1.prisma.manga.findUnique({ where: { id } });
        return manga;
    }
    async create(manga) {
        const created = await prismaClient_1.prisma.manga.create({
            data: {
                title: manga.title,
                volume: manga.volume,
                author: manga.author,
                genre: manga.genre,
                description: manga.description,
                image: manga.image,
                price: new client_1.Prisma.Decimal(manga.price),
                condition: mapCondition(manga.condition),
                stock: manga.stock
            }
        });
        return created;
    }
    async update(id, manga) {
        const dataToUpdate = { ...manga };
        if (manga.price !== undefined) {
            dataToUpdate.price = new client_1.Prisma.Decimal(manga.price);
        }
        if (manga.condition !== undefined) {
            dataToUpdate.condition = mapCondition(manga.condition);
        }
        const updated = await prismaClient_1.prisma.manga.update({
            where: { id },
            data: dataToUpdate
        });
        return updated;
    }
    async delete(id) {
        await prismaClient_1.prisma.manga.delete({ where: { id } });
    }
}
exports.MangaRepository = MangaRepository;
//# sourceMappingURL=mangaRepository.js.map