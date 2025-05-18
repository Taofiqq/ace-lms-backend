import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserResponse } from '../users/interfaces/user.interface';

interface RequestWithUser extends Request {
  user: UserResponse;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: RequestWithUser) {
    return this.authService.login(req.user);
  }
}
