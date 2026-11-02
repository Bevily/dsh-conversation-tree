import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';

await mkdir('dist', { recursive: true });
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'pack', '--json', '--pack-destination', 'dist'], { encoding: 'utf8' });
if (result.status !== 0) throw new Error(result.stderr || 'npm pack failed');
const [pack] = JSON.parse(result.stdout);
const allowed = /^(?:package\.json|index\.js|client\.js|cordis\.patch\.yml|icon\.svg|README\.md|LICENSE|CHANGELOG\.md|src\/host\/[a-z-]+\.js|docs\/validation\.md|docs\/images\/[a-z-]+\.png)$/;
for (const { path } of pack.files) {
  if (!allowed.test(path)) throw new Error(`Unexpected file in release package: ${path}`);
}
for (const path of ['package.json', 'index.js', 'client.js', 'cordis.patch.yml', 'icon.svg', 'README.md', 'LICENSE', 'src/host/events.js', 'src/host/service.js', 'src/host/state.js']) {
  if (!pack.files.some(file => file.path === path)) throw new Error(`Missing runtime file: ${path}`);
}
const bytes = await readFile(`dist/${pack.filename}`);
const digest = createHash('sha256').update(bytes).digest('hex');
await writeFile('dist/SHA256SUMS', `${digest}  ${pack.filename}\n`);
console.log(`dist/${pack.filename} (${pack.files.length} files, ${bytes.length} bytes)`);
console.log(`SHA256 ${digest}`);
