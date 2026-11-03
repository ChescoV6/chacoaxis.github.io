import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = resolve(__dirname, '../../backend/src/main/resources/data');
const target = resolve(__dirname, 'data');

if (!existsSync(join(source, 'axes.json'))) {
  console.error(`Backend data not found at ${source}`);
  process.exit(1);
}

rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(source, target, { recursive: true });
console.log(`Synced backend data to ${target}`);
