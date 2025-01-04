'use client';

import api from "../baseApi";
import { LoginUserDto } from "../dto/loginUserDto";
import { RegisterUserDto } from "../dto/registerUserDto";

async function registerUser(credentials: RegisterUserDto) {
    const { data } = await api.post('/auth/register', credentials);
    console.log(api.defaults.baseURL)
    return data; 
}

async function loginUser(credentials: LoginUserDto) {
    const { data } = await api.post('/auth/login', credentials);
    return data; 
}

export { registerUser, loginUser };