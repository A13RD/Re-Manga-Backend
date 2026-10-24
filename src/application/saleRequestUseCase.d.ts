import { ISaleRequestRepository, CreateSaleRequestDTO } from '../domain/saleRequest';
export declare class SaleRequestUseCase {
    private saleRequestRepository;
    constructor(saleRequestRepository: ISaleRequestRepository);
    getAllRequests(): Promise<import("../domain/saleRequest").SaleRequest[]>;
    getMyRequests(userId: string): Promise<import("../domain/saleRequest").SaleRequest[]>;
    createRequest(userId: string, requestData: CreateSaleRequestDTO): Promise<import("../domain/saleRequest").SaleRequest>;
}
//# sourceMappingURL=saleRequestUseCase.d.ts.map