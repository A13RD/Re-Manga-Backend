"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err.message);
    // Prisma errors
    if (err.code === 'P2002') {
        return res.status(409).json({ message: 'A conflict occurred: Unique constraint failed.' });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({ message: 'Resource not found.' });
    }
    res.status(500).json({ message: 'Internal server error' });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map