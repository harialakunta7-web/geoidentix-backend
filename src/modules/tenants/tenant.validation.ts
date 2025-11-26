import Joi from 'joi';

export const registerTenantSchema = Joi.object({
  body: Joi.object({
    tenantName: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Tenant name is required',
      'string.min': 'Tenant name must be at least 2 characters',
      'string.max': 'Tenant name must not exceed 100 characters',
    }),
    gst: Joi.string()
      .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .required()
      .messages({
        'string.empty': 'GST number is required',
        'string.pattern.base': 'Invalid GST number format',
      }),
    address: Joi.string().min(10).max(500).required().messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 10 characters',
      'string.max': 'Address must not exceed 500 characters',
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
      'number.base': 'Longitude must be a number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
    }),
    latitude: Joi.number().min(-90).max(90).required().messages({
      'number.base': 'Latitude must be a number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
    }),
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.empty': 'Username is required',
        'string.alphanum': 'Username must only contain alphanumeric characters',
        'string.min': 'Username must be at least 3 characters',
        'string.max': 'Username must not exceed 30 characters',
      }),
    password: Joi.string().min(8).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
    }),
    planType: Joi.string().valid('FREE', 'PAID').default('FREE'),
  }),
});

export const loginTenantSchema = Joi.object({
  body: Joi.object({
    username: Joi.string().required().messages({
      'string.empty': 'Username is required',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required',
    }),
  }),
});

export const refreshTokenSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      'string.empty': 'Refresh token is required',
    }),
  }),
});

export const updateTenantSchema = Joi.object({
  body: Joi.object({
    tenantName: Joi.string().min(2).max(100).optional(),
    address: Joi.string().min(10).max(500).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    planType: Joi.string().valid('FREE', 'PAID').optional(),
  }),
});
