import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity';
import { UserEntity } from '../auth/entities/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'hammad',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ai_discovery',
  entities: [DocumentEntity, UserEntity],
  synchronize: true,
  logging: false,
};
