import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity';
import { UserEntity } from '../auth/entities/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'hammad',
  password: '',
  database: 'ai_discovery',
  entities: [DocumentEntity, UserEntity],
  synchronize: true,
  logging: false,
};