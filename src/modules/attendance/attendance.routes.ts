import { Router } from 'express';
import { AttendanceController } from './attendance.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  locationCheckSchema,
  checkInSchema,
  getAttendanceSchema,
  getAttendanceReportSchema,
} from './attendance.validation';
import { authenticateTenant } from '../../middlewares/auth.middleware';

const router = Router();
const attendanceController = new AttendanceController();

/**
 * @route   POST /api/attendance/location-check
 * @desc    Check employee location against office location (NO AUTH)
 * @access  Public
 */
router.post(
  '/location-check',
  validate(locationCheckSchema),
  attendanceController.checkLocation.bind(attendanceController)
);

/**
 * @route   POST /api/attendance/check-in
 * @desc    Process attendance check-in
 * @access  Public (requires location token)
 */
router.post(
  '/check-in',
  validate(checkInSchema),
  attendanceController.checkIn.bind(attendanceController)
);

/**
 * @route   GET /api/attendance/employee/:employeeId
 * @desc    Get attendance records for an employee
 * @access  Private (Tenant)
 */
router.get(
  '/employee/:employeeId',
  authenticateTenant,
  validate(getAttendanceSchema),
  attendanceController.getEmployeeAttendance.bind(attendanceController)
);

/**
 * @route   GET /api/attendance/report
 * @desc    Get attendance report for tenant
 * @access  Private (Tenant)
 */
router.get(
  '/report',
  authenticateTenant,
  validate(getAttendanceReportSchema),
  attendanceController.getAttendanceReport.bind(attendanceController)
);

export default router;
