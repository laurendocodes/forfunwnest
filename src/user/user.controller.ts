// src/user/user.controller.ts
import { 
  Controller, Get, Body, Patch, Param, Delete, UseGuards, Query, Req, ParseIntPipe 
} from '@nestjs/common';
import { UserService } from './user.service';

import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/auth/dto/create-auth.dto';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { RolesGuard } from 'src/common/guards/role.guard';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtGuard, RolesGuard) 
export class UserController {
  constructor(private readonly userService: UserService) {}


  @Get()
  @Roles(Role.SUPER_ADMIN, Role.ADMIN,)
  @ApiQuery({ name: 'role', enum: Role, required: false })
  async findAll(@Query('role') role?: Role) {
    return this.userService.findAll(role);
  }


  @Get('profile')
  async getMyProfile(@Req() req: any) {
   
    return this.userService.findOne(req.user.id, req.user);
  }

  
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    return this.userService.findOne(id, req.user);
  }

  
  @Patch(':id/status')
  @Roles(Role.SUPER_ADMIN, Role.ADMIN)
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('isActive') isActive: boolean,
  ) {
    return this.userService.updateUserStatus(id, isActive);
  }


  @Patch(':id/role')
  @Roles(Role.SUPER_ADMIN)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body('role') targetRole: Role,
    @Req() req: any,
  ) {
    return this.userService.updateRole(id, targetRole, req.user.role);
  }

  
  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.userService.remove(id);
  }
}