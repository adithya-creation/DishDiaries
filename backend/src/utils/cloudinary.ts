import { v2 as cloudinary } from 'cloudinary';
import { UploadedFile } from '@/types';
import { logger } from './logger';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Check if Cloudinary is configured
const isConfigured = (): boolean => {
  return !!(
    process.env.CLOUDINARY_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

// Upload image to Cloudinary
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string = 'dishdiaries'
): Promise<UploadedFile> => {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Please check environment variables.');
  }

  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      use_filename: true,
      unique_filename: true,
      overwrite: false,
      resource_type: 'image',
      format: 'webp', // Convert to WebP for better compression
      quality: 'auto',
      fetch_format: 'auto',
      transformation: [
        {
          width: 1200,
          height: 800,
          crop: 'limit',
          quality: 'auto',
          format: 'webp'
        }
      ]
    });

    logger.info('Image uploaded to Cloudinary:', {
      publicId: result.public_id,
      url: result.secure_url,
      bytes: result.bytes
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    logger.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Upload image from buffer
export const uploadImageFromBuffer = async (
  buffer: Buffer,
  filename: string,
  folder: string = 'dishdiaries'
): Promise<UploadedFile> => {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Please check environment variables.');
  }

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: filename,
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          resource_type: 'image',
          format: 'webp',
          quality: 'auto',
          fetch_format: 'auto',
          transformation: [
            {
              width: 1200,
              height: 800,
              crop: 'limit',
              quality: 'auto',
              format: 'webp'
            }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    }) as any;

    logger.info('Image uploaded to Cloudinary from buffer:', {
      publicId: result.public_id,
      url: result.secure_url,
      bytes: result.bytes
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    };
  } catch (error) {
    logger.error('Cloudinary upload from buffer error:', error);
    throw new Error(`Failed to upload image from buffer: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Delete image from Cloudinary
export const deleteImage = async (publicId: string): Promise<void> => {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Please check environment variables.');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new Error(`Failed to delete image: ${result.result}`);
    }

    logger.info('Image deleted from Cloudinary:', { publicId, result: result.result });
  } catch (error) {
    logger.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Generate optimized image URL
export const getOptimizedImageUrl = (
  publicId: string,
  width?: number,
  height?: number,
  quality: string = 'auto'
): string => {
  if (!isConfigured()) {
    return '';
  }

  const transformations = [];

  if (width || height) {
    transformations.push({
      width,
      height,
      crop: 'limit'
    });
  }

  transformations.push({
    quality,
    format: 'auto',
    fetch_format: 'auto'
  });

  return cloudinary.url(publicId, {
    transformation: transformations,
    secure: true
  });
};

// Generate responsive image URLs
export const getResponsiveImageUrls = (publicId: string) => {
  if (!isConfigured()) {
    return {
      thumbnail: '',
      small: '',
      medium: '',
      large: '',
      original: ''
    };
  }

  return {
    thumbnail: getOptimizedImageUrl(publicId, 150, 150),
    small: getOptimizedImageUrl(publicId, 400, 300),
    medium: getOptimizedImageUrl(publicId, 800, 600),
    large: getOptimizedImageUrl(publicId, 1200, 800),
    original: cloudinary.url(publicId, { secure: true })
  };
};

// Validate image file
export const validateImageFile = (file: Express.Multer.File): boolean => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB default

  if (!allowedMimeTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.');
  }

  if (file.size > maxSize) {
    throw new Error(`File size too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
  }

  return true;
};

// Get image metadata
export const getImageMetadata = async (publicId: string) => {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Please check environment variables.');
  }

  try {
    const result = await cloudinary.api.resource(publicId);
    return {
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      createdAt: result.created_at,
      url: result.secure_url
    };
  } catch (error) {
    logger.error('Failed to get image metadata:', error);
    throw new Error(`Failed to get image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}; 