import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Upload file buffer to S3
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<UploadResult> => {
  try {
    const fileExtension = fileName.split('.').pop();
    const key = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
    });

    await s3Client.send(command);

    const url = `https://${config.aws.s3Bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;

    return { url, key };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload file to S3');
  }
};

/**
 * Upload employee photo
 */
export const uploadEmployeePhoto = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  const result = await uploadToS3(
    fileBuffer,
    fileName,
    contentType,
    'employees'
  );
  return result.url;
};

/**
 * Upload attendance photo
 */
export const uploadAttendancePhoto = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<string> => {
  const result = await uploadToS3(
    fileBuffer,
    fileName,
    contentType,
    'attendance'
  );
  return result.url;
};
