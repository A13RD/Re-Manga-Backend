import { Request, Response, NextFunction } from 'express';
import { MangaUseCase } from '../../application/mangaUseCase';
export declare class MangaController {
    private mangaUseCase;
    constructor(mangaUseCase: MangaUseCase);
    getAllMangas: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    getMangaById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createManga: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    updateManga: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteManga: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=mangaController.d.ts.map