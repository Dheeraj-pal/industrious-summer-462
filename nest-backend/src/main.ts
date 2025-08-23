import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  // Create the app with rawBody option
  const app = await NestFactory.create(AppModule, {
    bodyParser: false, // Disable the built-in body parser
  });
  
  app.useGlobalInterceptors(new LoggingInterceptor());

  // Enable CORS
  app.enableCors();

  // Configure body parser to expose the raw body
  app.use(bodyParser.json({
    verify: (req: any, res, buf) => {
      // Make raw body available for Stripe webhook verification
      if (req.originalUrl && req.originalUrl.includes('/payments/webhook')) {
        req.rawBody = buf;
      }
    },
  }));
  
  // For other routes, use regular body parser
  app.use((req, res, next) => {
    if (req.originalUrl && req.originalUrl.includes('/payments/webhook')) {
      next();
    } else {
      bodyParser.urlencoded({ extended: true })(req, res, next);
    }
  });

  // Security middleware with modified CSP for Stripe webhook
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // Add more relaxed CSP for Stripe
        scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        connectSrc: ["'self'", "https://api.stripe.com"],
      },
    },
  }));

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
