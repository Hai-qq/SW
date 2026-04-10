import { execSync } from 'node:child_process';

export function resetDatabase() {
  execSync('npm run prisma:seed', {
    cwd: process.cwd(),
    stdio: 'ignore',
  });
}
