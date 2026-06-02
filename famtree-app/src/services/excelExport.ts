import * as XLSX from 'xlsx';
import type { WorkbookData } from '../types/workbook';

export function exportToExcelBlob(data: WorkbookData): Blob {
  const peopleRows = data.people.map((p) => ({
    id: p.id,
    name: p.name,
    village: p.village,
    current_address: p.current_address,
    life_status: p.life_status,
    notes: p.notes,
    pos_x: p.pos_x ?? '',
    pos_y: p.pos_y ?? '',
  }));

  const relRows = data.relationships.map((r) => ({
    id: r.id,
    from_id: r.from_id,
    to_id: r.to_id,
    relationship: r.relationship,
    notes: r.notes,
  }));

  const wb = XLSX.utils.book_new();
  const peopleSheet = XLSX.utils.json_to_sheet(peopleRows);
  const relSheet = XLSX.utils.json_to_sheet(relRows);
  XLSX.utils.book_append_sheet(wb, peopleSheet, 'People');
  XLSX.utils.book_append_sheet(wb, relSheet, 'Relationships');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function buildSampleWorkbook(): WorkbookData {
  return {
    people: [
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
    ],
    relationships: [
      {
        id: 'r_001',
        from_id: 'p_001',
        to_id: 'p_003',
        relationship: 'father',
        notes: '',
      },
      {
        id: 'r_002',
        from_id: 'p_002',
        to_id: 'p_003',
        relationship: 'mother',
        notes: '',
      },
      {
        id: 'r_003',
        from_id: 'p_001',
        to_id: 'p_002',
        relationship: 'husband',
        notes: '',
      },
    ],
  };
}
