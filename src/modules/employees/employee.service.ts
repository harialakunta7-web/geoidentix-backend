import type { Employee, Attendance } from '@prisma/client';
import prisma from '../../config/database';
import { AppError } from '../../middlewares/error.middleware';
import { logger } from '../../utils/logger';
import { isValidEmbedding } from '../../utils/validators';

export interface RegisterEmployeeInput {
  tenantId: string;
  name: string;
  photoUrl: string;
  embedding: number[];
  salary: number;
  emergencyContactNumber: string;
  contactNumber: string;
}

export interface EmployeeWithAttendance extends Employee {
  lastMonthAttendance: Attendance[];
}

export class EmployeeService {
  /**
   * Register a new employee
   */
  async registerEmployee(input: RegisterEmployeeInput): Promise<Employee> {
    try {
      // Validate embedding
      if (!isValidEmbedding(input.embedding)) {
        throw new AppError('Invalid embedding format', 400);
      }

      // Verify tenant exists
      const tenant = await prisma.tenant.findUnique({
        where: { id: input.tenantId },
      });

      if (!tenant) {
        throw new AppError('Tenant not found', 404);
      }

      // Create employee
      const employee = await prisma.employee.create({
        data: {
          tenantId: input.tenantId,
          name: input.name,
          photoUrl: input.photoUrl,
          embedding: input.embedding,
          salary: input.salary,
          emergencyContactNumber: input.emergencyContactNumber,
          contactNumber: input.contactNumber,
        },
      });

      logger.info('Employee registered successfully', {
        employeeId: employee.id,
        tenantId: input.tenantId,
      });

      return employee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error registering employee', error);
      throw new AppError('Failed to register employee', 500);
    }
  }

  /**
   * Get employee details with last month's attendance
   */
  async getEmployeeDetails(
    employeeId: string,
    tenantId: string
  ): Promise<EmployeeWithAttendance> {
    try {
      // Calculate date one month ago
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Fetch employee with attendance
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          tenantId,
        },
        include: {
          attendances: {
            where: {
              checkInTime: {
                gte: oneMonthAgo,
              },
            },
            orderBy: {
              checkInTime: 'desc',
            },
          },
        },
      });

      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      return {
        ...employee,
        lastMonthAttendance: employee.attendances,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error fetching employee details', error);
      throw new AppError('Failed to fetch employee details', 500);
    }
  }

  /**
   * Get employee by ID (for internal use)
   */
  async getEmployeeById(employeeId: string): Promise<Employee | null> {
    try {
      return await prisma.employee.findUnique({
        where: { id: employeeId },
      });
    } catch (error) {
      logger.error('Error fetching employee by ID', error);
      throw new AppError('Failed to fetch employee', 500);
    }
  }

  /**
   * List all employees for a tenant
   */
  async listEmployees(
    tenantId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<{ employees: Employee[]; total: number; page: number; totalPages: number }> {
    try {
      const skip = (page - 1) * limit;

      const where: any = { tenantId };

      if (search) {
        where.name = {
          contains: search,
          mode: 'insensitive',
        };
      }

      const [employees, total] = await Promise.all([
        prisma.employee.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.employee.count({ where }),
      ]);

      return {
        employees,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error('Error listing employees', error);
      throw new AppError('Failed to list employees', 500);
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(
    employeeId: string,
    tenantId: string,
    updates: Partial<RegisterEmployeeInput>
  ): Promise<Employee> {
    try {
      // Validate embedding if provided
      if (updates.embedding && !isValidEmbedding(updates.embedding)) {
        throw new AppError('Invalid embedding format', 400);
      }

      // Check if employee exists and belongs to tenant
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          tenantId,
        },
      });

      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      // Update employee
      const updatedEmployee = await prisma.employee.update({
        where: { id: employeeId },
        data: updates,
      });

      logger.info('Employee updated successfully', {
        employeeId,
        tenantId,
      });

      return updatedEmployee;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error updating employee', error);
      throw new AppError('Failed to update employee', 500);
    }
  }

  /**
   * Delete employee
   */
  async deleteEmployee(employeeId: string, tenantId: string): Promise<void> {
    try {
      // Check if employee exists and belongs to tenant
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          tenantId,
        },
      });

      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      // Delete employee (cascade will delete attendances)
      await prisma.employee.delete({
        where: { id: employeeId },
      });

      logger.info('Employee deleted successfully', {
        employeeId,
        tenantId,
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error deleting employee', error);
      throw new AppError('Failed to delete employee', 500);
    }
  }
}
