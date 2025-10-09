import express from 'express';
import taskRouter from './modules/task/routes';
import authRouter from './modules/auth/routes';
import userRouter from './modules/user/routes';
import { swaggerDocs } from './config/swagger';
import prisma, { isPrismaInitError } from './lib/prisma';
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
swaggerDocs(app);

// Hello World route
app.get('/', (req, res) => {
  res.json({
    message: 'Hello World!',
    status: 'Task API is running',
    database: process.env.DATABASE_URL ? 'Connected' : 'Not configured'
  });
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$connect();
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });
  }
});

// Routes
app.use('/api/tasks', taskRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// Global error handler (last middleware)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (isPrismaInitError(err) || err?.message?.includes("Can't reach database server")) {
    return res.status(503).json({ error: 'Database is unavailable. Please try again later.' });
  }
  console.error('Unhandled error:', err);
  return res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
