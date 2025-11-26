import { Request, Response } from 'express';
import { EmployeeService } from './employee.service';
import { logger } from '../../utils/logger';

const employeeService = new EmployeeService();

export class EmployeeController {
  /**
   * Register a new employee
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const employee = await employeeService.registerEmployee({
        tenantId: req.tenant.tenantId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: 'Employee registered successfully',
        data: employee,
      });
    } catch (error: any) {
      logger.error('Error in register employee controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to register employee',
      });
    }
  }

  /**
   * Get employee details with last month's attendance
   */
  async getDetails(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { employeeId } = req.params;

      const employee = await employeeService.getEmployeeDetails(
        employeeId,
        req.tenant.tenantId
      );

      res.status(200).json({
        success: true,
        data: {
          employee: {
            id: employee.id,
            name: employee.name,
            photoUrl: employee.photoUrl,
            salary: employee.salary,
            emergencyContactNumber: employee.emergencyContactNumber,
            contactNumber: employee.contactNumber,
            createdAt: employee.createdAt,
            updatedAt: employee.updatedAt,
          },
          lastMonthAttendance: employee.lastMonthAttendance,
        },
      });
    } catch (error: any) {
      logger.error('Error in get employee details controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch employee details',
      });
    }
  }

  /**
   * List all employees
   */
  async list(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { page, limit, search } = req.query;

      const result = await employeeService.listEmployees(
        req.tenant.tenantId,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10,
        search as string
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in list employees controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to list employees',
      });
    }
  }

  /**
   * Update employee
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { employeeId } = req.params;

      const employee = await employeeService.updateEmployee(
        employeeId,
        req.tenant.tenantId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Employee updated successfully',
        data: employee,
      });
    } catch (error: any) {
      logger.error('Error in update employee controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update employee',
      });
    }
  }

  /**
   * Delete employee
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { employeeId } = req.params;

      await employeeService.deleteEmployee(employeeId, req.tenant.tenantId);

      res.status(200).json({
        success: true,
        message: 'Employee deleted successfully',
      });
    } catch (error: any) {
      logger.error('Error in delete employee controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to delete employee',
      });
    }
  }
}
