export const RELATIONSHIP_TYPES = [
  { value: 'father', label: 'Father (Pita)', group: 'Parents' },
  { value: 'mother', label: 'Mother (Mata)', group: 'Parents' },
  { value: 'son', label: 'Son (Putra)', group: 'Children' },
  { value: 'daughter', label: 'Daughter (Putri)', group: 'Children' },
  { value: 'husband', label: 'Husband (Pati)', group: 'Spouse' },
  { value: 'wife', label: 'Wife (Patni)', group: 'Spouse' },
  { value: 'brother', label: 'Brother (Bhai)', group: 'Siblings' },
  { value: 'sister', label: 'Sister (Behen)', group: 'Siblings' },
  { value: 'elder_brother', label: 'Elder Brother (Bade Bhai)', group: 'Siblings' },
  { value: 'younger_brother', label: 'Younger Brother (Chhote Bhai)', group: 'Siblings' },
  { value: 'elder_sister', label: 'Elder Sister (Badi Behen)', group: 'Siblings' },
  { value: 'younger_sister', label: 'Younger Sister (Chhoti Behen)', group: 'Siblings' },
  { value: 'paternal_grandfather', label: 'Paternal Grandfather (Dada)', group: 'Grandparents' },
  { value: 'paternal_grandmother', label: 'Paternal Grandmother (Dadi)', group: 'Grandparents' },
  { value: 'maternal_grandfather', label: 'Maternal Grandfather (Nana)', group: 'Grandparents' },
  { value: 'maternal_grandmother', label: 'Maternal Grandmother (Nani)', group: 'Grandparents' },
  { value: 'fathers_brother', label: "Father's Brother (Chacha)", group: 'Uncles & Aunts' },
  { value: 'fathers_brothers_wife', label: "Father's Brother's Wife (Chachi)", group: 'Uncles & Aunts' },
  { value: 'fathers_sister', label: "Father's Sister (Bua)", group: 'Uncles & Aunts' },
  { value: 'mothers_brother', label: "Mother's Brother (Mama)", group: 'Uncles & Aunts' },
  { value: 'mothers_sister', label: "Mother's Sister (Masi)", group: 'Uncles & Aunts' },
  { value: 'father_in_law', label: 'Father-in-law', group: 'In-laws' },
  { value: 'mother_in_law', label: 'Mother-in-law', group: 'In-laws' },
  { value: 'son_in_law', label: 'Son-in-law', group: 'In-laws' },
  { value: 'daughter_in_law', label: 'Daughter-in-law', group: 'In-laws' },
  { value: 'brother_in_law', label: 'Brother-in-law', group: 'In-laws' },
  { value: 'sister_in_law', label: 'Sister-in-law', group: 'In-laws' },
  { value: 'grandson', label: 'Grandson', group: 'Extended' },
  { value: 'granddaughter', label: 'Granddaughter', group: 'Extended' },
  { value: 'nephew', label: 'Nephew (Bhatija/Bhatiji)', group: 'Extended' },
  { value: 'niece', label: 'Niece', group: 'Extended' },
  { value: 'cousin', label: 'Cousin', group: 'Extended' },
] as const;

export type RelationshipValue = (typeof RELATIONSHIP_TYPES)[number]['value'];

const valueSet = new Set<string>(RELATIONSHIP_TYPES.map((r) => r.value));

export function isValidRelationshipValue(value: string): value is RelationshipValue {
  return valueSet.has(value);
}

export function getRelationshipLabel(value: string): string {
  const found = RELATIONSHIP_TYPES.find((r) => r.value === value);
  return found?.label ?? value;
}

export const RELATIONSHIP_GROUPS = [...new Set(RELATIONSHIP_TYPES.map((r) => r.group))];
