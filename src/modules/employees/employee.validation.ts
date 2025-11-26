import Joi from 'joi';

export const registerEmployeeSchema = Joi.object({
  body: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Employee name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 100 characters',
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
    salary: Joi.number().positive().precision(2).required().messages({
      'number.base': 'Salary must be a number',
      'number.positive': 'Salary must be positive',
    }),
    emergencyContactNumber: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        'string.empty': 'Emergency contact number is required',
        'string.pattern.base': 'Invalid emergency contact number format',
      }),
    contactNumber: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .required()
      .messages({
        'string.empty': 'Contact number is required',
        'string.pattern.base': 'Invalid contact number format',
      }),
  }),
});

export const updateEmployeeSchema = Joi.object({
  params: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      'string.empty': 'Employee ID is required',
      'string.uuid': 'Invalid employee ID format',
    }),
  }),
  body: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    photoUrl: Joi.string().uri().optional(),
    embedding: Joi.array().items(Joi.number()).min(1).optional(),
    salary: Joi.number().positive().precision(2).optional(),
    emergencyContactNumber: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .optional(),
    contactNumber: Joi.string()
      .pattern(/^[6-9]\d{9}$/)
      .optional(),
  }),
});

export const getEmployeeSchema = Joi.object({
  params: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      'string.empty': 'Employee ID is required',
      'string.uuid': 'Invalid employee ID format',
    }),
  }),
});

export const deleteEmployeeSchema = Joi.object({
  params: Joi.object({
    employeeId: Joi.string().uuid().required().messages({
      'string.empty': 'Employee ID is required',
      'string.uuid': 'Invalid employee ID format',
    }),
  }),
});

export const listEmployeesSchema = Joi.object({
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().optional(),
  }),
});
