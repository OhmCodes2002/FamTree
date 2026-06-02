import type { RelationshipValue } from '../data/relationshipTypes';

export interface Relationship {
  id: string;
  from_id: string;
  to_id: string;
  relationship: RelationshipValue;
  notes: string;
}
