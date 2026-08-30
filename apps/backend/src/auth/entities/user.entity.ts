import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { length: 255 })
  name: string;

  @Index({ unique: true })
  @Column('varchar', { length: 255 })
  email: string;

  @Column('varchar', { length: 255 })
  passwordHash: string;

  @Column('varchar', { length: 20, default: 'user' })
  role: 'user' | 'admin';

  @CreateDateColumn()
  createdAt: Date;
}
