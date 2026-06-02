import * as XLSX from 'xlsx';
import type { WorkbookData, ValidationError } from '../types/workbook';
import type { Person } from '../types/person';
import type { Relationship } from '../types/relationship';
import {
  validateWorkbook,
  validateHeaders,
  rowToPerson,
  rowToRelationship,
  PEOPLE_HEADERS,
  REL_HEADERS,
} from './validateWorkbook';

function sheetToRows(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return rows.map((row) => {
    const normalized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      normalized[String(key).trim().toLowerCase()] = value;
    }
    return normalized;
  });
}

function getHeaders(sheet: XLSX.WorkSheet): string[] {
  const ref = sheet['!ref'];
  if (!ref) return [];
  const range = XLSX.utils.decode_range(ref);
  const headers: string[] = [];
  for (let c = range.s.c; c <= range.e.c; c++) {
    const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c })];
    headers.push(cell ? String(cell.v).trim().toLowerCase() : '');
  }
  return headers;
}

export interface ImportResult {
  success: boolean;
  data?: WorkbookData;
  errors: ValidationError[];
}

export async function importExcelFile(file: File): Promise<ImportResult> {
  const errors: ValidationError[] = [];

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    return { success: false, errors: [{ sheet: 'File', message: 'Could not read file' }] };
  }

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'array' });
  } catch {
    return { success: false, errors: [{ sheet: 'File', message: 'Invalid Excel file' }] };
  }

  const peopleSheet = workbook.Sheets['People'];
  const relSheet = workbook.Sheets['Relationships'];

  if (!peopleSheet) {
    errors.push({ sheet: 'People', message: 'Sheet "People" not found' });
  }
  if (!relSheet) {
    errors.push({ sheet: 'Relationships', message: 'Sheet "Relationships" not found' });
  }
  if (errors.length > 0) {
    return { success: false, errors };
  }

  const peopleHeaders = getHeaders(peopleSheet!);
  const relHeaders = getHeaders(relSheet!);

  errors.push(...validateHeaders(peopleHeaders, PEOPLE_HEADERS.slice(0, 5), 'People'));
  errors.push(...validateHeaders(relHeaders, REL_HEADERS.slice(0, 4), 'Relationships'));

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const peopleRows = sheetToRows(peopleSheet!);
  const relRows = sheetToRows(relSheet!);

  const people: Person[] = [];
  for (let i = 0; i < peopleRows.length; i++) {
    const row = peopleRows[i];
    if (!String(row['id'] ?? '').trim() && !String(row['name'] ?? '').trim()) continue;
    const parsed = rowToPerson(row, i + 2);
    if (typeof parsed === 'object' && 'message' in parsed) {
      errors.push(parsed);
    } else {
      people.push(parsed);
    }
  }

  const relationships: Relationship[] = relRows
    .filter((row) => String(row['id'] ?? '').trim())
    .map((row) => rowToRelationship(row));

  if (errors.length > 0) {
    return { success: false, errors };
  }

  const data: WorkbookData = { people, relationships };
  const validationErrors = validateWorkbook(data);
  if (validationErrors.length > 0) {
    return { success: false, errors: validationErrors };
  }

  return { success: true, data, errors: [] };
}
