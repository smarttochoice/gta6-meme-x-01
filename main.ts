// gta6-meme-x-01 entry: validates POST.json and hands it to the gate.
// The post itself is the entry — the GTA 6 meme on X, posted from a public
// account with make.fun mentioned and the play code in its text. This program
// only checks that the address written in POST.json is a real X status URL
// before placing the file where the gate reads it.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const botDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

let raw: string;
try {
  raw = readFileSync(join(botDir, 'POST.json'), 'utf8');
} catch {
  fail(`no POST.json found in ${botDir}`);
}

let post: unknown;
try {
  post = JSON.parse(raw);
} catch {
  fail('POST.json is not valid JSON');
}

const url = (post as { url?: unknown } | null)?.url;
if (typeof url !== 'string') {
  fail('POST.json has no "url" string');
}

const match =
  /^https:\/\/(?:x\.com|twitter\.com)\/(?:i\/web\/status\/(\d+)|([A-Za-z0-9_]+)\/status\/(\d+))$/.exec(url);
if (!match) {
  fail(`not a real X status URL: ${url}`);
}
const handle = match[2];
const statusId = match[1] ?? match[3];

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'POST.json'), raw);
console.log(
  `POST.json copied to ${outDir} — post: ${url} (status ${statusId}${handle ? `, @${handle}` : ''})`,
);
