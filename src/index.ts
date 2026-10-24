import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mangaRoutes from './interface/routes/mangaRoutes';
import saleRequestRoutes from './interface/routes/saleRequestRoutes';
import { errorHandler } from './interface/middlewares/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';

app.use(cors({
  origin: FRONTEND_URL
}));
app.use(express.json());

app.use('/api/mangas', mangaRoutes);
app.use('/api/solicitudes', saleRequestRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
