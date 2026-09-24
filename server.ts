import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { connectDB } from './server/config/db.js';
import authRoutes from './server/routes/auth.routes.js';
import sosRoutes from './server/routes/sos.routes.js';
import reportRoutes from './server/routes/report.routes.js';
import routeRoutes from './server/routes/route.routes.js';
import communityRoutes from './server/routes/community.routes.js';
import notificationRoutes from './server/routes/notification.routes.js';
import userRoutes from './server/routes/user.routes.js';
import adminRoutes from './server/routes/admin.routes.js';
import { errorHandler } from './server/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

async function bootstrap() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Connect to Database
  await connectDB();

  // API Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/sos', sosRoutes);
  app.use('/api/reports', reportRoutes);
  app.use('/api/routes', routeRoutes);
  app.use('/api/community', communityRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/user', userRoutes);
  app.use('/api/admin', adminRoutes);

  // Health Check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'UP',
      service: 'Suraksha SafeCity API',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Central error handling for APIs
  app.use('/api', errorHandler);

  // Frontend integration: Vite middleware in dev or static files in production
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Suraksha SafeCity] Full-Stack Platform listening on http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
