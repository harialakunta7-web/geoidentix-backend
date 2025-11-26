import { Router } from 'express';
import { EmployeeController } from './employee.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  registerEmployeeSchema,
  updateEmployeeSchema,
  getEmployeeSchema,
  deleteEmployeeSchema,
  listEmployeesSchema,
} from './employee.validation';
import { authenticateTenant } from '../../middlewares/auth.middleware';

const router = Router();
const employeeController = new EmployeeController();

// All employee routes require authentication
router.use(authenticateTenant);

/**
 * @route   POST /api/employees
 * @desc    Register a new employee
 * @access  Private (Tenant)
 */
router.post(
  '/',
  validate(registerEmployeeSchema),
  employeeController.register.bind(employeeController)
);

/**
 * @route   GET /api/employees
 * @desc    List all employees with pagination
 * @access  Private (Tenant)
 */
router.get(
  '/',
  validate(listEmployeesSchema),
  employeeController.list.bind(employeeController)
);

/**
 * @route   GET /api/employees/:employeeId
 * @desc    Get employee details with last month's attendance
 * @access  Private (Tenant)
 */
router.get(
  '/:employeeId',
  validate(getEmployeeSchema),
  employeeController.getDetails.bind(employeeController)
);

/**
 * @route   PATCH /api/employees/:employeeId
 * @desc    Update employee
 * @access  Private (Tenant)
 */
router.patch(
  '/:employeeId',
  validate(updateEmployeeSchema),
  employeeController.update.bind(employeeController)
);

/**
 * @route   DELETE /api/employees/:employeeId
 * @desc    Delete employee
 * @access  Private (Tenant)
 */
router.delete(
  '/:employeeId',
  validate(deleteEmployeeSchema),
  employeeController.delete.bind(employeeController)
);

export default router;
