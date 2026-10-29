import { Role } from '@prisma/client';

export { Role };

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: Date;
}

export interface RegisterUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: UserPublic;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: { name: string; email: string; passwordHash: string; role?: Role }): Promise<User>;
}

