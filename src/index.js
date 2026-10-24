"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const mangaRoutes_1 = __importDefault(require("./interface/routes/mangaRoutes"));
const saleRequestRoutes_1 = __importDefault(require("./interface/routes/saleRequestRoutes"));
const errorHandler_1 = require("./interface/middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';
app.use((0, cors_1.default)({
    origin: FRONTEND_URL
}));
app.use(express_1.default.json());
app.use('/api/mangas', mangaRoutes_1.default);
app.use('/api/solicitudes', saleRequestRoutes_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
//# sourceMappingURL=index.js.map