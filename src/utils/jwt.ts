import jwt from 'jsonwebtoken';
import { config } from '../config';
import crypto from 'crypto';

export interface AccessTokenPayload {
  tenantId: string;
  username: string;
  planType: string;
}

export interface RefreshTokenPayload {
  tenantId: string;
  tokenId: string;
}

export interface LocationTokenPayload {
  tenantId: string;
  employeeId: string;
  latitude: number;
  longitude: number;
}

/**
 * Generate Access Token (JWT)
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiry,
  } as jwt.SignOptions);
};

/**
 * Generate Refresh Token (JWT)
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiry,
  } as jwt.SignOptions);
};

/**
 * Generate Location Token (short-lived JWT for check-in)
 */
export const generateLocationToken = (
  payload: LocationTokenPayload
): string => {
  return jwt.sign(payload, config.jwt.locationSecret, {
    expiresIn: config.jwt.locationExpiry,
  } as jwt.SignOptions);
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try {
    return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
};

/**
 * Verify Location Token
 */
export const verifyLocationToken = (token: string): LocationTokenPayload => {
  try {
    return jwt.verify(token, config.jwt.locationSecret) as LocationTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired location token');
  }
};

/**
 * Hash Refresh Token for storage
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Parse JWT expiry to Date
 */
export const getTokenExpiry = (expiryString: string): Date => {
  const match = expiryString.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiry format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const now = new Date();

  switch (unit) {
    case 's':
      now.setSeconds(now.getSeconds() + value);
      break;
    case 'm':
      now.setMinutes(now.getMinutes() + value);
      break;
    case 'h':
      now.setHours(now.getHours() + value);
      break;
    case 'd':
      now.setDate(now.getDate() + value);
      break;
  }

  return now;
};
