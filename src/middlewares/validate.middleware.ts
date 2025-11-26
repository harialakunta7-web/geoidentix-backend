import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { logger } from '../utils/logger';

/**
 * Validate request using Joi schema
 */
export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(
      {
        body: req.body,
        query: req.query,
        params: req.params,
      },
      {
        abortEarly: false,
        stripUnknown: true,
      }
    );

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      logger.warn('Validation error', { errors });

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    // Replace request objects with validated values
    req.body = value.body || req.body;
    req.query = value.query || req.query;
    req.params = value.params || req.params;

    next();
  };

// Common validation schemas
export const schemas = {
  uuid: Joi.string().uuid().required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
  }),
};
