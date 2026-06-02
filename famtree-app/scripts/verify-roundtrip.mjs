/**
 * Verifies Excel template structure (run: node scripts/verify-roundtrip.mjs)
 */
import * as XLSX from 'xlsx';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const path = join(dir, '..', 'public', 'templates', 'famtree-template.xlsx');
const wb = XLSX.read(readFileSync(path));
const people = XLSX.utils.sheet_to_json(wb.Sheets['People']);
const rels = XLSX.utils.sheet_to_json(wb.Sheets['Relationships']);

if (people.length < 1 || rels.length < 1) {
  console.error('Template missing sample rows');
  process.exit(1);
}
console.log(`OK: ${people.length} people, ${rels.length} relationships in template`);
