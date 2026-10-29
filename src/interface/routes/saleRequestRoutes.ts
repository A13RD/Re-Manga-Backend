import { Router } from 'express';
import { SaleRequestController } from '../controllers/saleRequestController';
import { SaleRequestUseCase } from '../../application/saleRequestUseCase';
import { SaleRequestRepository } from '../../infrastructure/repositories/saleRequestRepository';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { authorizeRoles } from '../middlewares/roleMiddleware';
import { Role } from '../../domain/user';

const router = Router();
const repository = new SaleRequestRepository();
const useCase = new SaleRequestUseCase(repository);
const controller = new SaleRequestController(useCase);

// Rutas de solicitudes de venta
// POST /api/solicitudes: usuario autenticado crea una solicitud
router.post('/', authenticateJWT, controller.createRequest);

// GET /api/solicitudes/mias: usuario autenticado consulta únicamente sus propias solicitudes
router.get('/mias', authenticateJWT, controller.getMyRequests);

// GET /api/solicitudes: solo administradores pueden consultar todas las solicitudes
router.get('/', authenticateJWT, authorizeRoles(Role.ADMIN), controller.getAllRequests);

export default router;
