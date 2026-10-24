import { Request, Response, NextFunction } from 'express';
import { SaleRequestUseCase } from '../../application/saleRequestUseCase';
export declare class SaleRequestController {
    private saleRequestUseCase;
    constructor(saleRequestUseCase: SaleRequestUseCase);
    getAllRequests: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getMyRequests: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    createRequest: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=saleRequestController.d.ts.map