import type { Tenant, PlanType } from '@prisma/client';
import prisma from '../../config/database';
import { hashPassword, comparePassword } from '../../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  getTokenExpiry,
} from '../../utils/jwt';
import { config } from '../../config';
import { AppError } from '../../middlewares/error.middleware';
import { logger } from '../../utils/logger';

export interface RegisterTenantInput {
  tenantName: string;
  gst: string;
  address: string;
  longitude: number;
  latitude: number;
  username: string;
  password: string;
  planType?: PlanType;
}

export interface LoginResponse {
  tenant: Omit<Tenant, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export class TenantService {
  /**
   * Register a new tenant
   */
  async registerTenant(input: RegisterTenantInput): Promise<LoginResponse> {
    try {
      // Check if username already exists
      const existingUsername = await prisma.tenant.findUnique({
        where: { username: input.username },
      });

      if (existingUsername) {
        throw new AppError('Username already exists', 409);
      }

      // Check if GST already exists
      const existingGST = await prisma.tenant.findUnique({
        where: { gst: input.gst },
      });

      if (existingGST) {
        throw new AppError('GST number already registered', 409);
      }

      // Hash password
      const hashedPassword = await hashPassword(input.password);

      // Create tenant
      const tenant = await prisma.tenant.create({
        data: {
          tenantName: input.tenantName,
          gst: input.gst,
          address: input.address,
          longitude: input.longitude,
          latitude: input.latitude,
          username: input.username,
          password: hashedPassword,
          planType: input.planType || 'FREE',
        },
      });

      // Generate tokens
      const accessToken = generateAccessToken({
        tenantId: tenant.id,
        username: tenant.username,
        planType: tenant.planType,
      });

      const refreshTokenPayload = {
        tenantId: tenant.id,
        tokenId: crypto.randomUUID(),
      };

      const refreshToken = generateRefreshToken(refreshTokenPayload);

      // Store hashed refresh token
      await prisma.refreshToken.create({
        data: {
          tenantId: tenant.id,
          tokenHash: hashToken(refreshToken),
          expiresAt: getTokenExpiry(config.jwt.refreshExpiry),
        },
      });

      logger.info('Tenant registered successfully', { tenantId: tenant.id });

      // Remove password from response
      const { password: _, ...tenantWithoutPassword } = tenant;

      return {
        tenant: tenantWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error registering tenant', error);
      throw new AppError('Failed to register tenant', 500);
    }
  }

  /**
   * Login tenant
   */
  async loginTenant(
    username: string,
    password: string
  ): Promise<LoginResponse> {
    try {
      // Find tenant by username
      const tenant = await prisma.tenant.findUnique({
        where: { username },
      });

      if (!tenant) {
        throw new AppError('Invalid username or password', 401);
      }

      // Verify password
      const isPasswordValid = await comparePassword(password, tenant.password);

      if (!isPasswordValid) {
        throw new AppError('Invalid username or password', 401);
      }

      // Generate tokens
      const accessToken = generateAccessToken({
        tenantId: tenant.id,
        username: tenant.username,
        planType: tenant.planType,
      });

      const refreshTokenPayload = {
        tenantId: tenant.id,
        tokenId: crypto.randomUUID(),
      };

      const refreshToken = generateRefreshToken(refreshTokenPayload);

      // Store hashed refresh token
      await prisma.refreshToken.create({
        data: {
          tenantId: tenant.id,
          tokenHash: hashToken(refreshToken),
          expiresAt: getTokenExpiry(config.jwt.refreshExpiry),
        },
      });

      logger.info('Tenant logged in successfully', { tenantId: tenant.id });

      // Remove password from response
      const { password: _, ...tenantWithoutPassword } = tenant;

      return {
        tenant: tenantWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error logging in tenant', error);
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<LoginResponse> {
    try {
      // Verify refresh token
      const payload = verifyRefreshToken(refreshToken);

      // Check if refresh token exists and is valid
      const storedToken = await prisma.refreshToken.findUnique({
        where: { tokenHash: hashToken(refreshToken) },
        include: { tenant: true },
      });

      if (!storedToken || storedToken.isRevoked) {
        throw new AppError('Invalid or revoked refresh token', 401);
      }

      if (storedToken.expiresAt < new Date()) {
        throw new AppError('Refresh token expired', 401);
      }

      if (storedToken.tenantId !== payload.tenantId) {
        throw new AppError('Token tenant mismatch', 401);
      }

      // Revoke old refresh token (token rotation)
      await prisma.refreshToken.update({
        where: { id: storedToken.id },
        data: { isRevoked: true },
      });

      // Generate new tokens
      const accessToken = generateAccessToken({
        tenantId: storedToken.tenant.id,
        username: storedToken.tenant.username,
        planType: storedToken.tenant.planType,
      });

      const newRefreshTokenPayload = {
        tenantId: storedToken.tenant.id,
        tokenId: crypto.randomUUID(),
      };

      const newRefreshToken = generateRefreshToken(newRefreshTokenPayload);

      // Store new refresh token
      await prisma.refreshToken.create({
        data: {
          tenantId: storedToken.tenant.id,
          tokenHash: hashToken(newRefreshToken),
          expiresAt: getTokenExpiry(config.jwt.refreshExpiry),
        },
      });

      logger.info('Access token refreshed', { tenantId: storedToken.tenant.id });

      // Remove password from response
      const { password: _, ...tenantWithoutPassword } = storedToken.tenant;

      return {
        tenant: tenantWithoutPassword,
        accessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error refreshing token', error);
      throw new AppError('Failed to refresh token', 500);
    }
  }

  /**
   * Get tenant profile
   */
  async getTenantProfile(tenantId: string): Promise<Omit<Tenant, 'password'>> {
    try {
      const tenant = await prisma.tenant.findUnique({
        where: { id: tenantId },
      });

      if (!tenant) {
        throw new AppError('Tenant not found', 404);
      }

      const { password: _, ...tenantWithoutPassword } = tenant;
      return tenantWithoutPassword;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Error fetching tenant profile', error);
      throw new AppError('Failed to fetch tenant profile', 500);
    }
  }

  /**
   * Update tenant profile
   */
  async updateTenant(
    tenantId: string,
    updates: Partial<RegisterTenantInput>
  ): Promise<Omit<Tenant, 'password'>> {
    try {
      const tenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: updates,
      });

      const { password: _, ...tenantWithoutPassword } = tenant;
      return tenantWithoutPassword;
    } catch (error) {
      logger.error('Error updating tenant', error);
      throw new AppError('Failed to update tenant', 500);
    }
  }

  /**
   * Logout tenant (revoke refresh tokens)
   */
  async logoutTenant(tenantId: string, refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.updateMany({
        where: {
          tenantId,
          tokenHash: hashToken(refreshToken),
        },
        data: {
          isRevoked: true,
        },
      });

      logger.info('Tenant logged out', { tenantId });
    } catch (error) {
      logger.error('Error logging out tenant', error);
      throw new AppError('Failed to logout', 500);
    }
  }
}
