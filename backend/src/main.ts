import 'reflect-metadata';
import {
  INestApplication,
  RequestMethod,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpResponseInterceptor } from './common/http-response.interceptor';

export function configureApp(app: INestApplication) {
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new HttpResponseInterceptor());
  app.enableCors();
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);
  await app.listen(process.env.PORT || 3000);
}

if (require.main === module) {
  void bootstrap();
}