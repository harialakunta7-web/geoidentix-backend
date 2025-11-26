import { Request, Response } from 'express';
import { AttendanceService } from './attendance.service';
import { logger } from '../../utils/logger';

const attendanceService = new AttendanceService();

export class AttendanceController {
  /**
   * Check employee location (NO AUTH REQUIRED)
   */
  async checkLocation(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, latitude, longitude } = req.body;

      const result = await attendanceService.checkEmployeeLocation({
        employeeId,
        latitude,
        longitude,
      });

      res.status(200).json(result);
    } catch (error: any) {
      logger.error('Error in location check controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to check location',
      });
    }
  }

  /**
   * Process attendance check-in
   */
  async checkIn(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId, photoUrl, embedding, locationToken } = req.body;

      const attendance = await attendanceService.checkIn({
        employeeId,
        photoUrl,
        embedding,
        locationToken,
      });

      res.status(201).json({
        success: true,
        message: 'Check-in successful',
        data: {
          attendanceId: attendance.id,
          checkInTime: attendance.checkInTime,
          matchConfidence: attendance.matchConfidence,
        },
      });
    } catch (error: any) {
      logger.error('Error in check-in controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Check-in failed',
      });
    }
  }

  /**
   * Get attendance records for an employee
   */
  async getEmployeeAttendance(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { employeeId } = req.params;
      const { startDate, endDate, page, limit } = req.query;

      const result = await attendanceService.getEmployeeAttendance(
        employeeId,
        req.tenant.tenantId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined,
        page ? parseInt(page as string) : 1,
        limit ? parseInt(limit as string) : 10
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      logger.error('Error in get attendance controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch attendance records',
      });
    }
  }

  /**
   * Get attendance report for tenant
   */
  async getAttendanceReport(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { startDate, endDate, employeeId } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
        return;
      }

      const attendances = await attendanceService.getAttendanceReport(
        req.tenant.tenantId,
        new Date(startDate as string),
        new Date(endDate as string),
        employeeId as string
      );

      res.status(200).json({
        success: true,
        data: {
          startDate,
          endDate,
          totalRecords: attendances.length,
          attendances,
        },
      });
    } catch (error: any) {
      logger.error('Error in attendance report controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to generate attendance report',
      });
    }
  }
}
