import { Injectable } from '@nestjs/common';

@Injectable()
export class ProtectedService {
  getProtectedData() {
    return {
      message: 'This is protected content',
      timestamp: new Date().toISOString(),
      data: 'You have successfully accessed this resource with a valid Semaphore proof'
    };
  }
}
