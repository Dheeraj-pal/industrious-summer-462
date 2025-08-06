import { v2 } from 'cloudinary';
import { CLOUDINARY } from './cloudinary.constant';
import { ConfigService } from '@nestjs/config';

export const CloudinaryProvider = {
  provide: CLOUDINARY,
  useFactory: (configService: ConfigService) => {
    return v2.config({
      cloud_name: configService.get<string>('CLOUDINARY_CLOUD_NAME') || 'chat-on-cloud',
      api_key: configService.get<string>('CLOUDINARY_API_KEY') || '535318223819534',
      api_secret: configService.get<string>('CLOUDINARY_API_SECRET') || 'eWaIcsuch1MLPEFYhhC37dUUUlc',
    });
  },
  inject: [ConfigService],
}; 
