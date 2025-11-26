import Joi from 'joi';

export const locationCheckSchema = Joi.object({
  body: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      'string.empty': 'Employee ID is required',
      'string.uuid': 'Invalid employee ID format',
    }),
    latitude: Joi.number().min(-90).max(90).required().messages({
      'number.base': 'Latitude must be a number',
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90',
    }),
    longitude: Joi.number().min(-180).max(180).required().messages({
      'number.base': 'Longitude must be a number',
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180',
    }),
  }),
});

export const checkInSchema = Joi.object({
  body: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      'string.empty': 'Employee ID is required',
      'string.uuid': 'Invalid employee ID format',
    }),
    photoUrl: Joi.string().uri().required().messages({
      'string.empty': 'Photo URL is required',
      'string.uri': 'Invalid photo URL',
    }),
    embedding: Joi.array()
      .items(Joi.number())
      .min(1)
      .required()
      .messages({
        'array.base': 'Embedding must be an array of numbers',
        'array.min': 'Embedding array cannot be empty',
      }),
    locationToken: Joi.string().required().messages({
      'string.empty': 'Location token is required',
    }),
  }),
});

export const getAttendanceSchema = Joi.object({
  params: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      'string.empty': 'Employee ID is required',
      'string.uuid': 'Invalid employee ID format',
    }),
  }),
  query: Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
  }),
});

export const getAttendanceReportSchema = Joi.object({
  query: Joi.object({
    startDate: Joi.date().iso().required().messages({
      'date.base': 'Start date must be a valid date',
      'any.required': 'Start date is required',
    }),
    endDate: Joi.date().iso().required().messages({
      'date.base': 'End date must be a valid date',
      'any.required': 'End date is required',
    }),
    employeeId: Joi.string().uuid().optional(),
  }),
});
