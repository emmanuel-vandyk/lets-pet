import { IsBoolean, IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'First name must be at least 3 characters long' })
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Last name must be at least 3 characters long' })
    lastname: string;
    
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    passwordConfirmation: string;

    @IsBoolean({ message: 'You must agree to the terms and conditions' })
    terms: boolean;
}
