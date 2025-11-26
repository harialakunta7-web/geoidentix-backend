import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    locationSecret: process.env.JWT_LOCATION_SECRET || '',
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    locationExpiry: process.env.JWT_LOCATION_EXPIRY || '5m',
  },
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },
  rekognition: {
    similarityThreshold: parseFloat(
      process.env.REKOGNITION_SIMILARITY_THRESHOLD || '85.0'
    ),
  },
  geoLocation: {
    allowedCheckInRadius: parseInt(
      process.env.ALLOWED_CHECKIN_RADIUS || '100',
      10
    ), // in meters
  },
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
    rateLimitWindowMs: parseInt(
      process.env.RATE_LIMIT_WINDOW_MS || '900000',
      10
    ),
    rateLimitMaxRequests: parseInt(
      process.env.RATE_LIMIT_MAX_REQUESTS || '5',
      10
    ),
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },
};

// Validation
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'JWT_LOCATION_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
];

export const validateConfig = () => {
  const missing = requiredEnvVars.filter(
    (key) => !process.env[key] || process.env[key] === ''
  );

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};
