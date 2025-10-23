import { Controller, Get, UseGuards } from '@nestjs/common';
import { SemaphoreGuard } from '../semaphore/semaphore.guard';
import { ProtectedService } from './protected.service';

@Controller('protected')
export class ProtectedController {
  constructor(private readonly protectedService: ProtectedService) {}

  @Get('view')
  @UseGuards(SemaphoreGuard)
  getProtectedResource() {
    return this.protectedService.getProtectedData();
  }
}
