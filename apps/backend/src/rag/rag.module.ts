import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from '../database/entities/document.entity';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  providers: [RagService],
  controllers: [RagController],
  exports: [RagService],
})
export class RagModule {}
