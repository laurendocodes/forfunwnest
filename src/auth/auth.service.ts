import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/login-auth.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async loginUser(body: LoginAuthDto) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        isActive: true,
      },
    });

    if (!user) throw new BadRequestException('Invalid Email/Password.');

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) throw new BadRequestException('Invalid Email/Password.');

    const userPayload = { id: user.id, email: user.email, isActive: user.isActive,role: user.role };
    const accessToken = await this.jwtService.signAsync(userPayload);

    return {
      status: 200,
      message: "You're authorized",
      access_token: accessToken,
    };
  }

  async registerUser(body: CreateAuthDto) {
    const existingUser = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('Email already in use.');
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const newUser = await this.prismaService.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        name: body.name,
      },
    });

    return {
      status: 201,
      message: 'User registered successfully',
      userId: newUser.id,
    };
  }
}