import { Role, MangaCondition, Prisma } from '@prisma/client';
import { prisma } from '../database/prismaClient';

function mapCondition(estado: string): MangaCondition {
  switch (estado.toLowerCase()) {
    case 'como nuevo': return MangaCondition.LIKE_NEW;
    case 'muy buen estado': return MangaCondition.GOOD;
    case 'buen estado': return MangaCondition.GOOD;
    case 'aceptable': return MangaCondition.FAIR;
    default: return MangaCondition.POOR;
  }
}

async function main() {
  console.log('Iniciando seed de base de datos...');

  // 1. Crear un usuario administrador inicial
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@remanga.com' },
    update: {},
    create: {
      name: 'Admin Re-Manga',
      email: 'admin@remanga.com',
      passwordHash: 'dummy_hash_to_be_replaced', // Se reemplazará con bcrypt después
      role: Role.ADMIN,
    },
  });

  console.log(`Usuario administrador creado con ID: ${adminUser.id}`);

  // 2. Datos de los mangas iniciales, extraídos de script.js
  const mangasData = [
    { titulo: "Berserk", volumen: 28, autor: "Kentaro Miura", genero: "Seinen", precio: 45000, estado: "Muy buen estado", imagen: "/images/berserk-vol28.jpg" },
    { titulo: "Vagabond", volumen: 24, autor: "Takehiko Inoue", genero: "Seinen", precio: 40000, estado: "Buen estado", imagen: "/images/vagabond-vol24.jpg" },
    { titulo: "Jujutsu Kaisen", volumen: 1, autor: "Gege Akutami", genero: "Shonen", precio: 35000, estado: "Como nuevo", imagen: "/images/jujutsukaisen-vol1.jpg" },
    { titulo: "Bleach", volumen: 40, autor: "Tite Kubo", genero: "Shonen", precio: 25000, estado: "Aceptable", imagen: "/images/bleach-vol40.jpg" },
    { titulo: "Naruto", volumen: 47, autor: "Masashi Kishimoto", genero: "Shonen", precio: 28000, estado: "Buen estado", imagen: "/images/naruto-vol47.jpg" },
    { titulo: "One Punch Man", volumen: 32, autor: "ONE & Yusuke Murata", genero: "Seinen", precio: 32000, estado: "Buen estado", imagen: "/images/onepunchman-vol32.jpg" },
    { titulo: "One Piece", volumen: 104, autor: "Eiichiro Oda", genero: "Shonen", precio: 30000, estado: "Buen estado", imagen: "/images/onepiece-vol104.jpg" },
    { titulo: "Hunter x Hunter", volumen: 37, autor: "Yoshihiro Togashi", genero: "Shonen", precio: 38000, estado: "Como nuevo", imagen: "/images/hunterxhunter-vol37.jpg" },
    { titulo: "Tokyo Ghoul", volumen: 14, autor: "Sui Ishida", genero: "Seinen", precio: 34000, estado: "Muy buen estado", imagen: "/images/tokyoghoul-vol14.jpg" },
    { titulo: "Fullmetal Alchemist", volumen: 19, autor: "Hiromu Arakawa", genero: "Shonen", precio: 36000, estado: "Buen estado", imagen: "/images/fullmetal-vol19.jpg" },
    { titulo: "Blue Lock", volumen: 20, autor: "Muneyuki Kaneshiro", genero: "Shonen", precio: 42000, estado: "Como nuevo", imagen: "/images/bluelock-vol20.jpg" },
    { titulo: "Oyasumi Punpun", volumen: 12, autor: "Inio Asano", genero: "Seinen", precio: 45000, estado: "Muy buen estado", imagen: "/images/oyasumipunpun-vol12.webp" },
    { titulo: "Nana", volumen: 21, autor: "Ai Yazawa", genero: "Josei", precio: 35000, estado: "Buen estado", imagen: "/images/nana-vol2.jpg" },
    { titulo: "Akira", volumen: 1, autor: "Katsuhiro Otomo", genero: "Seinen", precio: 60000, estado: "Como nuevo", imagen: "/images/akira-vol1.jpg" },
    { titulo: "Neon Genesis Evangelion", volumen: 3, autor: "Yoshiyuki Sadamoto", genero: "Seinen", precio: 48000, estado: "Buen estado", imagen: "/images/neongenesisevangelion-vol3.webp" },
    { titulo: "Dragon Ball", volumen: 8, autor: "Akira Toriyama", genero: "Shonen", precio: 25000, estado: "Aceptable", imagen: "/images/dragonball-vol8.webp" },
    { titulo: "Paradise Kiss", volumen: 1, autor: "Ai Yazawa", genero: "Josei", precio: 40000, estado: "Buen estado", imagen: "/images/paradisekiss-vol1.jpg" },
    { titulo: "Nodame Cantabile", volumen: 6, autor: "Tomoko Ninomiya", genero: "Josei", precio: 32000, estado: "Como nuevo", imagen: "/images/nodamecantabile-vol6.webp" },
    { titulo: "Gokinjo Monogatari", volumen: 1, autor: "Ai Yazawa", genero: "Shoujo", precio: 38000, estado: "Aceptable", imagen: "/images/gokinjomonogatari-vol1.jpg" },
    { titulo: "Ao Haru Ride", volumen: 1, autor: "Io Sakisaka", genero: "Shoujo", precio: 30000, estado: "Aceptable", imagen: "/images/aoharuride-vol1.jpg" },
    { titulo: "Fruits Basket", volumen: 5, autor: "Natsuki Takaya", genero: "Shoujo", precio: 34000, estado: "Como nuevo", imagen: "/images/fruitsbasket-vol5.jpg" },
    // NOTA: El ID 22 en el array original (Bleach vol 40) representa un producto diferente al ID 4
    // porque tiene diferente estado y precio. Lo mantenemos como producto separado.
    { titulo: "Bleach", volumen: 40, autor: "Tite Kubo", genero: "Shounen", precio: 45000, estado: "Como nuevo", imagen: "/images/bleach-vol40.jpg" }
  ];

  for (const m of mangasData) {
    const condition = mapCondition(m.estado);
    const priceDecimal = new Prisma.Decimal(m.precio);

    const existingManga = await prisma.manga.findFirst({
      where: {
        title: m.titulo,
        volume: m.volumen,
        condition: condition,
        sellerId: adminUser.id
      }
    });

    if (!existingManga) {
      const createdManga = await prisma.manga.create({
        data: {
          title: m.titulo,
          volume: m.volumen,
          author: m.autor,
          genre: m.genero,
          description: `Tomo ${m.volumen} del manga ${m.titulo}. Estado: ${m.estado}`,
          image: m.imagen,
          price: priceDecimal,
          condition: condition,
          stock: 1,
          sellerId: adminUser.id
        }
      });
      console.log(`Manga insertado: ${createdManga.title} - Vol. ${createdManga.volume} - ${m.estado}`);
    } else {
      console.log(`Manga saltado (ya existe): ${m.titulo} - Vol. ${m.volumen} - ${m.estado}`);
    }
  }

  console.log('Seed completado satisfactoriamente.');
}

main()
  .catch((e) => {
    console.error('Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
