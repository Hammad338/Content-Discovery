import { Controller, Get, Put, Delete, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { DocumentEntity } from '../database/entities/document.entity';
import { AdminGuard } from '../auth/admin.guard';
import { PublicUser } from '../auth/auth.service';

@Controller('api/admin')
@UseGuards(AdminGuard)
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

  @Get('users')
  async getAllUsers() {
    try {
      const result = await this.adminService.getAllUsers();
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Put('users/:id/role')
  async updateUserRole(
    @Param('id') id: string,
    @Body() body: { role: 'user' | 'admin' },
    @Req() req: { user: PublicUser },
  ) {
    try {
      if (body.role !== 'user' && body.role !== 'admin') {
        return { success: false, error: "role must be 'user' or 'admin'" };
      }
      const user = await this.adminService.updateUserRole(id, body.role, req.user.id);
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Req() req: { user: PublicUser }) {
    try {
      const result = await this.adminService.deleteUser(id, req.user.id);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
