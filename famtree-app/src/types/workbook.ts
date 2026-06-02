import type { Person } from './person';
import type { Relationship } from './relationship';

export interface WorkbookData {
  people: Person[];
  relationships: Relationship[];
}

export interface ValidationError {
  sheet: string;
  row?: number;
  message: string;
}
