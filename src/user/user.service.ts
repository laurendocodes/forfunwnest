// src/user/user.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from 'src/auth/dto/create-auth.dto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

 async findAll(roleFilter?: Role) {
    return this.prismaService.user.findMany({
      where: roleFilter ? { role: roleFilter } : {},
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  }

 async findOne(id: number, requestUser: { id: number; role: string }) {
    if (requestUser.role === Role.USER && requestUser.id !== id) {
      throw new ForbiddenException('You are not authorized to view this profile.');
    }

    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user) throw new NotFoundException(`User with ID ${id} not found.`);
    return user;
  }

   async updateUserStatus(id: number, isActive: boolean) {
    try {
      return await this.prismaService.user.update({
        where: { id },
        data: { isActive },
        select: { id: true, email: true, isActive: true },
      });
    } catch {
      throw new NotFoundException(`User with ID ${id} does not exist.`);
    }
  }

  async updateRole(id: number, targetRole: Role, actorRole: string) {
    // Safety check: Prevent changing anyone to SUPER_ADMIN unless a SUPER_ADMIN is making the request
    if (targetRole === Role.SUPER_ADMIN && actorRole !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('Only a SUPER_ADMIN can assign the SUPER_ADMIN role.');
    }

    try {
      return await this.prismaService.user.update({
        where: { id },
        data: { role: targetRole },
        select: { id: true, email: true, role: true },
      });
    } catch {
      throw new NotFoundException(`User with ID ${id} does not exist.`);
    }
  }

  async remove(id: number) {
    try {
      await this.prismaService.user.delete({ where: { id } });
      return { message: `User with ID ${id} permanently deleted.` };
    } catch {
      throw new NotFoundException(`User with ID ${id} does not exist.`);
    }
  }
}