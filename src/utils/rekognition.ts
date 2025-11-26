import {
  RekognitionClient,
  CompareFacesCommand,
  CompareFacesCommandInput,
} from '@aws-sdk/client-rekognition';
import { config } from '../config';
import axios from 'axios';

const rekognitionClient = new RekognitionClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

export interface FaceComparisonResult {
  isMatch: boolean;
  confidence: number;
  similarity?: number;
}

/**
 * Download image from URL and convert to buffer
 */
const downloadImage = async (url: string): Promise<Buffer> => {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 10000,
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw new Error('Failed to download image from URL');
  }
};

/**
 * Compare two faces using AWS Rekognition
 * @param sourceImageUrl - URL of the reference image (employee photo)
 * @param targetImageUrl - URL of the image to compare (check-in photo)
 * @returns Comparison result with confidence score
 */
export const compareFaces = async (
  sourceImageUrl: string,
  targetImageUrl: string
): Promise<FaceComparisonResult> => {
  try {
    // Download both images
    const [sourceImageBuffer, targetImageBuffer] = await Promise.all([
      downloadImage(sourceImageUrl),
      downloadImage(targetImageUrl),
    ]);

    const params: CompareFacesCommandInput = {
      SourceImage: {
        Bytes: sourceImageBuffer,
      },
      TargetImage: {
        Bytes: targetImageBuffer,
      },
      SimilarityThreshold: config.rekognition.similarityThreshold,
    };

    const command = new CompareFacesCommand(params);
    const response = await rekognitionClient.send(command);

    // Check if any face matches were found
    if (
      response.FaceMatches &&
      response.FaceMatches.length > 0 &&
      response.FaceMatches[0].Similarity
    ) {
      const similarity = response.FaceMatches[0].Similarity;
      const confidence = response.FaceMatches[0].Face?.Confidence || 0;

      return {
        isMatch: similarity >= config.rekognition.similarityThreshold,
        confidence,
        similarity,
      };
    }

    // No matches found
    return {
      isMatch: false,
      confidence: 0,
      similarity: 0,
    };
  } catch (error) {
    console.error('Rekognition Error:', error);
    throw new Error('Failed to compare faces using AWS Rekognition');
  }
};

/**
 * Validate if image contains a face
 */
export const detectFaces = async (imageUrl: string): Promise<boolean> => {
  try {
    const imageBuffer = await downloadImage(imageUrl);

    const params = {
      Image: {
        Bytes: imageBuffer,
      },
      Attributes: ['DEFAULT'],
    };

    const command = new CompareFacesCommand({
      SourceImage: params.Image,
      TargetImage: params.Image,
    });

    await rekognitionClient.send(command);
    return true;
  } catch (error) {
    console.error('Face detection error:', error);
    return false;
  }
};
