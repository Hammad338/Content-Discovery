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
