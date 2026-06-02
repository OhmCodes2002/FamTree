import { RELATIONSHIP_GROUPS, RELATIONSHIP_TYPES } from '../data/relationshipTypes';
import type { RelationshipValue } from '../data/relationshipTypes';

interface Props {
  value: RelationshipValue | '';
  onChange: (value: RelationshipValue) => void;
  id?: string;
}

export function RelationshipSelect({ value, onChange, id }: Props) {
  return (
    <select
      id={id}
      className="relationship-select"
      value={value}
      onChange={(e) => onChange(e.target.value as RelationshipValue)}
      required
    >
      <option value="" disabled>
        Choose relationship…
      </option>
      {RELATIONSHIP_GROUPS.map((group) => (
        <optgroup key={group} label={group}>
          {RELATIONSHIP_TYPES.filter((r) => r.group === group).map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
