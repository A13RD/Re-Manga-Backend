import { Request, Response, NextFunction } from 'express';
/**
 * MOCK AUTHENTICATION MIDDLEWARE
 * This is a temporary solution for the current stage since JWT is not implemented yet.
 * It reads the 'x-user-id' header and assigns it to req.user.id.
 * Do not use in production. Will be replaced by real JWT authentication in the next stage.
 */
export declare const authMock: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authMock.d.ts.map