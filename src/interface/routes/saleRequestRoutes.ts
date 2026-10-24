import { Router } from 'express';
import { SaleRequestController } from '../controllers/saleRequestController';
import { SaleRequestUseCase } from '../../application/saleRequestUseCase';
import { SaleRequestRepository } from '../../infrastructure/repositories/saleRequestRepository';
import { authMock } from '../middlewares/authMock';

const router = Router();
const repository = new SaleRequestRepository();
const useCase = new SaleRequestUseCase(repository);
const controller = new SaleRequestController(useCase);

// Rutas de solicitudes
router.get('/', controller.getAllRequests);
router.get('/mias', authMock, controller.getMyRequests);
router.post('/', authMock, controller.createRequest);

export default router;
