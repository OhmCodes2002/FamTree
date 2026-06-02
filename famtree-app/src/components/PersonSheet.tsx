import { useEffect, useState } from 'react';
import type { Person, LifeStatus } from '../types/person';
import { useGraphStore } from '../store/graphStore';

interface Props {
  person: Person | null;
  onClose: () => void;
  isNew?: boolean;
}

const emptyPerson = (): Omit<Person, 'id'> => ({
  name: '',
  village: '',
  current_address: '',
  life_status: 'alive',
  notes: '',
});

export function PersonSheet({ person, onClose, isNew }: Props) {
  const addPerson = useGraphStore((s) => s.addPerson);
  const updatePerson = useGraphStore((s) => s.updatePerson);
  const removePerson = useGraphStore((s) => s.removePerson);
  const relationships = useGraphStore((s) => s.relationships);

  const [form, setForm] = useState(emptyPerson());

  useEffect(() => {
    if (person && !isNew) {
      setForm({
        name: person.name,
        village: person.village,
        current_address: person.current_address,
        life_status: person.life_status,
        notes: person.notes,
      });
    } else if (isNew) {
      setForm(emptyPerson());
    }
  }, [person, isNew]);

  if (!person && !isNew) return null;

  const edgeCount = person
    ? relationships.filter((r) => r.from_id === person.id || r.to_id === person.id).length
    : 0;

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (isNew) {
      addPerson(form);
      onClose();
    } else if (person) {
      updatePerson(person.id, form);
      onClose();
    }
  };

  const handleDelete = () => {
    if (!person) return;
    const msg =
      edgeCount > 0
        ? `Remove ${person.name} and ${edgeCount} relationship(s)?`
        : `Remove ${person.name}?`;
    if (window.confirm(msg)) {
      removePerson(person.id);
      onClose();
    }
  };

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="sheet__header">
          <h2>{isNew ? 'Add person' : 'Edit person'}</h2>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="form-field">
          <label htmlFor="person-name">Name *</label>
          <input
            id="person-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Full name"
          />
        </div>

        <div className="form-field">
          <label htmlFor="person-village">Village</label>
          <input
            id="person-village"
            value={form.village}
            onChange={(e) => setForm({ ...form, village: e.target.value })}
            placeholder="Village or hometown"
          />
        </div>

        <div className="form-field">
          <label htmlFor="person-address">Current address</label>
          <textarea
            id="person-address"
            value={form.current_address}
            onChange={(e) => setForm({ ...form, current_address: e.target.value })}
            placeholder="Street, city, state, PIN — full address"
          />
        </div>

        <div className="form-field">
          <label htmlFor="person-status">Life status *</label>
          <select
            id="person-status"
            value={form.life_status}
            onChange={(e) => setForm({ ...form, life_status: e.target.value as LifeStatus })}
          >
            <option value="alive">Living</option>
            <option value="dead">Remembered (deceased)</option>
          </select>
        </div>

        <div className="form-field">
          <label htmlFor="person-notes">Notes</label>
          <textarea
            id="person-notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Optional notes"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn--primary" onClick={handleSave}>
            Save
          </button>
          {!isNew && person ? (
            <button type="button" className="btn btn--danger" onClick={handleDelete}>
              Remove
            </button>
          ) : null}
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
