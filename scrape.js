// CLI: node scrape.js  (mismo motor que usan el cron y el botón del panel)
import { correrTodo } from './lib/scraping.js';

const reporte = await correrTodo();

for (const r of reporte) {
  console.log(
    r.ok
      ? `✓ ${r.fuente.padEnd(14)} ${r.encontradas} promos · ${r.nuevas} nuevas · ${r.archivadas} archivadas`
      : `✗ ${r.fuente.padEnd(14)} ${r.error}`
  );
}

process.exit(reporte.some((r) => !r.ok) ? 1 : 0);
