import { Request, Response, NextFunction } from 'express';
// replace './types' with your actual types file path

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: 'User is not authenticated' });
};

export const checkScope = (scope: 'User' | 'Admin' | 'SuperAdmin') => (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUserSessionInfo;
  if (user.scope === scope) {
    return next();
  }
  return res.status(403).json({ message: `User is not authorized for ${scope} scope` });
};
 