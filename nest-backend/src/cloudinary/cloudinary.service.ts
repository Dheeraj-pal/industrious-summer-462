import { Injectable } from '@nestjs/common';
import { v2 } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constant';

interface FileUpload {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: FileUpload,
    folder: string,
  ): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const fileName = file.originalname.split('.').slice(0, -1).join('.');
      const upload = v2.uploader.upload_stream(
        {
          folder: `ecommerce/${folder}`,
          public_id: `${fileName.replace(/\s/g, '_')}-${Date.now()}`,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(
              new Error('Cloudinary upload failed: no result returned.'),
            );
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      upload.end(file.buffer);
    });
  }

  async uploadMultipleImages(
    files: FileUpload[],
    folder: string,
  ): Promise<CloudinaryUploadResult[]> {
    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteImage(publicId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      v2.uploader.destroy(publicId, (error, result) => {
        if (error) return reject(error);
        resolve();
      });
    });
  }
} 