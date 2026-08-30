import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('documents')
@Index(['title'])
@Index(['createdAt'])
export class DocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column('varchar', { length: 255 })
  title: string;

  @Column('varchar', { length: 255, nullable: true })
  author: string;

  @Column('simple-array', { nullable: true })
  tags: string[];

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('integer', { default: 0 })
  viewCount: number;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
