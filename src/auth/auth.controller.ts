import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { PublicRoute } from 'src/common/decorators/public.decorator';
import { LoginAuthDto } from './dto/login-auth.dto';

@PublicRoute()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
@Post('login')
async loginUser(@Body() body: LoginAuthDto) {
  return await this.authService.loginUser(body);  
}
@Post('register')
async registerUser(@Body() body: CreateAuthDto) {
  return await this.authService.registerUser(body);   }
}
