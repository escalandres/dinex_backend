// src/config/globals.ts
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const localDirname = dirname(fileURLToPath(import.meta.url));

declare global {
    var __dirname: string;
    var TEMPLATES_PATH: string;
    var TEMP_PATH: string;
}

globalThis.__dirname = localDirname;
globalThis.TEMPLATES_PATH = join(localDirname, '..', 'templates');
globalThis.TEMP_PATH = join(localDirname, '..', 'temp');