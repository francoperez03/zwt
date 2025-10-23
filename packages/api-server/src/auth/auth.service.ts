import { Injectable } from '@nestjs/common';
import { createIdentity, IdentityData } from 'zwt-access-lib';
import { SemaphoreService } from '../semaphore/semaphore.service';

@Injectable()
export class AuthService {
  constructor(private readonly semaphoreService: SemaphoreService) {}

  signup(): IdentityData {
    const identity = createIdentity();
    this.semaphoreService.registerCommitment(identity.commitment);
    return identity;
  }

  getGroupMembers(): string[] {
    return this.semaphoreService.getCommitments();
  }
}
