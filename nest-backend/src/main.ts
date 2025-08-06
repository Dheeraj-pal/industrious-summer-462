import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ResponseInterceptor } from './common/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  // const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new LoggingInterceptor()); 

  // Enable CORS
  app.enableCors();

  // Security middleware
  app.use(helmet());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true, // Re-enable implicit conversion for numeric fields
      },
    }),
  );

  // Register global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('Dollar General API')
    .setDescription('The Dollar General API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = 3030;
  await app.listen(port);
  // logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
