import { IsBoolean, IsEmail, IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterUserDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'First name must be at least 3 characters long' })
    firstName: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Last name must be at least 3 characters long' })
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(16, { message: 'Password must be at most 16 characters long' })
    @Matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;

    @IsString()
    passwordConfirmation: string;

    @IsBoolean({ message: 'You must agree to the terms and conditions' })
    terms: boolean;
}
