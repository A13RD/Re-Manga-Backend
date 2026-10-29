import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import authRoutes from './interface/routes/authRoutes';
import mangaRoutes from './interface/routes/mangaRoutes';
import saleRequestRoutes from './interface/routes/saleRequestRoutes';
import favoriteRoutes from './interface/routes/favoriteRoutes';
import orderRoutes from './interface/routes/orderRoutes';
import { errorHandler } from './interface/middlewares/errorHandler';

const app = express();
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({
  origin: FRONTEND_URL
}));
app.use(express.json());

// Ruta de salud para comprobaciones de estado del servidor
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/mangas', mangaRoutes);
app.use('/api/solicitudes', saleRequestRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/orders', orderRoutes);

// Manejador para rutas inexistentes (404 controlado en formato JSON)
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Cannot ${req.method} ${req.path}` });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
