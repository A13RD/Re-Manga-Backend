export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = 'Datos inválidos o campos obligatorios faltantes') {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'No autorizado: credenciales inválidas o token no proporcionado') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Acceso denegado: permisos insuficientes para realizar esta acción') {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Recurso no encontrado') {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'El recurso ya existe o genera un conflicto') {
    super(message, 409);
  }
}

