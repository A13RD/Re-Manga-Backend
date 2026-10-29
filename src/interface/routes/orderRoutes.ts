import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { OrderUseCase } from '../../application/orderUseCase.js';
import { OrderRepository } from '../../infrastructure/repositories/orderRepository.js';
import { authenticateJWT } from '../middlewares/authMiddleware.js';

const router = Router();
const repository = new OrderRepository();
const useCase = new OrderUseCase(repository);
const controller = new OrderController(useCase);

router.post('/', authenticateJWT, controller.createOrder);
router.get('/', authenticateJWT, controller.getMyOrders);
router.get('/:id', authenticateJWT, controller.getOrderById);

export default router;

