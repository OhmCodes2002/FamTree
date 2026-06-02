import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { Person } from '../types/person';

export type PersonNodeData = {
  person: Person;
  selected?: boolean;
  linkCandidate?: boolean;
};

function PersonNodeComponent({ data }: NodeProps) {
  const { person, selected, linkCandidate } = data as PersonNodeData;
  const isDead = person.life_status === 'dead';

  return (
    <div
      className={[
        'person-node',
        isDead ? 'person-node--dead' : '',
        selected ? 'person-node--selected' : '',
        linkCandidate ? 'person-node--link-candidate' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0.3 }} />
      <p className="person-node__name">{person.name || 'Unnamed'}</p>
      {person.village ? <p className="person-node__meta">{person.village}</p> : null}
      <span className="person-node__badge">{isDead ? 'Remembered' : 'Living'}</span>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0.3 }} />
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
