import dotenv from 'dotenv';
// Prefer root .env, fallback to local
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '../.env' });
import { createServer } from 'http';
import app from './app';

const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 4000);

const server = createServer(app);

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running on http://localhost:${PORT}`);
});
