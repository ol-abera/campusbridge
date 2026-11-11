import { config } from './src/config.js';
import { createApp } from './src/app.js';
import { initializeDatabase, pool } from './src/db/index.js';

process.on('unhandledRejection', (reason) => console.error('Unhandled promise rejection:', reason));

try {
  await initializeDatabase();
} catch (err) {
  console.error('Database initialization failed:', err.message);
  console.error('Check that PostgreSQL is running and DATABASE_URL in backend/.env is correct.');
  process.exit(1);
}

const server = createApp().listen(config.port, () => {
  console.log(`CampusBridge API running at http://localhost:${config.port}`);
  console.log(`Allowed browser origins: ${config.allowedOrigins.join(', ')}`);
});

function shutdown() {
  server.close(() => pool.end().then(() => process.exit(0)));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
