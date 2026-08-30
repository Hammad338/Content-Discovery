import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './database/entities/document.entity';
import { typeOrmConfig } from './database/database.config';
import { HealthModule } from './health/health.module';
import { RagModule } from './rag/rag.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([DocumentEntity]),
    HealthModule,
    RagModule,
    AdminModule,
    AuthModule,
  ],
})
export class AppModule {}
