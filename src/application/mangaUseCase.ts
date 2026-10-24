import { IMangaRepository, CreateMangaDTO, UpdateMangaDTO } from '../domain/manga';

export class MangaUseCase {
  constructor(private mangaRepository: IMangaRepository) {}

  async getAllMangas(page: number, pageSize: number) {
    if (page < 1) page = 1;
    if (pageSize < 1) pageSize = 6;
    
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

  async getMangaById(id: string) {
    const manga = await this.mangaRepository.findById(id);
    if (!manga) {
      throw new Error('Manga not found');
    }
    return manga;
  }

  async createManga(mangaData: CreateMangaDTO) {
    return this.mangaRepository.create(mangaData);
  }

  async updateManga(id: string, mangaData: UpdateMangaDTO) {
    const manga = await this.mangaRepository.findById(id);
    if (!manga) {
      throw new Error('Manga not found');
    }
    return this.mangaRepository.update(id, mangaData);
  }

  async deleteManga(id: string) {
    const manga = await this.mangaRepository.findById(id);
    if (!manga) {
      throw new Error('Manga not found');
    }
    return this.mangaRepository.delete(id);
  }
}
