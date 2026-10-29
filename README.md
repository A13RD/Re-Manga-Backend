# Re-Manga — Backend API

API RESTful de **Re-Manga**, una tienda web especializada en la compra y venta de mangas de segunda mano con entrega contraentrega. Este repositorio implementa la lógica de negocio, persistencia en PostgreSQL (Supabase), autenticación con JWT y control de acceso basado en roles (`USER` y `ADMIN`) bajo una arquitectura en capas (`domain`, `application`, `infrastructure`, `interface`).

- **Repositorio Frontend:** [https://github.com/A13RD/Re-Manga-Frontend](https://github.com/A13RD/Re-Manga-Frontend)
- **URL pública del Backend (Producción):** _Pendiente de confirmación tras el despliegue en Render (`https://<servicio-backend>.onrender.com`)_

---

## 1. Stack Tecnológico

- **Entorno de ejecución:** Node.js (v20+ / v22 LTS / v24 compatible)
- **Framework HTTP:** Express 5
- **Lenguaje:** TypeScript
- **ORM y Base de Datos:** Prisma (`@prisma/client` 5.22 + `@prisma/adapter-pg`) sobre PostgreSQL en **Supabase**
- **Seguridad y Autenticación:** JSON Web Tokens (`jsonwebtoken`), hash de contraseñas con `bcrypt` (factor de costo 10) y `cors` configurable por origen
- **Pruebas automatizadas:** Suite integrada con `node:test` y `tsx`

---

## 2. Instalación y Ejecución Local

1. Clonar el repositorio e instalar las dependencias:
   ```bash
   git clone https://github.com/A13RD/Re-Manga-Backend.git
   cd Re-Manga-Backend
   npm install
   ```

2. Crear el archivo `.env` a partir de `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Generar el cliente de Prisma:
   ```bash
   npx prisma generate
   ```

4. Compilar TypeScript y ejecutar:
   - **Modo desarrollo (con recarga en caliente):**
     ```bash
     npm run dev
     ```
   - **Compilación y arranque de producción:**
     ```bash
     npm run build
     npm start
     ```

---

## 3. Variables de Entorno Requeridas

Configura las siguientes variables en `.env` (desarrollo) o en el panel del proveedor (Render en producción). **Nunca versiones el archivo `.env` ni expongas secretos reales:**

| Variable | Obligatoria | Descripción |
| :--- | :---: | :--- |
| `NODE_ENV` | Sí (Prod) | Entorno de ejecución (`development` o `production`). |
| `PORT` | No | Puerto de escucha HTTP (por defecto `4000`; Render inyecta el suyo automáticamente). |
| `DATABASE_URL` | Sí | Cadena de conexión PostgreSQL (en Supabase: Transaction Pooler en puerto `6543` con `?pgbouncer=true`). |
| `DIRECT_URL` | Sí | Cadena de conexión directa a PostgreSQL (en Supabase: Session/Direct en puerto `5432`) usada por Prisma CLI para migraciones. |
| `JWT_SECRET` | Sí | Clave secreta criptográfica aleatoria de al menos 32 caracteres para firmar y verificar tokens JWT. |
| `JWT_EXPIRES_IN` | No | Tiempo de vigencia del token JWT (por defecto `24h`). |
| `FRONTEND_URL` | Sí (Prod) | Origen(es) HTTPS permitido(s) por CORS (ej. `https://re-manga-frontend.vercel.app`). Admite varios orígenes separados por coma. |
| `ADMIN_EMAIL` | Opcional | Correo de la cuenta que se desea crear o promover a `ADMIN` al ejecutar el seed. |
| `ADMIN_PASSWORD` | Opcional | Contraseña para crear un nuevo administrador o actualizar expresamente su clave durante el seed (mínimo 8 caracteres). |
| `ADMIN_NAME` | Opcional | Nombre visible al crear un nuevo usuario administrador mediante el seed. |
| `SEED_CATALOG` | Opcional | Si se define en `true`, permite poblar el catálogo inicial incluso cuando `NODE_ENV=production`. |

---

## 4. Preparación de Prisma, Base de Datos y Migraciones

El esquema de datos se encuentra en `src/infrastructure/prisma/schema.prisma`.

- **Generar el cliente de Prisma:**
  ```bash
  npx prisma generate
  ```
- **Aplicar migraciones en producción:**
  Una vez versionada y alineada la carpeta `src/infrastructure/prisma/migrations`, el comando seguro en producción es:
  ```bash
  npx prisma migrate deploy
  ```
  > **Importante:** No utilices `prisma migrate reset` ni `prisma migrate dev` sobre la base de datos de producción en Supabase. Si el esquema de Supabase fue creado previamente mediante `db push` sin tabla `_prisma_migrations`, primero debe generarse la migración base (`baseline`) y marcarse como aplicada con `npx prisma migrate resolve --applied <nombre_migracion>` antes de usar `prisma migrate deploy`.

---

## 5. Aprovisionamiento Seguro del Administrador

El registro público (`POST /api/auth/register`) asigna exclusivamente el rol `USER` e ignora cualquier intento de enviar `role: "ADMIN"` desde el cliente.

Para promover una cuenta existente a `ADMIN` (conservando su contraseña actual) o crear un administrador de forma idempotente mediante `src/infrastructure/prisma/seed.ts`:

```bash
# Promover una cuenta existente sin cambiar su contraseña:
ADMIN_EMAIL="tu-correo-registrado@ejemplo.com" npx prisma db seed
```

- Si el correo indicado en `ADMIN_EMAIL` **ya existe**, el script actualiza su rol a `ADMIN` y mantiene intacto su `passwordHash` (a menos que también se proporcione `ADMIN_PASSWORD`).
- En `NODE_ENV=production`, el seed **no inserta mangas de demostración** ni utiliza contraseñas por defecto, exigiendo explícitamente `ADMIN_EMAIL`.

---

## 6. Configuración de CORS

En `src/index.ts`, el middleware CORS:
- Lee `process.env.FRONTEND_URL` (permitiendo uno o varios orígenes separados por coma y normalizando barras finales `/`).
- En desarrollo (`NODE_ENV !== 'production'`), habilita además `http://localhost:3000` y `http://127.0.0.1:3000`.
- En producción (`NODE_ENV === 'production'`), restringe el acceso exclusivamente a los dominios configurados en `FRONTEND_URL`, con `credentials: true`.

---

## 7. Endpoints Principales

| Método | Ruta | Acceso | Descripción |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/health` | Público | Comprobación de salud del servidor (`200 OK`). |
| `POST` | `/api/auth/register` | Público | Registro de usuario con rol `USER` y hash `bcrypt`. |
| `POST` | `/api/auth/login` | Público | Autenticación y emisión de token JWT. |
| `GET` | `/api/auth/me` | Autenticado | Devuelve el perfil verificado del usuario a partir del JWT. |
| `GET` | `/api/mangas` | Público | Catálogo paginado (`page`, `pageSize`) con filtros combinables (`search`, `genre`). |
| `GET` | `/api/mangas/:id` | Público | Detalle de un manga por su UUID. |
| `POST` | `/api/mangas` | `ADMIN` | Creación de un nuevo manga en el catálogo. |
| `PUT` | `/api/mangas/:id` | `ADMIN` | Actualización de un manga existente. |
| `DELETE` | `/api/mangas/:id` | `ADMIN` | Eliminación de un manga del catálogo. |
| `GET` | `/api/favorites` | Autenticado | Lista de mangas favoritos del usuario autenticado. |
| `POST` | `/api/favorites` | Autenticado | Agrega un manga a los favoritos del usuario. |
| `DELETE` | `/api/favorites/:mangaId` | Autenticado | Elimina un manga de los favoritos del usuario. |
| `POST` | `/api/orders` | Autenticado | Crea un pedido contraentrega (`PENDING`) dentro de una transacción atómica con descuento condicional de stock. |
| `GET` | `/api/orders` | Autenticado | Historial de compras perteneciente al usuario autenticado. |
| `GET` | `/api/orders/:id` | Propiedad / `ADMIN` | Detalle de una orden verificando que pertenezca al usuario o que sea `ADMIN`. |
| `POST` | `/api/solicitudes` | Autenticado | Crea una solicitud de venta de manga en estado `PENDING`. |
| `GET` | `/api/solicitudes/mias` | Autenticado | Lista únicamente las solicitudes de venta del usuario autenticado. |
| `GET` | `/api/solicitudes` | `ADMIN` | Lista global de solicitudes de venta para revisión administrativa. |

---

## 8. Ejecución de Pruebas Automatizadas

El repositorio cuenta con una suite de 9 pruebas automatizadas que validan paginación, búsqueda insensible a mayúsculas/minúsculas, normalización de géneros (`Shojo`/`Shoujo`, `Shonen`/`Shounen`), filtros combinados, seguridad en registro/login, control de acceso por roles (`401` vs `403`), aislamiento de recursos privados y atomicidad transaccional en compras contraentrega:

```bash
./node_modules/.bin/tsx --test tests/re-manga.test.ts
```

---

## 9. Aspectos de Arquitectura y Seguridad (Documentación Académica)

### Flujo de inicio de sesión y verificación de sesión
1. El usuario envía `email` y `password` a `POST /api/auth/login`.
2. `AuthUseCase` busca el usuario por correo normalizado y compara la contraseña con `bcrypt.compare`.
3. Si las credenciales son válidas, emite un JWT firmado con `JWT_SECRET` cuyo payload contiene `{ userId, role }` y expiración `JWT_EXPIRES_IN`.
4. En cada petición privada, el frontend envía `Authorization: Bearer <token>` y al recargar la aplicación valida la sesión contra `GET /api/auth/me`.

### Riesgos de almacenamiento del token y mitigaciones aplicadas
- El token JWT se almacena en el navegador (`localStorage` bajo la clave `remanga_auth_token`) y en memoria para enviarlo en el encabezado `Authorization`.
- Dado que `localStorage` es accesible por JavaScript en el mismo origen (riesgo ante XSS), la aplicación:
  - No almacena contraseñas ni secretos del servidor en el cliente.
  - No confía en datos de usuario ni roles guardados localmente: el estado de autenticación y el rol (`USER` / `ADMIN`) se consultan y verifican siempre contra `GET /api/auth/me` y en los middlewares del backend.
  - Limpia automáticamente el token si el backend devuelve `401 Unauthorized`.

### Diferencia entre HTTP `401 Unauthorized` y `403 Forbidden`
- **`401 Unauthorized` (`authenticateJWT`):** Se devuelve cuando la solicitud no incluye un token Bearer válido, el token está mal formado o ha expirado (identidad no autenticada).
- **`403 Forbidden` (`authorizeRoles` y validaciones de propiedad):** Se devuelve cuando el usuario sí está autenticado con un JWT válido, pero su rol (`USER`) no tiene permisos para ejecutar una acción administrativa (`ADMIN`) o intenta acceder a un recurso privado (como una orden en `GET /api/orders/:id`) que pertenece a otro usuario.

### Correcciones técnicas y uso de herramientas de IA
Durante el desarrollo e integración se utilizaron herramientas de asistencia de IA bajo supervisión humana para diagnosticar y corregir:
- La propagación de los filtros `search` y `genre` desde `MangaController` hasta `MangaRepository` en Prisma, normalizando las variantes `"Shojo"`/`"Shoujo"` y `"Shonen"`/`"Shounen"` tanto en `findMany` como en `count`.
- La protección transaccional en `OrderRepository.createOrder` mediante `prisma.$transaction` y descuento condicional atómico (`updateMany` con `stock: { gte: item.quantity }`) para impedir sobreventa o inventarios negativos ante compras concurrentes.
- El aprovisionamiento idempotente de cuentas `ADMIN` en `seed.ts` sin exponer credenciales por defecto en producción.

