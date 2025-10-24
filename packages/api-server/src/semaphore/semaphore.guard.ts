import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { SemaphoreService } from './semaphore.service';

@Injectable()
export class SemaphoreGuard implements CanActivate {
  constructor(private readonly semaphoreService: SemaphoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // HTTP headers are case-insensitive, NestJS converts them to lowercase
    const proofHeader = request.headers['x-zwt-token'];

    console.log('=== SemaphoreGuard DEBUG ===');
    console.log('All headers:', request.headers);
    console.log('Proof header:', proofHeader);
    console.log('Proof header type:', typeof proofHeader);

    if (!proofHeader) {
      throw new UnauthorizedException('Semaphore proof required');
    }

    let proofObject;
    try {
      proofObject = typeof proofHeader === 'string' ? JSON.parse(proofHeader) : proofHeader;
      console.log('Parsed proof object:', proofObject);
    } catch (error) {
      console.error('Failed to parse proof:', error);
      throw new UnauthorizedException('Invalid proof format');
    }

    const isValid = await this.semaphoreService.verifyProof(proofObject);

    if (!isValid) {
      throw new ForbiddenException('Invalid proof');
    }

    return true;
  }
}
