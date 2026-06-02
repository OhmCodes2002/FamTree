import { isValidRelationshipValue } from '../data/relationshipTypes';
import type { Person, LifeStatus } from '../types/person';
import type { Relationship } from '../types/relationship';
import type { ValidationError, WorkbookData } from '../types/workbook';

const PEOPLE_HEADERS = [
  'id',
  'name',
  'village',
  'current_address',
  'life_status',
  'notes',
  'pos_x',
  'pos_y',
] as const;

const REL_HEADERS = ['id', 'from_id', 'to_id', 'relationship', 'notes'] as const;

export function validateHeaders(
  headers: string[],
  required: readonly string[],
  sheet: string,
): ValidationError[] {
  const normalized = headers.map((h) => String(h).trim().toLowerCase());
  const missing = required.filter((col) => !normalized.includes(col));
  return missing.map((col) => ({
    sheet,
    message: `Missing required column "${col}"`,
  }));
}

function parseLifeStatus(raw: string, row: number): LifeStatus | ValidationError {
  const v = raw.trim().toLowerCase();
  if (v === 'alive' || v === 'dead') return v;
  return { sheet: 'People', row, message: `Invalid life_status "${raw}" (use alive or dead)` };
}

export function validateWorkbook(data: WorkbookData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.people.length > 500) {
    errors.push({
      sheet: 'People',
      message: `Too many people (${data.people.length}). Maximum is 500.`,
    });
  }

  const personIds = new Set<string>();
  for (let i = 0; i < data.people.length; i++) {
    const p = data.people[i];
    const row = i + 2;
    if (!p.id?.trim()) {
      errors.push({ sheet: 'People', row, message: 'Missing id' });
      continue;
    }
    if (personIds.has(p.id)) {
      errors.push({ sheet: 'People', row, message: `Duplicate person id "${p.id}"` });
    }
    personIds.add(p.id);
    if (!p.name?.trim()) {
      errors.push({ sheet: 'People', row, message: 'Missing name' });
    }
    if (!p.life_status) {
      errors.push({ sheet: 'People', row, message: 'Missing life_status' });
    } else if (p.life_status !== 'alive' && p.life_status !== 'dead') {
      errors.push({ sheet: 'People', row, message: `Invalid life_status "${p.life_status}"` });
    }
  }

  const relIds = new Set<string>();
  for (let i = 0; i < data.relationships.length; i++) {
    const r = data.relationships[i];
    const row = i + 2;
    if (!r.id?.trim()) {
      errors.push({ sheet: 'Relationships', row, message: 'Missing id' });
      continue;
    }
    if (relIds.has(r.id)) {
      errors.push({ sheet: 'Relationships', row, message: `Duplicate relationship id "${r.id}"` });
    }
    relIds.add(r.id);
    if (!r.from_id?.trim() || !r.to_id?.trim()) {
      errors.push({ sheet: 'Relationships', row, message: 'Missing from_id or to_id' });
    } else if (r.from_id === r.to_id) {
      errors.push({ sheet: 'Relationships', row, message: 'from_id and to_id cannot be the same' });
    } else {
      if (!personIds.has(r.from_id)) {
        errors.push({
          sheet: 'Relationships',
          row,
          message: `from_id "${r.from_id}" not found in People`,
        });
      }
      if (!personIds.has(r.to_id)) {
        errors.push({
          sheet: 'Relationships',
          row,
          message: `to_id "${r.to_id}" not found in People`,
        });
      }
    }
    if (!r.relationship?.trim()) {
      errors.push({ sheet: 'Relationships', row, message: 'Missing relationship' });
    } else if (!isValidRelationshipValue(r.relationship.trim())) {
      errors.push({
        sheet: 'Relationships',
        row,
        message: `Unknown relationship "${r.relationship}"`,
      });
    }
  }

  return errors;
}

export function rowToPerson(row: Record<string, unknown>, rowNum: number): Person | ValidationError {
  const get = (key: string) => String(row[key] ?? '').trim();
  const life = parseLifeStatus(get('life_status'), rowNum);
  if (typeof life === 'object') return life;

  const posX = get('pos_x');
  const posY = get('pos_y');

  return {
    id: get('id'),
    name: get('name'),
    village: get('village'),
    current_address: get('current_address'),
    life_status: life,
    notes: get('notes'),
    ...(posX && !Number.isNaN(Number(posX)) ? { pos_x: Number(posX) } : {}),
    ...(posY && !Number.isNaN(Number(posY)) ? { pos_y: Number(posY) } : {}),
  };
}

export function rowToRelationship(row: Record<string, unknown>): Relationship {
  const get = (key: string) => String(row[key] ?? '').trim();
  return {
    id: get('id'),
    from_id: get('from_id'),
    to_id: get('to_id'),
    relationship: get('relationship') as Relationship['relationship'],
    notes: get('notes'),
  };
}

export { PEOPLE_HEADERS, REL_HEADERS };
