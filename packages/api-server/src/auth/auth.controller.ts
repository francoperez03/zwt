import { Controller, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup() {
    const identity = this.authService.signup();
    return {
      success: true,
      identity
    };
  }

  @Get('group-members')
  getGroupMembers() {
    const members = this.authService.getGroupMembers();
    return {
      success: true,
      members
    };
  }
}
