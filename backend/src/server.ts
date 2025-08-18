import dotenv from 'dotenv';
// Prefer root .env, fallback to local
dotenv.config({ path: process.env.DOTENV_CONFIG_PATH || '../.env' });
import { createServer } from 'http';
import app from './app';
import { getServerEnv } from './config/env';
import { registerShutdown } from './utils/shutdown';

const env = getServerEnv();

app.set('trust proxy', env.TRUST_PROXY);

const server = createServer(app);

server.listen(env.PORT, env.HOST, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://${env.HOST}:${env.PORT}`);
});

registerShutdown(server, {
  timeoutMs: 10000,
  log: (msg, extra) => {
    // eslint-disable-next-line no-console
    console.log(`[server] ${msg}`, extra || '');
  },
});
