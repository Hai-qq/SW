import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadBackendEnv } from '../src/common/load-backend-env';

describe('backend env loading', () => {
  it('falls back to .env.example when .env is missing', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sw-env-'));
    const envExamplePath = path.join(tempDir, '.env.example');

    fs.writeFileSync(
      envExamplePath,
      'DATABASE_URL=postgresql://sw:sw@localhost:5434/sw?schema=public\nALLOW_TEST_AUTH=true\n',
      'utf8',
    );

    const oldDatabaseUrl = process.env.DATABASE_URL;
    const oldAllowTestAuth = process.env.ALLOW_TEST_AUTH;

    delete process.env.DATABASE_URL;
    delete process.env.ALLOW_TEST_AUTH;

    loadBackendEnv(tempDir);

    expect(process.env.DATABASE_URL).toBe(
      'postgresql://sw:sw@localhost:5434/sw?schema=public',
    );
    expect(process.env.ALLOW_TEST_AUTH).toBe('true');

    if (oldDatabaseUrl === undefined) {
      delete process.env.DATABASE_URL;
    } else {
      process.env.DATABASE_URL = oldDatabaseUrl;
    }

    if (oldAllowTestAuth === undefined) {
      delete process.env.ALLOW_TEST_AUTH;
    } else {
      process.env.ALLOW_TEST_AUTH = oldAllowTestAuth;
    }

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
