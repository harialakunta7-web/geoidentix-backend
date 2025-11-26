import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, AccessTokenPayload } from '../utils/jwt';
import { logger } from '../utils/logger';

// Extend Express Request interface to include tenant info
declare global {
  namespace Express {
    interface Request {
      tenant?: AccessTokenPayload;
    }
  }
}

/**
 * Middleware to authenticate tenant using JWT
 */
export const authenticateTenant = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authorization token required',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const payload = verifyAccessToken(token);

    // Attach tenant info to request
    req.tenant = payload;

    next();
  } catch (error) {
    logger.error('Authentication error', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }
};

/**
 * Middleware to enforce tenant isolation
 * Validates that tenantId in request matches authenticated tenant
 */
export const enforceTenantIsolation = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.tenant) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    // Check if tenantId is provided in params, body, or query
    const requestTenantId =
      req.params.tenantId || req.body.tenantId || req.query.tenantId;

    if (requestTenantId && requestTenantId !== req.tenant.tenantId) {
      logger.warn('Tenant isolation violation attempt', {
        authenticatedTenant: req.tenant.tenantId,
        requestedTenant: requestTenantId,
      });

      res.status(403).json({
        success: false,
        message: 'Access denied: Tenant isolation violation',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Tenant isolation enforcement error', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuthentication = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.tenant = payload;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
