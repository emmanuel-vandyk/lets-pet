export type RegisterUserDto = {
    name: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
    terms: boolean;
};