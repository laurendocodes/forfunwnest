import { ApiProperty } from "@nestjs/swagger";
import { IsString } from 'class-validator';
import {IsEmail} from "class-validator";
export class LoginAuthDto {
    @ApiProperty({example: 'user@example.com', description: 'The email of the user'})
    @IsEmail()
    email!: string;
    @ApiProperty({example: 'password123', description: 'The password of the user'})
    @IsString()
    password!: string;

}