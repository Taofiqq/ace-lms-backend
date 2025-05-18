import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  app.useGlobalPipes(new ValidationPipe());
  
  console.log(`Connected to MongoDB: ${config.get('MONGODB_URI')}`);
  console.log(`Server running on port ${config.get('PORT')}`);
  await app.listen(process.env.PORT ?? 3457);
}
bootstrap();
