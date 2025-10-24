---
sidebar_position: 3
---

# Backend Integration

Integrate ZWT proof verification into your backend.

## Using NestJS Guard

### 1. Install Dependencies

```bash
npm install zwt-access-lib
```

### 2. Create Semaphore Module

```typescript
import { Module, Global } from '@nestjs/common';
import { SemaphoreService } from './semaphore.service';
import { SemaphoreGuard } from './semaphore.guard';

@Global()
@Module({
  providers: [SemaphoreService, SemaphoreGuard],
  exports: [SemaphoreService, SemaphoreGuard],
})
export class SemaphoreModule {}
```

### 3. Create Semaphore Service

```typescript
import { Injectable } from '@nestjs/common';
import { verifyProof, ProofResult } from 'zwt-access-lib';

@Injectable()
export class SemaphoreService {
  private readonly usedNullifiers: Set<string> = new Set();

  async verifyProof(proofResult: ProofResult): Promise<boolean> {
    if (this.usedNullifiers.has(proofResult.nullifierHash)) {
      return false;
    }

    const isValid = await verifyProof(proofResult);

    if (isValid) {
      this.usedNullifiers.add(proofResult.nullifierHash);
    }

    return isValid;
  }
}
```

### 4. Create Semaphore Guard

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SemaphoreService } from './semaphore.service';

@Injectable()
export class SemaphoreGuard implements CanActivate {
  constructor(private readonly semaphoreService: SemaphoreService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const proofHeader = request.headers['x-zwt-token'];

    if (!proofHeader) {
      throw new UnauthorizedException('Proof required');
    }

    const proofObject = JSON.parse(proofHeader);
    const isValid = await this.semaphoreService.verifyProof(proofObject);

    if (!isValid) {
      throw new UnauthorizedException('Invalid proof');
    }

    return true;
  }
}
```

### 5. Protect Routes

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { SemaphoreGuard } from './semaphore/semaphore.guard';

@Controller('protected')
export class ProtectedController {
  @Get('view')
  @UseGuards(SemaphoreGuard)
  getProtectedResource() {
    return { data: "Protected content!" };
  }
}
```

## Using Express Middleware

```typescript
import { verifyProof } from 'zwt-access-lib';

const semaphoreMiddleware = async (req, res, next) => {
  const proofHeader = req.headers['x-zwt-token'];

  if (!proofHeader) {
    return res.status(401).json({ error: 'Proof required' });
  }

  const proof = JSON.parse(proofHeader);
  const isValid = await verifyProof(proof);

  if (!isValid) {
    return res.status(403).json({ error: 'Invalid proof' });
  }

  next();
};

app.get('/protected', semaphoreMiddleware, (req, res) => {
  res.json({ data: "Protected!" });
});
```

## Database Integration

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class SemaphoreService {
  constructor(
    @InjectRepository(Nullifier)
    private nullifierRepo: Repository<Nullifier>,
  ) {}

  async verifyProof(proof: ProofResult): Promise<boolean> {
    // Check if nullifier exists
    const exists = await this.nullifierRepo.findOne({
      where: { hash: proof.nullifierHash }
    });

    if (exists) return false;

    // Verify proof
    const isValid = await verifyProof(proof);

    // Save nullifier
    if (isValid) {
      await this.nullifierRepo.save({
        hash: proof.nullifierHash,
        createdAt: new Date()
      });
    }

    return isValid;
  }
}
```

## Next Steps

- [API Reference](../api/overview)
- [Semaphore Service API](../api/backend/semaphore)
