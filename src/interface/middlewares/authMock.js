"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMock = void 0;
/**
 * MOCK AUTHENTICATION MIDDLEWARE
 * This is a temporary solution for the current stage since JWT is not implemented yet.
 * It reads the 'x-user-id' header and assigns it to req.user.id.
 * Do not use in production. Will be replaced by real JWT authentication in the next stage.
 */
const authMock = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    if (!userId || typeof userId !== 'string') {
        return res.status(401).json({ message: 'Unauthorized (Mock): missing x-user-id header' });
    }
    req.user = { id: userId };
    next();
};
exports.authMock = authMock;
//# sourceMappingURL=authMock.js.map