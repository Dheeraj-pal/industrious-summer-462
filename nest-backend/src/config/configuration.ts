import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: String(process.env.DB_PASSWORD || 'postgres'),
    database: process.env.DB_DATABASE,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRATION || '1d',
  },
  swagger: {
    title: process.env.SWAGGER_TITLE || 'Dollar General API',
    description: process.env.SWAGGER_DESCRIPTION || 'The Dollar General API description',
    version: process.env.SWAGGER_VERSION || '1.0',
  },
})); 