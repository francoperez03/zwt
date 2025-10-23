import { Module } from '@nestjs/common';
import { SemaphoreModule } from './semaphore/semaphore.module';
import { AuthModule } from './auth/auth.module';
import { ProtectedModule } from './protected/protected.module';

@Module({
  imports: [SemaphoreModule, AuthModule, ProtectedModule],
})
export class AppModule {}
