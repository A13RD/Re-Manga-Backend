import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { AuthUseCase } from '../src/application/authUseCase';
import { MangaUseCase } from '../src/application/mangaUseCase';
import { SaleRequestUseCase } from '../src/application/saleRequestUseCase';
import { OrderUseCase } from '../src/application/orderUseCase';
import { FavoriteUseCase } from '../src/application/favoriteUseCase';

import { AuthController } from '../src/interface/controllers/authController';
import { MangaController } from '../src/interface/controllers/mangaController';
import { SaleRequestController } from '../src/interface/controllers/saleRequestController';
import { OrderController } from '../src/interface/controllers/orderController';
import { FavoriteController } from '../src/interface/controllers/favoriteController';

import { authenticateJWT } from '../src/interface/middlewares/authMiddleware';
import { authorizeRoles } from '../src/interface/middlewares/roleMiddleware';
import { errorHandler } from '../src/interface/middlewares/errorHandler';

import { IUserRepository, User, Role, CreateUserDTO } from '../src/domain/user';
import { IMangaRepository, Manga, CreateMangaDTO, UpdateMangaDTO } from '../src/domain/manga';
import { ISaleRequestRepository, SaleRequest, CreateSaleRequestDTO } from '../src/domain/saleRequest';
import { IOrderRepository, Order, OrderStatus, CreateOrderItemDTO } from '../src/domain/order';
import { IFavoriteRepository, Favorite } from '../src/domain/favorite';

const TEST_JWT_SECRET = 'test-secret-key-re-manga-2026';
process.env.JWT_SECRET = TEST_JWT_SECRET;

// Repositorios en memoria que simulan la capa de persistencia para pruebas integrales de controladores, casos de uso y middlewares
class InMemoryUserRepository implements IUserRepository {
  public users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) || null;
  }

  async create(data: CreateUserDTO): Promise<User> {
    const newUser: User = {
      id: `user-${this.users.length + 1}`,
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role || Role.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }
}

class InMemoryMangaRepository implements IMangaRepository {
  public mangas: Manga[] = [
    {
      id: 'manga-1',
      title: 'Berserk',
      volume: 1,
      author: 'Kentaro Miura',
      genre: 'Seinen',
      description: 'Edición Maximum en excelente estado',
      image: '/img/berserk1.jpg',
      price: 45000,
      condition: 'LIKE_NEW',
      stock: 3,
      sellerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'manga-2',
      title: 'One Piece',
      volume: 100,
      author: 'Eiichiro Oda',
      genre: 'Shonen',
      description: 'Tomo conmemorativo',
      image: '/img/op100.jpg',
      price: 32000,
      condition: 'NEW',
      stock: 2,
      sellerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findAll(page: number, pageSize: number): Promise<{ data: Manga[]; total: number }> {
    const start = (page - 1) * pageSize;
    const data = this.mangas.slice(start, start + pageSize);
    return { data, total: this.mangas.length };
  }

  async findById(id: string): Promise<Manga | null> {
    return this.mangas.find((m) => m.id === id) || null;
  }

  async create(dto: CreateMangaDTO): Promise<Manga> {
    const created: Manga = {
      id: `manga-${this.mangas.length + 1}`,
      title: dto.title,
      volume: dto.volume ?? null,
      author: dto.author,
      genre: dto.genre,
      description: dto.description,
      image: dto.image ?? null,
      price: dto.price,
      condition: dto.condition,
      stock: dto.stock,
      sellerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mangas.push(created);
    return created;
  }

  async update(id: string, dto: UpdateMangaDTO): Promise<Manga> {
    const index = this.mangas.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Manga not found');
    const current = this.mangas[index]!;
    const updated: Manga = {
      ...current,
      ...(dto.title !== undefined ? { title: dto.title } : {}),
      ...(dto.volume !== undefined ? { volume: dto.volume } : {}),
      ...(dto.author !== undefined ? { author: dto.author } : {}),
      ...(dto.genre !== undefined ? { genre: dto.genre } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.image !== undefined ? { image: dto.image } : {}),
      ...(dto.price !== undefined ? { price: dto.price } : {}),
      ...(dto.condition !== undefined ? { condition: dto.condition } : {}),
      ...(dto.stock !== undefined ? { stock: dto.stock } : {}),
      updatedAt: new Date(),
    };
    this.mangas[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    const index = this.mangas.findIndex((m) => m.id === id);
    if (index === -1) throw new Error('Manga not found');
    this.mangas.splice(index, 1);
  }
}

class InMemorySaleRequestRepository implements ISaleRequestRepository {
  public requests: SaleRequest[] = [];

  async findAll(): Promise<SaleRequest[]> {
    return this.requests;
  }

  async findByUserId(userId: string): Promise<SaleRequest[]> {
    return this.requests.filter((r) => r.userId === userId);
  }

  async create(userId: string, dto: CreateSaleRequestDTO): Promise<SaleRequest> {
    const created: SaleRequest = {
      id: `req-${this.requests.length + 1}`,
      userId,
      title: dto.title,
      volume: dto.volume ?? null,
      author: dto.author,
      genre: dto.genre,
      description: dto.description,
      image: dto.image ?? null,
      proposedPrice: dto.proposedPrice,
      condition: dto.condition,
      status: 'PENDING',
      mangaId: dto.mangaId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.requests.push(created);
    return created;
  }
}

class InMemoryOrderRepository implements IOrderRepository {
  public orders: Order[] = [];

  constructor(private mangaRepo: InMemoryMangaRepository) {}

  async createOrder(userId: string, items: CreateOrderItemDTO[]): Promise<Order> {
    let totalAmount = 0;
    for (const item of items) {
      const manga = await this.mangaRepo.findById(item.mangaId);
      if (!manga) {
        throw new Error('El manga solicitado no fue encontrado');
      }
      if (manga.stock < item.quantity) {
        throw new Error(`Stock insuficiente para "${manga.title}". Disponibles: ${manga.stock}`);
      }
    }

    const orderItems = [];
    for (const item of items) {
      const manga = (await this.mangaRepo.findById(item.mangaId))!;
      manga.stock -= item.quantity;
      const unitPrice = Number(manga.price);
      totalAmount += unitPrice * item.quantity;
      orderItems.push({
        id: `oi-${orderItems.length + 1}`,
        orderId: `ord-${this.orders.length + 1}`,
        mangaId: item.mangaId,
        quantity: item.quantity,
        unitPrice,
        createdAt: new Date(),
        updatedAt: new Date(),
        manga,
      });
    }

    const order: Order = {
      id: `ord-${this.orders.length + 1}`,
      userId,
      totalAmount,
      status: OrderStatus.COMPLETED,
      createdAt: new Date(),
      updatedAt: new Date(),
      orderItems,
    };
    this.orders.push(order);
    return order;
  }

  async findByUserId(userId: string): Promise<Order[]> {
    return this.orders.filter((o) => o.userId === userId);
  }

  async findById(id: string): Promise<Order | null> {
    return this.orders.find((o) => o.id === id) || null;
  }
}

class InMemoryFavoriteRepository implements IFavoriteRepository {
  public favorites: Favorite[] = [];

  constructor(private mangaRepo: InMemoryMangaRepository) {}

  async findByUserId(userId: string): Promise<Favorite[]> {
    return this.favorites.filter((f) => f.userId === userId);
  }

  async isFavorite(userId: string, mangaId: string): Promise<boolean> {
    return this.favorites.some((f) => f.userId === userId && f.mangaId === mangaId);
  }

  async add(userId: string, mangaId: string): Promise<Favorite> {
    const manga = await this.mangaRepo.findById(mangaId);
    if (!manga) throw new Error('Manga not found');
    const existing = this.favorites.find((f) => f.userId === userId && f.mangaId === mangaId);
    if (existing) return existing;
    const created: Favorite = {
      id: `fav-${this.favorites.length + 1}`,
      userId,
      mangaId,
      createdAt: new Date(),
      manga,
    };
    this.favorites.push(created);
    return created;
  }

  async remove(userId: string, mangaId: string): Promise<void> {
    this.favorites = this.favorites.filter((f) => !(f.userId === userId && f.mangaId === mangaId));
  }
}

type HandlerFn = (req: Request, res: Response, next: NextFunction) => unknown;

/**
 * Ejecuta en memoria una cadena de middlewares y controlador de Express,
 * pasando cualquier error no capturado al errorHandler centralizado.
 */
async function invokePipeline(
  handlers: HandlerFn[],
  options: {
    params?: Record<string, string>;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    body?: unknown;
  } = {}
): Promise<{ status: number; body: any }> {
  let statusCode = 200;
  let responseBody: any = undefined;
  let finished = false;

  const normalizedHeaders: Record<string, string> = {};
  if (options.headers) {
    for (const [k, v] of Object.entries(options.headers)) {
      normalizedHeaders[k.toLowerCase()] = v;
    }
  }

  const req = {
    params: options.params || {},
    query: options.query || {},
    headers: normalizedHeaders,
    body: options.body || {},
  } as unknown as Request;

  const res = {
    status(code: number) {
      statusCode = code;
      return this;
    },
    json(payload: unknown) {
      responseBody = payload;
      finished = true;
      return this;
    },
    send(payload?: unknown) {
      responseBody = payload;
      finished = true;
      return this;
    },
  } as unknown as Response;

  for (const handler of handlers) {
    if (finished) break;
    let nextCalled = false;
    let passedError: unknown = undefined;

    const next: NextFunction = (err?: unknown) => {
      nextCalled = true;
      passedError = err;
    };

    try {
      await handler(req, res, next);
    } catch (err) {
      passedError = err;
    }

    if (passedError !== undefined) {
      errorHandler(passedError, req, res, () => {});
      break;
    }

    if (!nextCalled && !finished) {
      break;
    }
  }

  return { status: statusCode, body: responseBody };
}

describe('Re-Manga — Suite de Pruebas de Validaciones, Seguridad y Flujos (Etapa 6.6)', () => {
  const userRepo = new InMemoryUserRepository();
  const mangaRepo = new InMemoryMangaRepository();
  const saleRepo = new InMemorySaleRequestRepository();
  const orderRepo = new InMemoryOrderRepository(mangaRepo);
  const favRepo = new InMemoryFavoriteRepository(mangaRepo);

  const authController = new AuthController(new AuthUseCase(userRepo));
  const mangaController = new MangaController(new MangaUseCase(mangaRepo));
  const saleController = new SaleRequestController(new SaleRequestUseCase(saleRepo));
  const orderController = new OrderController(new OrderUseCase(orderRepo));
  const favController = new FavoriteController(new FavoriteUseCase(favRepo));

  let userToken = '';
  let adminToken = '';

  before(async () => {
    const adminHash = await bcrypt.hash('admin12345', 10);
    userRepo.users.push({
      id: 'admin-1',
      name: 'Admin Re-Manga',
      email: 'admin@remanga.co',
      passwordHash: adminHash,
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  });

  it('1. Usuario anónimo puede consultar el catálogo y se respeta la paginación', async () => {
    const res = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '1', pageSize: '1' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.pageSize, 1);
    assert.equal(res.body.pagination.total, 2);
    assert.equal(res.body.pagination.totalPages, 2);
    assert.equal(res.body.data.length, 1);
  });

  it('2. Catálogo rechaza parámetros de paginación inválidos (page=0, page=-1, page=abc) con 400 Bad Request', async () => {
    const resZero = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '0' },
    });
    assert.equal(resZero.status, 400);

    const resNeg = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '-2' },
    });
    assert.equal(resNeg.status, 400);

    const resNaN = await invokePipeline([mangaController.getAllMangas], {
      query: { pageSize: 'abc' },
    });
    assert.equal(resNaN.status, 400);
  });

  it('3. Registro exitoso: almacena hash bcrypt, asigna rol USER y no expone passwordHash', async () => {
    const res = await invokePipeline([authController.register], {
      body: {
        name: 'Lector Prueba',
        email: 'Lector@ReManga.co',
        password: 'password123',
        role: 'ADMIN', // Intento de escalación de privilegios que debe ser ignorado
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.user.email, 'lector@remanga.co');
    assert.equal(res.body.user.role, 'USER');
    assert.equal(res.body.user.passwordHash, undefined);

    const storedUser = await userRepo.findByEmail('lector@remanga.co');
    assert.ok(storedUser);
    assert.notEqual(storedUser.passwordHash, 'password123');
    assert.ok(await bcrypt.compare('password123', storedUser.passwordHash));
  });

  it('4. Registro duplicado devuelve 409 Conflict', async () => {
    const res = await invokePipeline([authController.register], {
      body: {
        name: 'Otro Nombre',
        email: 'lector@remanga.co',
        password: 'password123',
      },
    });
    assert.equal(res.status, 409);
  });

  it('5. Validaciones de registro rechazan datos inválidos con 400 Bad Request', async () => {
    const resShortPass = await invokePipeline([authController.register], {
      body: { name: 'Ana', email: 'ana@test.co', password: '123' },
    });
    assert.equal(resShortPass.status, 400);

    const resBadEmail = await invokePipeline([authController.register], {
      body: { name: 'Ana', email: 'correo-invalido', password: 'password123' },
    });
    assert.equal(resBadEmail.status, 400);
  });

  it('6. Inicio de sesión válido devuelve 200 OK con token JWT; inválido devuelve 401 Unauthorized', async () => {
    const resValid = await invokePipeline([authController.login], {
      body: { email: 'lector@remanga.co', password: 'password123' },
    });
    assert.equal(resValid.status, 200);
    assert.ok(resValid.body.token);
    userToken = resValid.body.token;

    const resAdmin = await invokePipeline([authController.login], {
      body: { email: 'admin@remanga.co', password: 'admin12345' },
    });
    assert.equal(resAdmin.status, 200);
    adminToken = resAdmin.body.token;

    const resInvalidPass = await invokePipeline([authController.login], {
      body: { email: 'lector@remanga.co', password: 'wrongpassword' },
    });
    assert.equal(resInvalidPass.status, 401);

    const resNonExistent = await invokePipeline([authController.login], {
      body: { email: 'noexiste@remanga.co', password: 'password123' },
    });
    assert.equal(resNonExistent.status, 401);
  });

  it('7. Middleware JWT: rechaza acceso sin token o con token inválido con 401 y permite token válido', async () => {
    const resNoToken = await invokePipeline([authenticateJWT, authController.me]);
    assert.equal(resNoToken.status, 401);

    const resBadToken = await invokePipeline([authenticateJWT, authController.me], {
      headers: { Authorization: 'Bearer token.falso.invalido' },
    });
    assert.equal(resBadToken.status, 401);

    const expiredToken = jwt.sign({ id: 'user-2', email: 'lector@remanga.co', role: 'USER' }, TEST_JWT_SECRET, {
      expiresIn: -10,
    });
    const resExpired = await invokePipeline([authenticateJWT, authController.me], {
      headers: { Authorization: `Bearer ${expiredToken}` },
    });
    assert.equal(resExpired.status, 401);

    const resValidMe = await invokePipeline([authenticateJWT, authController.me], {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(resValidMe.status, 200);
    assert.equal(resValidMe.body.user.email, 'lector@remanga.co');
  });

  it('8. Solicitudes de venta: asocia al usuario del JWT (ignorando userId del body) y permite consultar propias', async () => {
    const resCreate = await invokePipeline([authenticateJWT, saleController.createRequest], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        userId: 'admin-1', // Intento de suplantación que debe ser ignorado
        title: 'Vagabond',
        volume: 3,
        author: 'Takehiko Inoue',
        genre: 'Seinen',
        condition: 'GOOD',
        proposedPrice: 28000,
        description: 'Buen estado general',
      },
    });
    assert.equal(resCreate.status, 201);
    assert.notEqual(resCreate.body.userId, 'admin-1');
    assert.equal(resCreate.body.userId, 'user-2');

    // Validación de precio negativo en solicitud -> 400
    const resInvalidPrice = await invokePipeline([authenticateJWT, saleController.createRequest], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        title: 'Naruto',
        author: 'Masashi Kishimoto',
        genre: 'Shonen',
        condition: 'GOOD',
        proposedPrice: -5000,
        description: 'Texto',
      },
    });
    assert.equal(resInvalidPrice.status, 400);

    // Consultar mis solicitudes
    const resMine = await invokePipeline([authenticateJWT, saleController.getMyRequests], {
      headers: { Authorization: `Bearer ${userToken}` },
    });
    assert.equal(resMine.status, 200);
    assert.equal(resMine.body.length, 1);
    assert.equal(resMine.body[0].title, 'Vagabond');
  });

  it('9. Autorización por roles: usuario normal recibe 403 al intentar gestionar mangas o ver todas las solicitudes; sin token recibe 401', async () => {
    // Eliminación sin token -> 401
    const resDelNoToken = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.deleteManga],
      { params: { id: 'manga-1' } }
    );
    assert.equal(resDelNoToken.status, 401);

    // Eliminación con token de USER -> 403
    const resDelUser = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.deleteManga],
      {
        params: { id: 'manga-1' },
        headers: { Authorization: `Bearer ${userToken}` },
      }
    );
    assert.equal(resDelUser.status, 403);

    // Creación de manga con token de USER -> 403
    const resPostUser = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.createManga],
      {
        headers: { Authorization: `Bearer ${userToken}` },
        body: {
          title: 'Test',
          author: 'Test',
          genre: 'Shonen',
          description: 'Desc',
          price: 20000,
          condition: 'NEW',
          stock: 1,
        },
      }
    );
    assert.equal(resPostUser.status, 403);

    // Consultar todas las solicitudes con token de USER -> 403
    const resAllReqsUser = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), saleController.getAllRequests],
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    assert.equal(resAllReqsUser.status, 403);
  });

  it('10. CRUD administrativo de mangas: ADMIN puede crear, actualizar y eliminar mangas con validación de datos', async () => {
    // Validación de precio inválido -> 400
    const resBadManga = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.createManga],
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          title: 'Monster',
          author: 'Naoki Urasawa',
          genre: 'Seinen',
          description: 'Kanzenban',
          price: -100,
          condition: 'LIKE_NEW',
          stock: 2,
        },
      }
    );
    assert.equal(resBadManga.status, 400);

    // Creación válida por ADMIN -> 201
    const resCreate = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.createManga],
      {
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          title: 'Monster',
          volume: 1,
          author: 'Naoki Urasawa',
          genre: 'Seinen',
          description: 'Edición Kanzenban',
          price: 55000,
          condition: 'LIKE_NEW',
          stock: 4,
        },
      }
    );
    assert.equal(resCreate.status, 201);
    const createdManga = resCreate.body;
    assert.equal(createdManga.title, 'Monster');

    // Actualización válida por ADMIN -> 200
    const resUpdate = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.updateManga],
      {
        params: { id: createdManga.id },
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          price: 52000,
          stock: 5,
        },
      }
    );
    assert.equal(resUpdate.status, 200);
    assert.equal(resUpdate.body.price, 52000);
    assert.equal(resUpdate.body.stock, 5);

    // Eliminación válida por ADMIN -> 204
    const resDelete = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.deleteManga],
      {
        params: { id: createdManga.id },
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.equal(resDelete.status, 204);

    // Eliminación de manga ya inexistente -> 404
    const resDeleteAgain = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.deleteManga],
      {
        params: { id: createdManga.id },
        headers: { Authorization: `Bearer ${adminToken}` },
      }
    );
    assert.equal(resDeleteAgain.status, 404);
  });

  it('11. Integridad de compras y favoritos: valida stock, calcula precio real del servidor y decrementa stock', async () => {
    // Agregar a favoritos
    const resFav = await invokePipeline([authenticateJWT, favController.addFavorite], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { mangaId: 'manga-1' },
    });
    assert.equal(resFav.status, 201);

    // Favorito con manga inexistente -> 404
    const resFavNotFound = await invokePipeline([authenticateJWT, favController.addFavorite], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: { mangaId: 'manga-inexistente' },
    });
    assert.equal(resFavNotFound.status, 404);

    // Rechazar compra si cantidad supera stock disponible (stock de manga-2 es 2) -> 400
    const resExceedStock = await invokePipeline([authenticateJWT, orderController.createOrder], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        items: [{ mangaId: 'manga-2', quantity: 10 }],
      },
    });
    assert.equal(resExceedStock.status, 400);

    // Compra válida (2 unidades de manga-1 a 45.000 COP c/u = 90.000 COP, ignorando cualquier unitPrice enviado)
    const resOrder = await invokePipeline([authenticateJWT, orderController.createOrder], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        items: [{ mangaId: 'manga-1', quantity: 2, unitPrice: 1 }],
      },
    });
    assert.equal(resOrder.status, 201);
    assert.equal(resOrder.body.totalAmount, 90000);

    // Verificar que el stock de manga-1 decreció de 3 a 1
    const updatedManga1 = await mangaRepo.findById('manga-1');
    assert.equal(updatedManga1?.stock, 1);
  });
});
