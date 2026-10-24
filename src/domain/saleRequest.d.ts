export interface SaleRequest {
    id: string;
    userId: string;
    mangaId: string | null;
    title: string;
    volume: number | null;
    author: string;
    genre: string;
    description: string;
    image: string | null;
    proposedPrice: any;
    condition: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateSaleRequestDTO {
    title: string;
    volume?: number;
    author: string;
    genre: string;
    description: string;
    image?: string;
    proposedPrice: number;
    condition: string;
    mangaId?: string;
}
export interface ISaleRequestRepository {
    findAll(): Promise<SaleRequest[]>;
    findByUserId(userId: string): Promise<SaleRequest[]>;
    create(userId: string, request: CreateSaleRequestDTO): Promise<SaleRequest>;
}
//# sourceMappingURL=saleRequest.d.ts.map