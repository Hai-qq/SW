import fs from 'node:fs';
import path from 'node:path';

function applyEnvFile(filePath: string) {
  const envText = fs.readFileSync(filePath, 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

export function loadBackendEnv(baseDir = process.cwd()) {
  const candidates = [
    path.resolve(baseDir, '.env'),
    path.resolve(baseDir, '.env.example'),
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) {
      applyEnvFile(filePath);
      return filePath;
    }
  }

  return null;
}
