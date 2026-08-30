#!/bin/bash

# Backend Setup Script - Database + Admin Features
# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AI Discovery Backend Setup Script${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Check if we're in the right directory
if [ ! -f "apps/backend/package.json" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    echo -e "${RED}   Current: $(pwd)${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Step 1: Updating Backend Dependencies${NC}"
cp apps/backend/package.json apps/backend/package.json.backup
cat > apps/backend/package.json << 'BACKEND_PACKAGE'
{
  "name": "acd-backend",
  "version": "1.0.0",
  "main": "dist/main.js",
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "typeorm": "typeorm",
    "migration:generate": "typeorm migration:generate",
    "migration:run": "typeorm migration:run",
    "migration:revert": "typeorm migration:revert"
  },
  "dependencies": {
    "@nestjs/common": "^10.2.0",
    "@nestjs/core": "^10.2.0",
    "@nestjs/platform-express": "^10.2.0",
    "@nestjs/typeorm": "^10.0.0",
    "typeorm": "^0.3.16",
    "pg": "^8.11.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.2.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.2.0"
  }
}
BACKEND_PACKAGE
echo -e "${GREEN}✅ Backend package.json updated${NC}\n"

echo -e "${YELLOW}📁 Step 2: Creating Database Configuration${NC}"
mkdir -p apps/backend/src/database/entities

cat > apps/backend/src/database/database.config.ts << 'DATABASE_CONFIG'
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'ai_discovery',
  entities: [DocumentEntity],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  dropSchema: false,
};
DATABASE_CONFIG
echo -e "${GREEN}✅ Database config created${NC}\n"

echo -e "${YELLOW}📝 Step 3: Creating Document Entity${NC}"
cat > apps/backend/src/database/entities/document.entity.ts << 'DOCUMENT_ENTITY'
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
DOCUMENT_ENTITY
echo -e "${GREEN}✅ Document entity created${NC}\n"

echo -e "${YELLOW}⚙️ Step 4: Creating Admin Module${NC}"
mkdir -p apps/backend/src/admin

cat > apps/backend/src/admin/admin.service.ts << 'ADMIN_SERVICE'
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEntity } from '../database/entities/document.entity';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(DocumentEntity)
    private documentsRepository: Repository<DocumentEntity>,
  ) {}

  async getAllDocuments(page: number = 1, limit: number = 10) {
    try {
      const [documents, total] = await this.documentsRepository.findAndCount({
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      return {
        data: documents,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error('Error fetching documents:', error);
      throw error;
    }
  }

  async getDocumentById(id: string) {
    try {
      const document = await this.documentsRepository.findOne({ where: { id } });
      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      return document;
    } catch (error) {
      this.logger.error('Error fetching document:', error);
      throw error;
    }
  }

  async updateDocument(id: string, updateData: Partial<DocumentEntity>) {
    try {
      await this.documentsRepository.update(id, updateData);
      return await this.getDocumentById(id);
    } catch (error) {
      this.logger.error('Error updating document:', error);
      throw error;
    }
  }

  async deleteDocument(id: string) {
    try {
      const result = await this.documentsRepository.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`Document with ID ${id} not found`);
      }
      return { success: true, message: 'Document deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting document:', error);
      throw error;
    }
  }

  async toggleDocumentStatus(id: string) {
    try {
      const document = await this.getDocumentById(id);
      document.isActive = !document.isActive;
      return await this.documentsRepository.save(document);
    } catch (error) {
      this.logger.error('Error toggling document status:', error);
      throw error;
    }
  }

  async getAnalytics() {
    try {
      const total = await this.documentsRepository.count();
      const active = await this.documentsRepository.count({ where: { isActive: true } });
      
      const mostViewed = await this.documentsRepository.find({
        order: { viewCount: 'DESC' },
        take: 5,
      });

      const recentlyAdded = await this.documentsRepository.find({
        order: { createdAt: 'DESC' },
        take: 5,
      });

      return {
        totalDocuments: total,
        activeDocuments: active,
        inactiveDocuments: total - active,
        mostViewed,
        recentlyAdded,
      };
    } catch (error) {
      this.logger.error('Error fetching analytics:', error);
      throw error;
    }
  }

  async searchDocuments(query: string) {
    try {
      return await this.documentsRepository
        .createQueryBuilder('doc')
        .where('doc.title ILIKE :query OR doc.content ILIKE :query OR doc.author ILIKE :query', {
          query: `%${query}%`,
        })
        .orderBy('doc.createdAt', 'DESC')
        .take(20)
        .getMany();
    } catch (error) {
      this.logger.error('Error searching documents:', error);
      throw error;
    }
  }

  async getTagsStats() {
    try {
      const documents = await this.documentsRepository.find();
      const tagsMap = new Map<string, number>();

      documents.forEach(doc => {
        (doc.tags || []).forEach(tag => {
          tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
        });
      });

      return Array.from(tagsMap.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      this.logger.error('Error fetching tags:', error);
      throw error;
    }
  }
}
ADMIN_SERVICE
echo -e "${GREEN}✅ Admin service created${NC}\n"

echo -e "${YELLOW}🎛️ Step 5: Creating Admin Controller${NC}"
cat > apps/backend/src/admin/admin.controller.ts << 'ADMIN_CONTROLLER'
import { Controller, Get, Put, Delete, Post, Body, Param, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DocumentEntity } from '../database/entities/document.entity';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('documents')
  async getAllDocuments(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    try {
      const result = await this.adminService.getAllDocuments(
        parseInt(page),
        parseInt(limit),
      );
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('documents/:id')
  async getDocument(@Param('id') id: string) {
    try {
      const document = await this.adminService.getDocumentById(id);
      return { success: true, data: document };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Put('documents/:id')
  async updateDocument(
    @Param('id') id: string,
    @Body() updateData: Partial<DocumentEntity>,
  ) {
    try {
      const document = await this.adminService.updateDocument(id, updateData);
      return { success: true, data: document };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Delete('documents/:id')
  async deleteDocument(@Param('id') id: string) {
    try {
      const result = await this.adminService.deleteDocument(id);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post('documents/:id/toggle')
  async toggleStatus(@Param('id') id: string) {
    try {
      const document = await this.adminService.toggleDocumentStatus(id);
      return { success: true, data: document };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('analytics')
  async getAnalytics() {
    try {
      const analytics = await this.adminService.getAnalytics();
      return { success: true, data: analytics };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('search')
  async searchDocuments(@Query('q') query: string) {
    try {
      if (!query) {
        return { success: false, error: 'Query is required' };
      }
      const results = await this.adminService.searchDocuments(query);
      return { success: true, data: results };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('tags')
  async getTagsStats() {
    try {
      const tags = await this.adminService.getTagsStats();
      return { success: true, data: tags };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
ADMIN_CONTROLLER
echo -e "${GREEN}✅ Admin controller created${NC}\n"

echo -e "${YELLOW}📦 Step 6: Creating Admin Module${NC}"
cat > apps/backend/src/admin/admin.module.ts << 'ADMIN_MODULE'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { DocumentEntity } from '../database/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DocumentEntity])],
  providers: [AdminService],
  controllers: [AdminController],
  exports: [AdminService],
})
export class AdminModule {}
ADMIN_MODULE
echo -e "${GREEN}✅ Admin module created${NC}\n"

echo -e "${YELLOW}🔄 Step 7: Updating RAG Module Files${NC}"
cat > apps/backend/src/rag/rag.module.ts << 'RAG_MODULE'
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
RAG_MODULE
echo -e "${GREEN}✅ RAG module updated${NC}\n"

echo -e "${YELLOW}🔗 Step 8: Updating App Module${NC}"
cat > apps/backend/src/app.module.ts << 'APP_MODULE'
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './database/entities/document.entity';
import { typeOrmConfig } from './database/database.config';
import { HealthModule } from './health/health.module';
import { RagModule } from './rag/rag.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([DocumentEntity]),
    HealthModule,
    RagModule,
    AdminModule,
  ],
})
export class AppModule {}
APP_MODULE
echo -e "${GREEN}✅ App module updated${NC}\n"

echo -e "${YELLOW}🔐 Step 9: Setting Up Environment Variables${NC}"
if [ ! -f "apps/backend/.env" ]; then
    cat > apps/backend/.env << 'ENV_FILE'
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
CLAUDE_API_KEY=your_claude_api_key_here

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=ai_discovery
ENV_FILE
    echo -e "${GREEN}✅ .env file created${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit apps/backend/.env and add your database credentials${NC}\n"
else
    echo -e "${YELLOW}ℹ️  .env already exists, skipping...${NC}\n"
fi

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Backend Setup Complete!${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "1. ${BLUE}Edit your .env file:${NC}"
echo -e "   ${BLUE}nano apps/backend/.env${NC}"
echo -e "   (Add your PostgreSQL credentials)\n"

echo -e "2. ${BLUE}Install dependencies:${NC}"
echo -e "   ${BLUE}cd apps/backend${NC}"
echo -e "   ${BLUE}npm install${NC}\n"

echo -e "3. ${BLUE}Start backend:${NC}"
echo -e "   ${BLUE}npm run dev${NC}\n"

echo -e "4. ${BLUE}In a new terminal, run frontend setup:${NC}"
echo -e "   ${BLUE}cd apps/frontend${NC}"
echo -e "   ${BLUE}chmod +x ../setup-frontend.sh${NC}"
echo -e "   ${BLUE}../setup-frontend.sh${NC}\n"

echo -e "${GREEN}🚀 Happy coding!${NC}\n"
