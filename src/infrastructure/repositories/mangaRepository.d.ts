import { IMangaRepository, CreateMangaDTO, UpdateMangaDTO, Manga } from '../../domain/manga';
export declare class MangaRepository implements IMangaRepository {
    findAll(page: number, pageSize: number): Promise<{
        data: Manga[];
        total: number;
    }>;
    findById(id: string): Promise<Manga | null>;
    create(manga: CreateMangaDTO): Promise<Manga>;
    update(id: string, manga: UpdateMangaDTO): Promise<Manga>;
    delete(id: string): Promise<void>;
}
//# sourceMappingURL=mangaRepository.d.ts.map