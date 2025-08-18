import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

// Augment DATABASE_URL with pooling params if provided via env
function augmentDatabaseUrlWithPooling() {
  const urlStr = process.env.DATABASE_URL;
  if (!urlStr) return;
  try {
    const url = new URL(urlStr);
    const params = url.searchParams;
    let changed = false;

    const connLimit = process.env.PRISMA_CONNECTION_LIMIT;
    const poolTimeout = process.env.PRISMA_POOL_TIMEOUT;

    if (connLimit && !params.has('connection_limit')) {
      params.set('connection_limit', connLimit);
      changed = true;
    }
    if (poolTimeout && !params.has('pool_timeout')) {
      params.set('pool_timeout', poolTimeout);
      changed = true;
    }
    if (changed) {
      url.search = params.toString();
      process.env.DATABASE_URL = url.toString();
    }
  } catch {
    // Ignore URL parse errors; fall back to original string
  }
}

const isProd = process.env.NODE_ENV === 'production';
const isDev = !isProd;

augmentDatabaseUrlWithPooling();

// Configure logging (verbose in dev). For query event logging we must use emit: 'event'.
const logConfig: (Prisma.LogLevel | Prisma.LogDefinition)[] =
  (isDev && process.env.PRISMA_LOG_QUERIES !== '0')
    ? ([{ level: 'query', emit: 'event' }, 'info', 'warn', 'error'])
    : (['warn', 'error']);

// Singleton PrismaClient
export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ log: logConfig });

// In dev, reuse the same instance across HMR reloads
if (isDev) globalForPrisma.prisma = prisma;

// Optional verbose query logging in development
if (isDev && process.env.PRISMA_LOG_QUERIES !== '0') {
  // eslint-disable-next-line no-console
  (prisma as any).$on('query', (e: Prisma.QueryEvent) =>
    console.log(`[prisma] ${e.duration}ms ${e.query}`)
  );
}

// Connect with retry to handle transient DB startup issues
async function connectWithRetry(maxRetries = 5, initialDelayMs = 500) {
  let attempt = 0;
  let delay = initialDelayMs;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      await prisma.$connect();
      return;
    } catch (err) {
      attempt += 1;
      if (attempt > maxRetries) {
        // eslint-disable-next-line no-console
        console.error('[prisma] Failed to connect after retries:', err);
        throw err;
      }
      // eslint-disable-next-line no-console
      console.warn(`[prisma] Connect failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`);
      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(delay * 2, 5000); // exponential backoff, cap at 5s
    }
  }
}

// Establish connection eagerly in production, lazily ok in dev
if (isProd) {
  void connectWithRetry();
}

// Graceful shutdown
let shutdownRegistered = false;
function registerShutdown() {
  if (shutdownRegistered) return;
  shutdownRegistered = true;

  const shutdown = async (signal: string) => {
    // eslint-disable-next-line no-console
    console.log(`[prisma] ${signal} received. Disconnecting...`);
    try {
      await prisma.$disconnect();
      // eslint-disable-next-line no-console
      console.log('[prisma] Disconnected. Exiting.');
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[prisma] Error during disconnect:', err);
    } finally {
      process.exit(0);
    }
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('uncaughtException', (err) => {
    // eslint-disable-next-line no-console
    console.error('[prisma] Uncaught exception:', err);
    void shutdown('uncaughtException');
  });
  process.on('unhandledRejection', (reason) => {
    // eslint-disable-next-line no-console
    console.error('[prisma] Unhandled rejection:', reason);
    void shutdown('unhandledRejection');
  });

  // Note: Prisma 5 library engine no longer supports the `$on('beforeExit')` hook.
  // We rely on process-level signals registered above for graceful shutdown in Node.
}

registerShutdown();

export default prisma;
