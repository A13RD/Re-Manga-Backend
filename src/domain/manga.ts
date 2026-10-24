export interface Manga {
  id: string;
  title: string;
  volume: number | null;
  author: string;
  genre: string;
  description: string;
  image: string | null;
  price: any; // Prisma.Decimal equivalent
  condition: string;
  stock: number;
  sellerId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateMangaDTO {
  title: string;
  volume?: number;
  author: string;
  genre: string;
  description: string;
  image?: string;
  price: number;
  condition: string;
  stock: number;
}

export interface UpdateMangaDTO extends Partial<CreateMangaDTO> {}

export interface IMangaRepository {
  findAll(page: number, pageSize: number): Promise<{ data: Manga[], total: number }>;
  findById(id: string): Promise<Manga | null>;
  create(manga: CreateMangaDTO): Promise<Manga>;
  update(id: string, manga: UpdateMangaDTO): Promise<Manga>;
  delete(id: string): Promise<void>;
}
