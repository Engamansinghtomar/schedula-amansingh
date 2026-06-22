import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHealth() {
    return {
      status: 'success',
      service: 'Schedula Backend API',
      version: '1.0.0',
      message: 'Server is running successfully',
    };
  }
}