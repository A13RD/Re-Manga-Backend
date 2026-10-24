"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const saleRequestController_1 = require("../controllers/saleRequestController");
const saleRequestUseCase_1 = require("../../application/saleRequestUseCase");
const saleRequestRepository_1 = require("../../infrastructure/repositories/saleRequestRepository");
const authMock_1 = require("../middlewares/authMock");
const router = (0, express_1.Router)();
const repository = new saleRequestRepository_1.SaleRequestRepository();
const useCase = new saleRequestUseCase_1.SaleRequestUseCase(repository);
const controller = new saleRequestController_1.SaleRequestController(useCase);
// Rutas de solicitudes
router.get('/', controller.getAllRequests);
router.get('/mias', authMock_1.authMock, controller.getMyRequests);
router.post('/', authMock_1.authMock, controller.createRequest);
exports.default = router;
//# sourceMappingURL=saleRequestRoutes.js.map