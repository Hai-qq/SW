import { execSync } from 'node:child_process';
import { loadBackendEnv } from '../src/common/load-backend-env';

export function resetDatabase() {
  loadBackendEnv(process.cwd());

  execSync('npx prisma migrate reset --force --skip-generate --skip-seed', {
    cwd: process.cwd(),
    stdio: 'ignore',
    env: process.env,
  });

  execSync('npm run prisma:seed', {
    cwd: process.cwd(),
    stdio: 'ignore',
    env: process.env,
  });
}
