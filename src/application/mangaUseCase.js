"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaUseCase = void 0;
class MangaUseCase {
    mangaRepository;
    constructor(mangaRepository) {
        this.mangaRepository = mangaRepository;
    }
    async getAllMangas(page, pageSize) {
        if (page < 1)
            page = 1;
        if (pageSize < 1)
            pageSize = 6;
        const { data, total } = await this.mangaRepository.findAll(page, pageSize);
        const totalPages = Math.ceil(total / pageSize);
        return {
            pagination: {
                page,
                pageSize,
                total,
                totalPages
            },
            data
        };
    }
    async getMangaById(id) {
        const manga = await this.mangaRepository.findById(id);
        if (!manga) {
            throw new Error('Manga not found');
        }
        return manga;
    }
    async createManga(mangaData) {
        return this.mangaRepository.create(mangaData);
    }
    async updateManga(id, mangaData) {
        const manga = await this.mangaRepository.findById(id);
        if (!manga) {
            throw new Error('Manga not found');
        }
        return this.mangaRepository.update(id, mangaData);
    }
    async deleteManga(id) {
        const manga = await this.mangaRepository.findById(id);
        if (!manga) {
            throw new Error('Manga not found');
        }
        return this.mangaRepository.delete(id);
    }
}
exports.MangaUseCase = MangaUseCase;
//# sourceMappingURL=mangaUseCase.js.map