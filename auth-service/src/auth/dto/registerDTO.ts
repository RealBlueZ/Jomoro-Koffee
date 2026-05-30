import { IsEmail, IsNotEmpty, IsString, MinLength, IsAlpha, NotContains } from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
    @IsString()
    @IsAlpha()
    first_name!: string;

  @IsNotEmpty()
    @IsString()
    @IsAlpha()
    last_name!: string;

  @IsNotEmpty()
    @IsEmail()
    email!: string;

  @IsNotEmpty()
    @IsString()
    @MinLength(8, { message: 'Password must have a minimum of 8 total characters.' })
    @NotContains(' ', { message: 'Password cannot contain spaces.' })
    password!: string;
}