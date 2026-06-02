import { create } from 'zustand';
import type { Person } from '../types/person';
import type { Relationship } from '../types/relationship';
import type { WorkbookData } from '../types/workbook';
import { newPersonId, newRelationshipId } from '../utils/id';

interface GraphState {
  loaded: boolean;
  sourceFileName: string;
  people: Person[];
  relationships: Relationship[];
  loadWorkbook: (data: WorkbookData, fileName: string) => void;
  clear: () => void;
  addPerson: (person: Omit<Person, 'id'> & { id?: string }) => Person;
  updatePerson: (id: string, patch: Partial<Person>) => void;
  removePerson: (id: string) => void;
  addRelationship: (rel: Omit<Relationship, 'id'> & { id?: string }) => Relationship;
  removeRelationship: (id: string) => void;
  updatePositions: (positions: Record<string, { x: number; y: number }>) => void;
  getWorkbookData: () => WorkbookData;
}

const initialState = {
  loaded: false,
  sourceFileName: '',
  people: [] as Person[],
  relationships: [] as Relationship[],
};

export const useGraphStore = create<GraphState>((set, get) => ({
  ...initialState,

  loadWorkbook: (data, fileName) => {
    set({
      loaded: true,
      sourceFileName: fileName,
      people: data.people,
      relationships: data.relationships,
    });
  },

  clear: () => set({ ...initialState }),

  addPerson: (person) => {
    const newPerson: Person = {
      id: person.id ?? newPersonId(),
      name: person.name,
      village: person.village ?? '',
      current_address: person.current_address ?? '',
      life_status: person.life_status,
      notes: person.notes ?? '',
      pos_x: person.pos_x,
      pos_y: person.pos_y,
    };
    set((s) => ({ people: [...s.people, newPerson] }));
    return newPerson;
  },

  updatePerson: (id, patch) => {
    set((s) => ({
      people: s.people.map((p) => (p.id === id ? { ...p, ...patch, id: p.id } : p)),
    }));
  },

  removePerson: (id) => {
    set((s) => ({
      people: s.people.filter((p) => p.id !== id),
      relationships: s.relationships.filter((r) => r.from_id !== id && r.to_id !== id),
    }));
  },

  addRelationship: (rel) => {
    const newRel: Relationship = {
      id: rel.id ?? newRelationshipId(),
      from_id: rel.from_id,
      to_id: rel.to_id,
      relationship: rel.relationship,
      notes: rel.notes ?? '',
    };
    set((s) => ({ relationships: [...s.relationships, newRel] }));
    return newRel;
  },

  removeRelationship: (id) => {
    set((s) => ({
      relationships: s.relationships.filter((r) => r.id !== id),
    }));
  },

  updatePositions: (positions) => {
    set((s) => ({
      people: s.people.map((p) => {
        const pos = positions[p.id];
        if (!pos) return p;
        return { ...p, pos_x: pos.x, pos_y: pos.y };
      }),
    }));
  },

  getWorkbookData: () => {
    const { people, relationships } = get();
    return { people, relationships };
  },
}));
