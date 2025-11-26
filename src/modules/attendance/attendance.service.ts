import type { Attendance } from "@prisma/client";
import prisma from '../../config/database';
import { AppError } from '../../middlewares/error.middleware';
import { logger } from '../../utils/logger';
import { EmployeeService } from '../employees/employee.service';
import { isWithinRadius, validateCoordinates } from '../../utils/geoLocation';
import { config } from '../../config';
import { generateLocationToken, verifyLocationToken } from '../../utils/jwt';
import { compareFaces } from '../../utils/rekognition';
import { isValidEmbedding } from '../../utils/validators';

const employeeService = new EmployeeService();

export interface LocationCheckInput {
  employeeId: string;
  latitude: number;
  longitude: number;
}

export interface LocationCheckResponse {
  success: boolean;
  tenantId?: string;
  tenantName?: string;
  address?: string;
  locationToken?: string;
  message: string;
}

export interface CheckInInput {
  employeeId: string;
  photoUrl: string;
  embedding: number[];
  locationToken: string;
}

export class AttendanceService {
  /**
   * Check employee location against tenant office location
   * Returns location token if outside allowed radius
   */
  async checkEmployeeLocation(
    input: LocationCheckInput
  ): Promise<LocationCheckResponse> {
    try {
      // Validate coordinates
      const coordValidation = validateCoordinates(
        input.latitude,
        input.longitude
      );
      if (!coordValidation.isValid) {
        throw new AppError(coordValidation.error || 'Invalid coordinates', 400);
      }

      // Fetch employee and tenant info
      const employee = await employeeService.getEmployeeById(input.employeeId);

      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      // Fetch tenant
      const tenant = await prisma.tenant.findUnique({
        where: { id: employee.tenantId },
      });

      if (!tenant) {
        throw new AppError('Tenant not found', 404);
      }

      // Check if employee is within allowed radius
      const isWithin = isWithinRadius(
        input.latitude,
        input.longitude,
        tenant.latitude,
        tenant.longitude,
        config.geoLocation.allowedCheckInRadius
      );

      if (isWithin) {
        // Employee is within allowed radius - deny location check
        return {
          success: false,
          message: 'You are within the office premises. Please proceed with check-in.',
        };
      }

      // Employee is outside allowed radius - issue location token
      const locationToken = generateLocationToken({
        tenantId: tenant.id,
        employeeId: employee.id,
        latitude: input.latitude,
        longitude: input.longitude,
      });

      logger.info('Location check successful - outside radius', {
        employeeId: employee.id,
        tenantId: tenant.id,
      });

      return {
        success: true,
        tenantId: tenant.id,
        tenantName: tenant.tenantName,
        address: tenant.address,
        locationToken,
        message: 'Location verified. You are outside office premises.',
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error checking employee location', error);
      throw new AppError('Failed to check location', 500);
    }
  }

  /**
   * Process attendance check-in
   */
  async checkIn(input: CheckInInput): Promise<Attendance> {
    try {
      // Verify location token
      let locationPayload;
      try {
        locationPayload = verifyLocationToken(input.locationToken);
      } catch (error) {
        throw new AppError('Invalid or expired location token', 401);
      }

      // Validate employee ID matches location token
      if (locationPayload.employeeId !== input.employeeId) {
        throw new AppError('Employee ID mismatch with location token', 403);
      }

      // Validate embedding
      if (!isValidEmbedding(input.embedding)) {
        throw new AppError('Invalid embedding format', 400);
      }

      // Fetch employee and tenant
      const employee = await employeeService.getEmployeeById(input.employeeId);

      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      if (employee.tenantId !== locationPayload.tenantId) {
        throw new AppError('Tenant mismatch', 403);
      }

      const tenant = await prisma.tenant.findUnique({
        where: { id: employee.tenantId },
      });

      if (!tenant) {
        throw new AppError('Tenant not found', 404);
      }

      let matchConfidence: number | null = null;

      // For PAID plan, use AWS Rekognition
      if (tenant.planType === 'PAID') {
        try {
          const comparisonResult = await compareFaces(
            employee.photoUrl,
            input.photoUrl
          );

          if (!comparisonResult.isMatch) {
            throw new AppError(
              'Face verification failed. Please try again with a clear photo.',
              400
            );
          }

          matchConfidence = comparisonResult.similarity || 0;

          logger.info('Rekognition face match successful', {
            employeeId: employee.id,
            confidence: matchConfidence,
          });
        } catch (error) {
          if (error instanceof AppError) {
            throw error;
          }
          logger.error('Rekognition error', error);
          throw new AppError(
            'Face verification failed. Please try again.',
            500
          );
        }
      }

      // For FREE plan, embedding comparison happens on frontend
      // Backend just validates that embedding is provided

      // Check if already checked in today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const existingCheckIn = await prisma.attendance.findFirst({
        where: {
          employeeId: input.employeeId,
          checkInTime: {
            gte: today,
          },
        },
      });

      if (existingCheckIn) {
        throw new AppError('Already checked in today', 409);
      }

      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: {
          tenantId: employee.tenantId,
          employeeId: employee.id,
          photoUrl: input.photoUrl,
          embedding: input.embedding,
          matchConfidence,
        },
      });

      logger.info('Attendance check-in successful', {
        attendanceId: attendance.id,
        employeeId: employee.id,
        tenantId: employee.tenantId,
      });

      return attendance;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error processing check-in', error);
      throw new AppError('Failed to process check-in', 500);
    }
  }

  /**
   * Get attendance records for an employee
   */
  async getEmployeeAttendance(
    employeeId: string,
    tenantId: string,
    startDate?: Date,
    endDate?: Date,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    attendances: Attendance[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      // Verify employee belongs to tenant
      const employee = await prisma.employee.findFirst({
        where: {
          id: employeeId,
          tenantId,
        },
      });

      if (!employee) {
        throw new AppError('Employee not found', 404);
      }

      const skip = (page - 1) * limit;

      const where: any = {
        employeeId,
        tenantId,
      };

      if (startDate || endDate) {
        where.checkInTime = {};
        if (startDate) where.checkInTime.gte = startDate;
        if (endDate) where.checkInTime.lte = endDate;
      }

      const [attendances, total] = await Promise.all([
        prisma.attendance.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            checkInTime: 'desc',
          },
        }),
        prisma.attendance.count({ where }),
      ]);

      return {
        attendances,
        total,
        page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error fetching attendance records', error);
      throw new AppError('Failed to fetch attendance records', 500);
    }
  }

  /**
   * Get attendance report for a tenant
   */
  async getAttendanceReport(
    tenantId: string,
    startDate: Date,
    endDate: Date,
    employeeId?: string
  ): Promise<Attendance[]> {
    try {
      const where: any = {
        tenantId,
        checkInTime: {
          gte: startDate,
          lte: endDate,
        },
      };

      if (employeeId) {
        // Verify employee belongs to tenant
        const employee = await prisma.employee.findFirst({
          where: {
            id: employeeId,
            tenantId,
          },
        });

        if (!employee) {
          throw new AppError('Employee not found', 404);
        }

        where.employeeId = employeeId;
      }

      const attendances = await prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              contactNumber: true,
            },
          },
        },
        orderBy: {
          checkInTime: 'desc',
        },
      });

      return attendances;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error generating attendance report', error);
      throw new AppError('Failed to generate attendance report', 500);
    }
  }
}
