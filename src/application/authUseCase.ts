import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import {
  IUserRepository,
  RegisterUserDTO,
  LoginDTO,
  UserPublic,
  AuthTokenPayload,
  Role,
} from '../domain/user';
import {
  ValidationError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
} from '../domain/errors';

export class AuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async register(dto: RegisterUserDTO): Promise<{ user: UserPublic }> {
    const name = dto.name?.trim();
    const rawEmail = dto.email?.trim();
    const password = dto.password;

    // Validación de campos obligatorios
    if (!name) {
      throw new ValidationError('El nombre es obligatorio');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!rawEmail || !emailRegex.test(rawEmail)) {
      throw new ValidationError('Introduce un correo electrónico válido');
    }

    if (!password || password.length < 8) {
      throw new ValidationError('La contraseña debe tener al menos 8 caracteres');
    }

    const normalizedEmail = rawEmail.toLowerCase();

    // Verificación de email único
    const existingUser = await this.userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new ConflictError('El correo electrónico ya está registrado');
    }

    // Hash seguro de la contraseña mediante bcrypt (cost factor: 10)
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Asignación forzosa del rol USER por defecto para usuarios públicos
    const newUser = await this.userRepository.create({
      name,
      email: normalizedEmail,
      passwordHash,
      role: Role.USER,
    });

    // Retorno exclusivo de datos públicos (sin hash ni credenciales)
    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
    };
  }

  async login(dto: LoginDTO): Promise<{ token: string; user: UserPublic }> {
    const rawEmail = dto.email?.trim();
    const password = dto.password;

    if (!rawEmail || !password) {
      throw new ValidationError('El correo y la contraseña son obligatorios');
    }

    const normalizedEmail = rawEmail.toLowerCase();

    // Consulta de usuario por email
    const user = await this.userRepository.findByEmail(normalizedEmail);
    if (!user) {
      // Mensaje genérico para no revelar si el email existe
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    // Comparación segura con hash bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      // Mensaje genérico idéntico para fallos de contraseña
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    // Generación de JWT firmado
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no está configurado en las variables de entorno');
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      jwtSecret,
      {
        expiresIn: (process.env.JWT_EXPIRES_IN || '24h') as any,
      }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    };
  }

  async getProfile(userId: string): Promise<UserPublic> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}
