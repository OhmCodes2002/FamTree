import * as XLSX from 'xlsx';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'templates');

const people = [
  {
    id: 'p_001',
    name: 'Ramesh Kumar',
    village: 'Rampur',
    current_address: '12 Main Road, Rampur, UP 244901',
    life_status: 'alive',
    notes: '',
    pos_x: 100,
    pos_y: 80,
  },
  {
    id: 'p_002',
    name: 'Sita Devi',
    village: 'Rampur',
    current_address: '12 Main Road, Rampur, UP 244901',
    life_status: 'alive',
    notes: '',
    pos_x: 320,
    pos_y: 80,
  },
  {
    id: 'p_003',
    name: 'Govind Kumar',
    village: 'Rampur',
    current_address: 'Flat 4B, Sector 12, Noida, UP',
    life_status: 'alive',
    notes: '',
    pos_x: 210,
    pos_y: 220,
  },
];

const relationships = [
  { id: 'r_001', from_id: 'p_001', to_id: 'p_003', relationship: 'father', notes: '' },
  { id: 'r_002', from_id: 'p_002', to_id: 'p_003', relationship: 'mother', notes: '' },
  { id: 'r_003', from_id: 'p_001', to_id: 'p_002', relationship: 'husband', notes: '' },
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(people), 'People');
XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(relationships), 'Relationships');

const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, 'famtree-template.xlsx'), buffer);
console.log('Wrote public/templates/famtree-template.xlsx');
