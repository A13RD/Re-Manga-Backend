import { IUserRepository, User, Role } from '../../domain/user';
import { prisma } from '../database/prismaClient';

export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    return user;
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  async create(data: { name: string; email: string; passwordHash: string; role?: Role }): Promise<User> {
    const created = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        role: data.role ?? Role.USER,
      },
    });
    return created;
  }
}

