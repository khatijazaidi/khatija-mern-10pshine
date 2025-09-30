import client from '../api/client';

const isProd = import.meta.env.MODE === 'production';

/** Console in dev; ship to backend in prod. Never break UI on log failure. */
export function logInfo(message, meta = {}) {
  if (!isProd) console.info('[INFO]', message, meta);
  ship('info', message, meta);
}
export function logWarn(message, meta = {}) {
  if (!isProd) console.warn('[WARN]', message, meta);
  ship('warn', message, meta);
}
export function logError(message, meta = {}) {
  console.error('[ERROR]', message, meta);
  ship('error', message, meta);
}

async function ship(level, message, meta) {
  try {
    await client.post('/logs', {
      level,
      message,
      meta: {
        ...meta,
        path: location.pathname,
        user: safeUser(),
        ua: navigator.userAgent,
      },
    });
  } catch {
    // swallow — logging should never crash the app
  }
}

function safeUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); }
  catch { return null; }
}
