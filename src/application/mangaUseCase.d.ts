import { IMangaRepository, CreateMangaDTO, UpdateMangaDTO } from '../domain/manga';
export declare class MangaUseCase {
    private mangaRepository;
    constructor(mangaRepository: IMangaRepository);
    getAllMangas(page: number, pageSize: number): Promise<{
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
        data: import("../domain/manga").Manga[];
    }>;
    getMangaById(id: string): Promise<import("../domain/manga").Manga>;
    createManga(mangaData: CreateMangaDTO): Promise<import("../domain/manga").Manga>;
    updateManga(id: string, mangaData: UpdateMangaDTO): Promise<import("../domain/manga").Manga>;
    deleteManga(id: string): Promise<void>;
}
//# sourceMappingURL=mangaUseCase.d.ts.map