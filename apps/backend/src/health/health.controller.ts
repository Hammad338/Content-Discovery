import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  health() {
    return {
      status: 'healthy',
      service: 'AI Discovery Platform',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }
}
