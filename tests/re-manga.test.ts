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
import { IMangaRepository, Manga, CreateMangaDTO, UpdateMangaDTO, MangaFilterOptions } from '../src/domain/manga';
import { ISaleRequestRepository, SaleRequest, CreateSaleRequestDTO } from '../src/domain/saleRequest';
import { IOrderRepository, Order, OrderStatus, CreateOrderItemDTO } from '../src/domain/order';
import { IFavoriteRepository, Favorite } from '../src/domain/favorite';

const TEST_JWT_SECRET = 'test-secret-key-re-manga-2026';
process.env.JWT_SECRET = TEST_JWT_SECRET;

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
      volume: 28,
      author: 'Kentaro Miura',
      genre: 'Seinen',
      description: 'Edición en muy buen estado',
      image: '/images/berserk-vol28.jpg',
      price: 45000,
      condition: 'GOOD',
      stock: 3,
      sellerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'manga-2',
      title: 'Vagabond',
      volume: 24,
      author: 'Takehiko Inoue',
      genre: 'Seinen',
      description: 'Tomo 24',
      image: '/images/vagabond-vol24.jpg',
      price: 40000,
      condition: 'GOOD',
      stock: 2,
      sellerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'manga-3',
      title: 'Bleach',
      volume: 40,
      author: 'Tite Kubo',
      genre: 'Shonen',
      description: 'Tomo 40 aceptable',
      image: '/images/bleach-vol40.jpg',
      price: 25000,
      condition: 'FAIR',
      stock: 1,
      sellerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'manga-4',
      title: 'Bleach Edición Especial',
      volume: 40,
      author: 'Tite Kubo',
      genre: 'Shounen', // Variante en seed.ts
      description: 'Tomo 40 como nuevo',
      image: '/images/bleach-vol40.jpg',
      price: 45000,
      condition: 'LIKE_NEW',
      stock: 2,
      sellerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'manga-5',
      title: 'Ao Haru Ride',
      volume: 1,
      author: 'Io Sakisaka',
      genre: 'Shoujo', // Variante en seed.ts para el filtro Shojo
      description: 'Tomo 1',
      image: '/images/aoharuride-vol1.jpg',
      price: 30000,
      condition: 'FAIR',
      stock: 1,
      sellerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async findAll(
    page: number,
    pageSize: number,
    filters?: MangaFilterOptions
  ): Promise<{ data: Manga[]; total: number }> {
    let filtered = [...this.mangas];

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.trim().toLowerCase();
      filtered = filtered.filter((m) => m.title.toLowerCase().includes(q));
    }

    if (filters?.genre && filters.genre.trim().length > 0 && filters.genre.trim().toLowerCase() !== 'todos') {
      const g = filters.genre.trim().toLowerCase();
      filtered = filtered.filter((m) => {
        const mg = m.genre.toLowerCase();
        if (g === 'shonen' || g === 'shounen') {
          return mg === 'shonen' || mg === 'shounen';
        }
        if (g === 'shojo' || g === 'shoujo') {
          return mg === 'shojo' || mg === 'shoujo';
        }
        return mg === g;
      });
    }

    const start = (page - 1) * pageSize;
    const data = filtered.slice(start, start + pageSize);
    return { data, total: filtered.length };
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
    // Instantánea de stock para simular la atomicidad transaccional (rollback completo si algún ítem falla)
    const stockSnapshot = new Map<string, number>();
    for (const m of this.mangaRepo.mangas) {
      stockSnapshot.set(m.id, m.stock);
    }

    try {
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const manga = await this.mangaRepo.findById(item.mangaId);
        if (!manga) {
          throw new Error('El manga solicitado no fue encontrado');
        }
        if (manga.stock < item.quantity) {
          throw new Error(`Stock insuficiente para "${manga.title}". Disponibles: ${manga.stock}`);
        }

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
        status: OrderStatus.PENDING,
        createdAt: new Date(),
        updatedAt: new Date(),
        orderItems,
      };
      this.orders.push(order);
      return order;
    } catch (err) {
      // Rollback atómico del inventario si cualquier ítem falla
      for (const m of this.mangaRepo.mangas) {
        const prev = stockSnapshot.get(m.id);
        if (prev !== undefined) m.stock = prev;
      }
      throw err;
    }
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

describe('Re-Manga — Suite de Pruebas de Validaciones, Filtros, Seguridad y Transacciones (Etapa 6.7A)', () => {
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
  let secondUserToken = '';
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

  it('1. Catálogo sin filtros y validación de paginación', async () => {
    const res = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '1', pageSize: '2' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.pagination.page, 1);
    assert.equal(res.body.pagination.pageSize, 2);
    assert.equal(res.body.pagination.total, 5);
    assert.equal(res.body.pagination.totalPages, 3);
    assert.equal(res.body.data.length, 2);

    const resZero = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '0' },
    });
    assert.equal(resZero.status, 400);
  });

  it('2. Búsqueda por nombre con varios resultados (insensible a mayúsculas/minúsculas)', async () => {
    const res = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '1', pageSize: '6', search: 'bLeAcH' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.pagination.total, 2);
    assert.equal(res.body.data.length, 2);
    assert.ok(res.body.data.every((m: Manga) => m.title.toLowerCase().includes('bleach')));
  });

  it('3. Búsqueda sin coincidencias devuelve arreglo vacío y total 0', async () => {
    const res = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '1', pageSize: '6', search: 'InexistenteXYZ' },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.pagination.total, 0);
    assert.equal(res.body.pagination.totalPages, 0);
    assert.equal(res.body.data.length, 0);
  });

  it('4. Filtro por género normaliza variantes del seed (Shojo <-> Shoujo y Shonen <-> Shounen)', async () => {
    // El selector del frontend envía "Shojo" mientras el seed almacena "Shoujo"
    const resShojo = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '1', pageSize: '6', genre: 'Shojo' },
    });
    assert.equal(resShojo.status, 200);
    assert.equal(resShojo.body.pagination.total, 1);
    assert.equal(resShojo.body.data[0].title, 'Ao Haru Ride');

    // El selector del frontend envía "Shonen" y debe incluir tanto "Shonen" como "Shounen"
    const resShonen = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '1', pageSize: '6', genre: 'Shonen' },
    });
    assert.equal(resShonen.status, 200);
    assert.equal(resShonen.body.pagination.total, 2);
  });

  it('5. Búsqueda y filtro por género combinados + cambio de página con filtros activos', async () => {
    // Búsqueda + Género combinados
    const resCombined = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '1', pageSize: '6', genre: 'Seinen', search: 'vagabond' },
    });
    assert.equal(resCombined.status, 200);
    assert.equal(resCombined.body.pagination.total, 1);
    assert.equal(resCombined.body.data[0].title, 'Vagabond');

    // Cambio de página manteniendo filtro genre=Seinen (2 mangas Seinen con pageSize=1 -> página 2 devuelve Vagabond)
    const resPage2 = await invokePipeline([mangaController.getAllMangas], {
      query: { page: '2', pageSize: '1', genre: 'Seinen' },
    });
    assert.equal(resPage2.status, 200);
    assert.equal(resPage2.body.pagination.page, 2);
    assert.equal(resPage2.body.pagination.total, 2);
    assert.equal(resPage2.body.pagination.totalPages, 2);
    assert.equal(resPage2.body.data.length, 1);
    assert.equal(resPage2.body.data[0].title, 'Vagabond');
  });

  it('6. Registro e inicio de sesión seguro (bloquea escalación de privilegios y duplicados)', async () => {
    const resReg1 = await invokePipeline([authController.register], {
      body: {
        name: 'Lector Uno',
        email: 'lector1@remanga.co',
        password: 'password123',
        role: 'ADMIN', // Ignorado por seguridad
      },
    });
    assert.equal(resReg1.status, 201);
    assert.equal(resReg1.body.user.role, 'USER');

    const resReg2 = await invokePipeline([authController.register], {
      body: {
        name: 'Lector Dos',
        email: 'lector2@remanga.co',
        password: 'password123',
      },
    });
    assert.equal(resReg2.status, 201);

    const resDup = await invokePipeline([authController.register], {
      body: {
        name: 'Duplicado',
        email: 'lector1@remanga.co',
        password: 'password123',
      },
    });
    assert.equal(resDup.status, 409);

    const login1 = await invokePipeline([authController.login], {
      body: { email: 'lector1@remanga.co', password: 'password123' },
    });
    assert.equal(login1.status, 200);
    userToken = login1.body.token;

    const login2 = await invokePipeline([authController.login], {
      body: { email: 'lector2@remanga.co', password: 'password123' },
    });
    assert.equal(login2.status, 200);
    secondUserToken = login2.body.token;

    const loginAdmin = await invokePipeline([authController.login], {
      body: { email: 'admin@remanga.co', password: 'admin12345' },
    });
    assert.equal(loginAdmin.status, 200);
    adminToken = loginAdmin.body.token;
  });

  it('7. Acceso administrativo: rechaza cuenta normal con 403, sin token con 401, y permite ADMIN', async () => {
    const resNoToken = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.deleteManga],
      { params: { id: 'manga-1' } }
    );
    assert.equal(resNoToken.status, 401);

    const resNormalUser = await invokePipeline(
      [authenticateJWT, authorizeRoles(Role.ADMIN), mangaController.createManga],
      {
        headers: { Authorization: `Bearer ${userToken}` },
        body: {
          title: 'Intento',
          author: 'Autor',
          genre: 'Shonen',
          description: 'Desc',
          price: 20000,
          condition: 'NEW',
          stock: 1,
        },
      }
    );
    assert.equal(resNormalUser.status, 403);

    const resAdminCreate = await invokePipeline(
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
          stock: 2,
        },
      }
    );
    assert.equal(resAdminCreate.status, 201);
  });

  it('8. Propiedad de recursos privados: un usuario no puede leer órdenes ni solicitudes de otro usuario', async () => {
    // Usuario 1 crea solicitud de venta (intentando enviar userId de otro usuario y status APPROVED)
    const resSale = await invokePipeline([authenticateJWT, saleController.createRequest], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        userId: 'admin-1',
        status: 'APPROVED',
        title: 'Nana',
        volume: 1,
        author: 'Ai Yazawa',
        genre: 'Josei',
        condition: 'GOOD',
        proposedPrice: 30000,
        description: 'En buen estado',
      },
    });
    assert.equal(resSale.status, 201);
    assert.equal(resSale.body.userId, 'user-2');
    assert.equal(resSale.body.status, 'PENDING');

    // Usuario 2 consulta sus propias solicitudes -> no ve las del Usuario 1
    const resSaleUser2 = await invokePipeline([authenticateJWT, saleController.getMyRequests], {
      headers: { Authorization: `Bearer ${secondUserToken}` },
    });
    assert.equal(resSaleUser2.status, 200);
    assert.equal(resSaleUser2.body.length, 0);

    // Usuario 1 crea una orden contraentrega
    const resOrder1 = await invokePipeline([authenticateJWT, orderController.createOrder], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        items: [{ mangaId: 'manga-1', quantity: 1 }],
      },
    });
    assert.equal(resOrder1.status, 201);
    const orderId = resOrder1.body.id;

    // Usuario 2 intenta consultar la orden del Usuario 1 por ID -> 403 Forbidden
    const resReadOtherOrder = await invokePipeline([authenticateJWT, orderController.getOrderById], {
      params: { id: orderId },
      headers: { Authorization: `Bearer ${secondUserToken}` },
    });
    assert.equal(resReadOtherOrder.status, 403);
  });

  it('9. Compra contraentrega y atomicidad transaccional: registra estado PENDING, valida stock y revierte si falla un ítem', async () => {
    // Stock actual de manga-1 es 2 (3 inicial - 1 comprado en test anterior), manga-3 tiene stock 1
    // Intentar comprar 1 unidad de manga-1 (válido) y 5 unidades de manga-3 (excede stock de 1) en el mismo pedido
    const resAtomicFail = await invokePipeline([authenticateJWT, orderController.createOrder], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        items: [
          { mangaId: 'manga-1', quantity: 1 },
          { mangaId: 'manga-3', quantity: 5 },
        ],
      },
    });
    assert.equal(resAtomicFail.status, 400);

    // Verificar que el stock de manga-1 NO disminuyó tras el fallo del segundo ítem (rollback atómico)
    const manga1AfterFail = await mangaRepo.findById('manga-1');
    assert.equal(manga1AfterFail?.stock, 2);

    // Compra válida contraentrega de manga-3 (cantidad 1, ignorando unitPrice manipulado del cliente)
    const resValidOrder = await invokePipeline([authenticateJWT, orderController.createOrder], {
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        items: [{ mangaId: 'manga-3', quantity: 1, unitPrice: 100 }],
      },
    });
    assert.equal(resValidOrder.status, 201);
    assert.equal(resValidOrder.body.status, 'PENDING');
    assert.equal(resValidOrder.body.totalAmount, 25000);

    const manga3AfterBuy = await mangaRepo.findById('manga-3');
    assert.equal(manga3AfterBuy?.stock, 0);
  });
});
