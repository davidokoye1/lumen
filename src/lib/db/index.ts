import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { migrations } from "./migrations";

/**
 * SQLite via Node's built-in `node:sqlite` module (Node 22.13+), so there is
 * no native package to compile on install.
 */
type SQLValue = null | number | bigint | string | Uint8Array;

export type Statement = {
  run: (...params: unknown[]) => { changes: number; lastInsertRowid: number | bigint };
  get: (...params: unknown[]) => unknown;
  all: (...params: unknown[]) => unknown[];
};

export type DB = {
  exec: (sql: string) => void;
  prepare: (sql: string) => Statement;
  raw: DatabaseSync;
};

const globalForDb = globalThis as unknown as { __lumenDb?: DB; __lumenTxDepth?: number };

function resolveDbPath() {
  const configured = process.env.DATABASE_PATH ?? "./data/lumen.db";
  return path.isAbsolute(configured) ? configured : path.join(/*turbopackIgnore: true*/ process.cwd(), configured);
}

/** node:sqlite rejects `undefined` and booleans; normalise them like other drivers do. */
function bind(params: unknown[]): SQLValue[] {
  return params.map((p) => (p === undefined ? null : typeof p === "boolean" ? (p ? 1 : 0) : (p as SQLValue)));
}

function wrap(raw: DatabaseSync): DB {
  const cache = new Map<string, ReturnType<DatabaseSync["prepare"]>>();
  return {
    raw,
    exec: (sql) => raw.exec(sql),
    prepare(sql) {
      let stmt = cache.get(sql);
      if (!stmt) {
        stmt = raw.prepare(sql);
        cache.set(sql, stmt);
      }
      const s = stmt;
      return {
        run: (...params) => {
          const r = s.run(...bind(params));
          return { changes: Number(r.changes), lastInsertRowid: r.lastInsertRowid };
        },
        get: (...params) => s.get(...bind(params)),
        all: (...params) => s.all(...bind(params)),
      };
    },
  };
}

function migrate(db: DB) {
  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (id INTEGER PRIMARY KEY, name TEXT NOT NULL, applied_at TEXT NOT NULL)`);
  const applied = new Set((db.prepare("SELECT id FROM _migrations").all() as { id: number }[]).map((r) => r.id));
  for (const m of migrations) {
    if (applied.has(m.id)) continue;
    runInTransaction(db, () => {
      db.exec(m.sql);
      db.prepare("INSERT INTO _migrations (id, name, applied_at) VALUES (?, ?, ?)").run(m.id, m.name, new Date().toISOString());
    });
  }
}

function open(): DB {
  const file = resolveDbPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = wrap(new DatabaseSync(file));
  db.exec("PRAGMA journal_mode = WAL");
  db.exec("PRAGMA foreign_keys = ON");
  db.exec("PRAGMA busy_timeout = 5000");
  db.exec("PRAGMA synchronous = NORMAL");
  migrate(db);
  return db;
}

export function getDb(): DB {
  if (!globalForDb.__lumenDb) globalForDb.__lumenDb = open();
  return globalForDb.__lumenDb;
}

/** Synchronous transaction; nested calls become savepoints. */
function runInTransaction<T>(db: DB, fn: () => T): T {
  const depth = globalForDb.__lumenTxDepth ?? 0;
  const sp = `sp_${depth}`;
  db.exec(depth === 0 ? "BEGIN IMMEDIATE" : `SAVEPOINT ${sp}`);
  globalForDb.__lumenTxDepth = depth + 1;
  try {
    const result = fn();
    db.exec(depth === 0 ? "COMMIT" : `RELEASE ${sp}`);
    return result;
  } catch (e) {
    db.exec(depth === 0 ? "ROLLBACK" : `ROLLBACK TO ${sp}; RELEASE ${sp}`);
    throw e;
  } finally {
    globalForDb.__lumenTxDepth = depth;
  }
}

export function tx<T>(fn: () => T): T {
  return runInTransaction(getDb(), fn);
}
