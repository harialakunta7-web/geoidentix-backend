import { Router } from 'express';
import { TenantController } from './tenant.controller';
import { validate } from '../../middlewares/validate.middleware';
import {
  registerTenantSchema,
  loginTenantSchema,
  refreshTokenSchema,
  updateTenantSchema,
} from './tenant.validation';
import { authenticateTenant } from '../../middlewares/auth.middleware';
import { loginLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();
const tenantController = new TenantController();

/**
 * @route   POST /api/tenants/register
 * @desc    Register a new tenant
 * @access  Public
 */
router.post(
  '/register',
  validate(registerTenantSchema),
  tenantController.register.bind(tenantController)
);

/**
 * @route   POST /api/tenants/login
 * @desc    Login tenant
 * @access  Public
 */
router.post(
  '/login',
  loginLimiter,
  validate(loginTenantSchema),
  tenantController.login.bind(tenantController)
);

/**
 * @route   POST /api/tenants/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post(
  '/refresh-token',
  validate(refreshTokenSchema),
  tenantController.refreshToken.bind(tenantController)
);

/**
 * @route   GET /api/tenants/profile
 * @desc    Get tenant profile
 * @access  Private
 */
router.get(
  '/profile',
  authenticateTenant,
  tenantController.getProfile.bind(tenantController)
);

/**
 * @route   PATCH /api/tenants/profile
 * @desc    Update tenant profile
 * @access  Private
 */
router.patch(
  '/profile',
  authenticateTenant,
  validate(updateTenantSchema),
  tenantController.updateProfile.bind(tenantController)
);

/**
 * @route   POST /api/tenants/logout
 * @desc    Logout tenant
 * @access  Private
 */
router.post(
  '/logout',
  authenticateTenant,
  validate(refreshTokenSchema),
  tenantController.logout.bind(tenantController)
);

export default router;
