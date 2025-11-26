import { Request, Response } from 'express';
import { TenantService } from './tenant.service';
import { logger } from '../../utils/logger';
import { validatePasswordStrength } from '../../utils/password';

const tenantService = new TenantService();

export class TenantController {
  /**
   * Register a new tenant
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { password, ...otherFields } = req.body;

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          message: 'Password does not meet requirements',
          errors: passwordValidation.errors,
        });
        return;
      }

      const result = await tenantService.registerTenant({
        ...otherFields,
        password,
      });

      res.status(201).json({
        success: true,
        message: 'Tenant registered successfully',
        data: {
          tenantId: result.tenant.id,
          tenant: result.tenant,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error: any) {
      logger.error('Error in register controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  }

  /**
   * Login tenant
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const result = await tenantService.loginTenant(username, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          tenantId: result.tenant.id,
          tenant: result.tenant,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error: any) {
      logger.error('Error in login controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Login failed',
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      const result = await tenantService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tenantId: result.tenant.id,
          tenant: result.tenant,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error: any) {
      logger.error('Error in refresh token controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Token refresh failed',
      });
    }
  }

  /**
   * Get tenant profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const tenant = await tenantService.getTenantProfile(req.tenant.tenantId);

      res.status(200).json({
        success: true,
        data: tenant,
      });
    } catch (error: any) {
      logger.error('Error in get profile controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to fetch profile',
      });
    }
  }

  /**
   * Update tenant profile
   */
  async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const tenant = await tenantService.updateTenant(
        req.tenant.tenantId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: tenant,
      });
    } catch (error: any) {
      logger.error('Error in update profile controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to update profile',
      });
    }
  }

  /**
   * Logout tenant
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        res.status(401).json({
          success: false,
          message: 'Authentication required',
        });
        return;
      }

      const { refreshToken } = req.body;

      await tenantService.logoutTenant(req.tenant.tenantId, refreshToken);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error: any) {
      logger.error('Error in logout controller', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Logout failed',
      });
    }
  }
}
