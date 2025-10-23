import { Module, Global } from '@nestjs/common';
import { SemaphoreService } from './semaphore.service';

@Global()
@Module({
  providers: [SemaphoreService],
  exports: [SemaphoreService],
})
export class SemaphoreModule {}
