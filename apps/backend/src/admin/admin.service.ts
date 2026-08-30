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
