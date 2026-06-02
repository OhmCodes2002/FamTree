import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { importExcelFile } from '../services/excelImport';
import { useGraphStore } from '../store/graphStore';
import type { ValidationError } from '../types/workbook';

export function ImportScreen() {
  const navigate = useNavigate();
  const loadWorkbook = useGraphStore((s) => s.loadWorkbook);
  const inputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    setErrors([]);
    const result = await importExcelFile(file);
    setLoading(false);
    if (result.success && result.data) {
      loadWorkbook(result.data, file.name);
      navigate('/tree');
    } else {
      setErrors(result.errors);
    }
  };

  return (
    <div className="app-shell import-screen">
      <div className="import-screen__emblem" aria-hidden>
        🌳
      </div>
      <h1 className="import-screen__title">Famtree</h1>
      <p className="import-screen__subtitle">
        Import your family Excel workbook to explore your tree. Data stays on your device.
      </p>

      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />

      <button
        type="button"
        className="btn btn--primary"
        disabled={loading}
        onClick={() => inputRef.current?.click()}
      >
        {loading ? 'Reading…' : 'Select Excel file'}
      </button>

      <a className="btn btn--secondary" href="/templates/famtree-template.xlsx" download="famtree-template.xlsx">
        Download template
      </a>

      {errors.length > 0 ? (
        <div className="error-list" role="alert">
          <strong>Could not import:</strong>
          <ul>
            {errors.map((err, i) => (
              <li key={`${err.sheet}-${err.row}-${i}`}>
                {err.sheet}
                {err.row != null ? ` row ${err.row}` : ''}: {err.message}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <p className="hint" style={{ maxWidth: '22rem' }}>
        Sheets required: <strong>People</strong> and <strong>Relationships</strong>. Edge rule: from
        person is the relationship toward to (e.g. father → child).
      </p>
    </div>
  );
}
