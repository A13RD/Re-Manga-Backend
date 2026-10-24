"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mangaController_1 = require("../controllers/mangaController");
const mangaUseCase_1 = require("../../application/mangaUseCase");
const mangaRepository_1 = require("../../infrastructure/repositories/mangaRepository");
const router = (0, express_1.Router)();
const repository = new mangaRepository_1.MangaRepository();
const useCase = new mangaUseCase_1.MangaUseCase(repository);
const controller = new mangaController_1.MangaController(useCase);
router.get('/', controller.getAllMangas);
router.get('/:id', controller.getMangaById);
router.post('/', controller.createManga);
router.put('/:id', controller.updateManga);
router.delete('/:id', controller.deleteManga);
exports.default = router;
//# sourceMappingURL=mangaRoutes.js.map