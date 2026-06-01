import { neon } from '@neondatabase/serverless';

const VALID_KEYS = new Set(['hero', 'portfolio', 'projetos']);
let sqlClient;
let schemaReady;

function getSql() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não configurada.');
  }
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL);
  return sqlClient;
}

async function ensureSchema() {
  if (!schemaReady) {
    const sql = getSql();
    schemaReady = sql`
      CREATE TABLE IF NOT EXISTS bali_content (
        key text PRIMARY KEY,
        content jsonb NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `;
  }
  return schemaReady;
}

function parseJsonValue(value) {
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return value; }
  }
  return value;
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  return text ? JSON.parse(text) : {};
}

function requireAdmin(req) {
  const configuredPassword = process.env.BALI_ADMIN_PASSWORD || 'bali2026';
  const suppliedPassword = req.headers['x-bali-admin-password'];
  return typeof suppliedPassword === 'string' && suppliedPassword === configuredPassword;
}

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  try {
    await ensureSchema();
    const sql = getSql();

    if (req.method === 'GET') {
      const rows = await sql`SELECT key, content FROM bali_content`;
      const payload = { hero: null, portfolio: null, projetos: null };
      for (const row of rows) {
        if (VALID_KEYS.has(row.key)) payload[row.key] = parseJsonValue(row.content);
      }
      sendJson(res, 200, payload);
      return;
    }

    if (!requireAdmin(req)) {
      sendJson(res, 401, { error: 'Senha do admin inválida.' });
      return;
    }

    if (req.method === 'POST') {
      const body = await readBody(req);
      if (!VALID_KEYS.has(body.key)) {
        sendJson(res, 400, { error: 'Chave inválida.' });
        return;
      }

      await sql`
        INSERT INTO bali_content (key, content, updated_at)
        VALUES (${body.key}, ${JSON.stringify(body.value)}::jsonb, now())
        ON CONFLICT (key)
        DO UPDATE SET content = EXCLUDED.content, updated_at = now()
      `;
      sendJson(res, 200, { ok: true });
      return;
    }

    if (req.method === 'DELETE') {
      const url = new URL(req.url, 'https://local.bali');
      const key = url.searchParams.get('key');
      if (!VALID_KEYS.has(key)) {
        sendJson(res, 400, { error: 'Chave inválida.' });
        return;
      }
      await sql`DELETE FROM bali_content WHERE key = ${key}`;
      sendJson(res, 200, { ok: true });
      return;
    }

    res.setHeader('Allow', 'GET, POST, DELETE');
    sendJson(res, 405, { error: 'Método não permitido.' });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: err.message || 'Erro interno.' });
  }
}
