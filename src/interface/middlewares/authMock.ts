import { Request, Response, NextFunction } from 'express';

/**
 * MOCK AUTHENTICATION MIDDLEWARE
 * This is a temporary solution for the current stage since JWT is not implemented yet.
 * It reads the 'x-user-id' header and assigns it to req.user.id.
 * Do not use in production. Will be replaced by real JWT authentication in the next stage.
 */
export const authMock = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'];
  
  if (!userId || typeof userId !== 'string') {
    return res.status(401).json({ message: 'Unauthorized (Mock): missing x-user-id header' });
  }

  (req as any).user = { id: userId };
  next();
};
