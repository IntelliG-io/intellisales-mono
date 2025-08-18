import type { Server } from 'http';

export function registerShutdown(server: Server, opts?: { timeoutMs?: number; log?: (msg: string, extra?: any) => void }) {
  const timeoutMs = opts?.timeoutMs ?? 10000;
  const log = opts?.log ?? (() => {});

  let shuttingDown = false;
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM'];

  async function shutdown(signal: NodeJS.Signals) {
    if (shuttingDown) return;
    shuttingDown = true;
    log('shutdown:start', { signal });

    const closePromise = new Promise<void>((resolve) => {
      server.close(() => resolve());
    });

    const timeoutPromise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(), timeoutMs);
    });

    await Promise.race([closePromise, timeoutPromise]);
    log('shutdown:complete');
  }

  signals.forEach((sig) => {
    process.on(sig, () => void shutdown(sig));
  });

  process.on('unhandledRejection', (reason) => {
    log('unhandledRejection', { reason });
  });
}
