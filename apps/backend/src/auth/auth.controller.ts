import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() body: { name: string; email: string; password: string }) {
    try {
      if (!body.name?.trim() || !body.email?.trim() || !body.password) {
        return { success: false, error: 'Name, email, and password are required' };
      }
      if (body.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      const result = await this.authService.signup(body.name, body.email, body.password);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Signup failed' };
    }
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      if (!body.email?.trim() || !body.password) {
        return { success: false, error: 'Email and password are required' };
      }

      const result = await this.authService.login(body.email, body.password);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  @Get('me')
  async me(@Headers('authorization') authHeader?: string) {
    try {
      const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
      if (!token) {
        return { success: false, error: 'No token provided' };
      }

      const user = await this.authService.getUserFromToken(token);
      return { success: true, data: user };
    } catch (error: any) {
      return { success: false, error: error.message || 'Unauthorized' };
    }
  }
}
