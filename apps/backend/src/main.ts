require('dotenv').config();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(3001);
  console.log('✅ AI Discovery Backend running on http://localhost:3001');
}

bootstrap().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
