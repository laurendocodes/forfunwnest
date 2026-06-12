import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from 'class-validator';
import {IsEmail} from "class-validator";

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}
export class CreateAuthDto {
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  @IsString()
  password!: string;

  // Changed to ApiPropertyOptional since it's optional in your Prisma model
  @ApiPropertyOptional({ example: 'John Doe', description: 'The name of the user' })
  @IsString()
  @IsOptional()
  name?: string;

  // 2. Added the role validation property
  @ApiPropertyOptional({ 
    enum: Role, 
    default: Role.USER, 
    description: 'The access role assigned to the user' 
  })
  @IsEnum(Role, { message: 'role must be either SUPER_ADMIN, ADMIN, or USER' })
  @IsOptional()
  role?: string; 
}
