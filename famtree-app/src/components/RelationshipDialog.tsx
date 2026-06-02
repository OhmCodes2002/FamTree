import { useState } from 'react';
import type { RelationshipValue } from '../data/relationshipTypes';
import { useGraphStore } from '../store/graphStore';
import { RelationshipSelect } from './RelationshipSelect';

interface Props {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  onClose: () => void;
  onSaved: () => void;
}

export function RelationshipDialog({
  fromId,
  toId,
  fromName,
  toName,
  onClose,
  onSaved,
}: Props) {
  const addRelationship = useGraphStore((s) => s.addRelationship);
  const [relationship, setRelationship] = useState<RelationshipValue | ''>('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!relationship) return;
    addRelationship({
      from_id: fromId,
      to_id: toId,
      relationship,
      notes,
    });
    onSaved();
    onClose();
  };

  return (
    <div className="overlay overlay--center" onClick={onClose} role="presentation">
      <div className="dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dialog__header">
          <h2>Add relationship</h2>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="hint">
          <strong>{fromName}</strong> is the relationship <em>toward</em>{' '}
          <strong>{toName}</strong> (arrow: from → to).
        </p>

        <div className="form-field">
          <label htmlFor="rel-type">Relationship *</label>
          <RelationshipSelect
            id="rel-type"
            value={relationship}
            onChange={setRelationship}
          />
        </div>

        <div className="form-field">
          <label htmlFor="rel-notes">Notes</label>
          <textarea
            id="rel-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Mama's son, Chacha's daughter"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--primary" onClick={handleSave} disabled={!relationship}>
            Save link
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
