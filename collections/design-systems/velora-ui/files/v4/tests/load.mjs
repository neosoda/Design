/* Loads Velora's pure modules into an isolated Node context (no DOM). */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export function loadVelora(storage) {
  const ctx = { console, Intl, Math, JSON, Date, setTimeout, clearTimeout };
  if (storage) ctx.localStorage = storage;
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of ['core/velora-tokens.js', 'core/velora-core.js', 'components/velora-command.js', 'components/velora-table.js', 'components/velora-dashboard.js', 'studio/velora-studio.js']) {
    vm.runInContext(readFileSync(join(ROOT, f), 'utf8'), ctx, { filename: f });
  }
  return ctx.Velora;
}
