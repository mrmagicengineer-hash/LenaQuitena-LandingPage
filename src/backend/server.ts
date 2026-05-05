import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const app = express();
const port = Number(process.env.PORT || 3001);
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL no esta definida en el archivo .env');
}

const adapter = new PrismaBetterSqlite3({ url: databaseUrl });
const prisma = new PrismaClient({ adapter });

const allowedOrigins = new Set([
  process.env.PRODUCTION_URL,
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter((v): v is string => Boolean(v)));

const vercelPattern = /^https:\/\/lena-quitena-landing-page[^.]*\.vercel\.app$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) { callback(null, true); return; }
    if (allowedOrigins.has(origin) || vercelPattern.test(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// ── Static file serving for uploaded images ──
const uploadsDir = path.resolve(__dirname, '../../uploads/menu');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(path.resolve(__dirname, '../../uploads')));

// ── Multer config ──
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imagenes'));
  },
});

type ReservationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

const isValidReservationStatus = (value: string): value is ReservationStatus =>
  ['pending', 'confirmed', 'rejected', 'cancelled'].includes(value);

// ==================== ENDPOINTS ====================

// Image upload
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se envio ninguna imagen' });
  }
  const url = `/uploads/menu/${req.file.filename}`;
  res.json({ url });
});

app.get('/api/menu', async (req, res) => {
  try {
    const restaurant = typeof req.query.restaurant === 'string' ? req.query.restaurant : undefined;
    const categories = await prisma.menuCategory.findMany({
      where: restaurant ? { restaurantKey: restaurant } : undefined,
      orderBy: { order: 'asc' },
      include: {
        items: { orderBy: { order: 'asc' } }
      }
    });
    console.log("Categories encontradas:", categories.length, restaurant ? `(${restaurant})` : '(todas)');
    res.json(categories);
  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({ error: 'Error al obtener el menú' });
  }
});

app.post('/api/menu', async (req, res) => {
  try {
    const { restaurant, categories: newMenu } = req.body ?? {};

    if (!restaurant || typeof restaurant !== 'string') {
      return res.status(400).json({ error: 'Se requiere el campo "restaurant" (ej. "san-marcos" o "la-ronda")' });
    }
    if (!Array.isArray(newMenu)) {
      return res.status(400).json({ error: 'El campo "categories" debe ser un arreglo de categorías' });
    }

    console.log(`📥 Recibido: ${newMenu.length} categorías para ${restaurant}`);

    // Solo borrar las categorías (e items en cascada) del restaurante indicado
    const toDelete = await prisma.menuCategory.findMany({
      where: { restaurantKey: restaurant },
      select: { id: true },
    });
    if (toDelete.length > 0) {
      const ids = toDelete.map((c) => c.id);
      await prisma.menuItem.deleteMany({ where: { categoryId: { in: ids } } });
      await prisma.menuCategory.deleteMany({ where: { id: { in: ids } } });
    }
    console.log(`🗑️ Limpiadas ${toDelete.length} categorías de ${restaurant}`);

    for (let catIndex = 0; catIndex < newMenu.length; catIndex++) {
      const cat = newMenu[catIndex];
      const created = await prisma.menuCategory.create({
        data: {
          title: cat.title,
          restaurantKey: restaurant,
          order: catIndex,
          items: {
            create: (cat.items ?? []).map((item: any, itemIndex: number) => ({
              name: item.name,
              desc: item.desc ?? null,
              price: item.price,
              badge: item.badge ?? null,
              image: item.image ?? null,
              order: itemIndex,
            }))
          }
        }
      });
      console.log(`✅ Creada categoría: ${cat.title} | ID: ${created.id}`);
    }

    const total = await prisma.menuCategory.count({ where: { restaurantKey: restaurant } });
    console.log(`📊 Total para ${restaurant}: ${total}`);

    res.json({
      message: 'Menú actualizado',
      restaurant,
      totalSaved: total
    });

  } catch (error: any) {
    console.error("❌ ERROR:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/reservations', async (_req, res) => {
  try {
    const reservations = await prisma.reservation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(reservations);
  } catch (error: any) {
    console.error('Error al obtener reservas:', error?.message ?? error);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});

app.post('/api/reservations', async (req, res) => {
  try {
    const { locale, date, time, guests, name, phone, notes, source } = req.body ?? {};

    if (!locale || !date || !time || !guests || !name || !phone) {
      return res.status(400).json({
        error: 'Campos requeridos: locale, date, time, guests, name, phone',
      });
    }

    const reservation = await prisma.reservation.create({
      data: {
        locale: String(locale).trim(),
        date: String(date).trim(),
        time: String(time).trim(),
        guests: String(guests).trim(),
        contactName: String(name).trim(),
        contactPhone: String(phone).trim(),
        notes: notes ? String(notes).trim() : null,
        source: source ? String(source).trim() : 'chatbot',
        status: 'pending',
      },
    });

    res.status(201).json(reservation);
  } catch (error: any) {
    console.error('Error al guardar reserva:', error?.message ?? error);
    res.status(500).json({ error: 'Error al guardar reserva' });
  }
});

app.patch('/api/reservations/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body ?? {};

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'ID invalido' });
    }

    if (typeof status !== 'string' || !isValidReservationStatus(status)) {
      return res.status(400).json({ error: 'Estado invalido' });
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: { status },
    });

    res.json(reservation);
  } catch (error: any) {
    console.error('Error al actualizar estado de reserva:', error?.message ?? error);
    res.status(500).json({ error: 'Error al actualizar estado de reserva' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${port}`);
});