import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('api/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest')
  async ingestDocuments(
    @Body() body: { documents: Array<{ content: string; metadata?: Record<string, any> }> },
  ) {
    try {
      if (!body.documents || body.documents.length === 0) {
        return { success: false, error: 'Documents array is required' };
      }

      const result = await this.ragService.ingestDocuments(body.documents);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post('search')
  async search(@Body() body: { query: string }) {
    try {
      if (!body.query) {
        return { success: false, error: 'Query is required' };
      }

      const result = await this.ragService.search(body.query);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('search')
  async searchGet(@Query('q') query: string) {
    try {
      if (!query) {
        return { success: false, error: 'Query parameter (q) is required' };
      }

      const result = await this.ragService.search(query);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('semantic-search')
  async semanticSearch(@Query('q') query: string, @Query('k') k: string) {
    try {
      if (!query) {
        return { success: false, error: 'Query parameter (q) is required' };
      }

      const topK = k ? parseInt(k, 10) : 10;
      const results = await this.ragService.semanticSearch(query, topK);
      return { success: true, data: results };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('documents')
  async getLatestDocuments(@Query('limit') limit?: string) {
    try {
      const docs = await this.ragService.getLatestDocuments(limit ? parseInt(limit, 10) : 20);
      return { success: true, data: docs };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post('documents')
  async createDocument(@Body() body: { content: string; metadata?: Record<string, any> }) {
    try {
      if (!body.content || !body.content.trim()) {
        return { success: false, error: 'Content is required' };
      }

      const document = await this.ragService.createDocument(body);
      return { success: true, data: document };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('documents/:id')
  async getDocument(@Param('id') id: string) {
    try {
      const document = await this.ragService.getDocumentById(id);
      if (!document) {
        return { success: false, error: 'Document not found' };
      }
      return { success: true, data: document };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('stats')
  async getStats() {
    try {
      const stats = await this.ragService.getStats();
      return { success: true, data: stats };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
