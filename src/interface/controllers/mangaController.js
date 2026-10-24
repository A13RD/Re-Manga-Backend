"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MangaController = void 0;
class MangaController {
    mangaUseCase;
    constructor(mangaUseCase) {
        this.mangaUseCase = mangaUseCase;
    }
    getAllMangas = async (req, res, next) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 6;
            if (page < 1 || pageSize < 1) {
                return res.status(400).json({ message: 'Invalid pagination parameters' });
            }
            const result = await this.mangaUseCase.getAllMangas(page, pageSize);
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    getMangaById = async (req, res, next) => {
        try {
            const manga = await this.mangaUseCase.getMangaById(req.params.id);
            res.json(manga);
        }
        catch (error) {
            if (error.message === 'Manga not found') {
                res.status(404).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    };
    createManga = async (req, res, next) => {
        try {
            const { title, author, genre, description, price, condition, stock } = req.body;
            if (!title || !author || !genre || !description || price === undefined || !condition || stock === undefined) {
                return res.status(400).json({ message: 'Missing required fields' });
            }
            const newManga = await this.mangaUseCase.createManga(req.body);
            res.status(201).json(newManga);
        }
        catch (error) {
            next(error);
        }
    };
    updateManga = async (req, res, next) => {
        try {
            const updatedManga = await this.mangaUseCase.updateManga(req.params.id, req.body);
            res.json(updatedManga);
        }
        catch (error) {
            if (error.message === 'Manga not found') {
                res.status(404).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    };
    deleteManga = async (req, res, next) => {
        try {
            await this.mangaUseCase.deleteManga(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            if (error.message === 'Manga not found') {
                res.status(404).json({ message: error.message });
            }
            else {
                next(error);
            }
        }
    };
}
exports.MangaController = MangaController;
//# sourceMappingURL=mangaController.js.map