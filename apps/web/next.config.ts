import fs from 'node:fs';
import path from 'node:path';
import type { NextConfig } from 'next';

function resolveRepoRoot(): string {
  const cwd = process.cwd();

  if (fs.existsSync(path.join(cwd, 'apps', 'web', 'package.json'))) {
    return cwd;
  }

  return path.resolve(cwd, '../..');
}

function loadRootEnv(repoRoot: string): void {
  const envPath = path.join(repoRoot, '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const rawLine of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separator = line.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

const repoRoot = resolveRepoRoot();
loadRootEnv(repoRoot);

const apiPort = process.env.API_PORT ?? '3001';
const apiOrigin = process.env.API_ORIGIN ?? `http://localhost:${apiPort}`;
const browserApiOrigin =
  process.env.NEXT_PUBLIC_API_ORIGIN ?? (process.env.NODE_ENV === 'production' ? undefined : apiOrigin);

console.log(`[web] rewrites → ${apiOrigin} (from ${path.join(repoRoot, '.env')})`);

const nextConfig: NextConfig = {
  agentRules: false,
  output: 'standalone',
  outputFileTracingRoot: repoRoot,
  env: browserApiOrigin ? { NEXT_PUBLIC_API_ORIGIN: browserApiOrigin } : {},
  async rewrites() {
    return [
      {
        source: '/socket.io',
        destination: `${apiOrigin}/socket.io`,
      },
      {
        source: '/socket.io/:path*',
        destination: `${apiOrigin}/socket.io/:path*`,
      },
      {
        source: '/api/docs',
        destination: `${apiOrigin}/docs`,
      },
      {
        source: '/api/docs/:path*',
        destination: `${apiOrigin}/docs/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${apiOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
