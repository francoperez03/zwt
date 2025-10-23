import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { SemaphoreService } from './semaphore.service';

@Injectable()
export class SemaphoreGuard implements CanActivate {
  constructor(private readonly semaphoreService: SemaphoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const proofHeader = request.headers['x-semaphore-proof'];

    if (!proofHeader) {
      throw new UnauthorizedException('Semaphore proof required');
    }

    let proofObject;
    try {
      proofObject = JSON.parse(proofHeader);
    } catch {
      throw new UnauthorizedException('Invalid proof format');
    }

    const isValid = await this.semaphoreService.verifyProof(proofObject);

    if (!isValid) {
      throw new ForbiddenException('Invalid proof');
    }

    return true;
  }
}
