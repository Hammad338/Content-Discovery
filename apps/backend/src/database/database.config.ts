import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'hammad',
  password: '',
  database: 'ai_discovery',
  entities: [DocumentEntity],
  synchronize: true,
  logging: false,
};