import { ISaleRequestRepository, CreateSaleRequestDTO, SaleRequest } from '../../domain/saleRequest';
export declare class SaleRequestRepository implements ISaleRequestRepository {
    findAll(): Promise<SaleRequest[]>;
    findByUserId(userId: string): Promise<SaleRequest[]>;
    create(userId: string, request: CreateSaleRequestDTO): Promise<SaleRequest>;
}
//# sourceMappingURL=saleRequestRepository.d.ts.map