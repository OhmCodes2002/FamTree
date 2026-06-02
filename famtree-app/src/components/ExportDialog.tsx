import { useState } from 'react';
import { exportToExcelBlob } from '../services/excelExport';
import { useGraphStore } from '../store/graphStore';
import { defaultExportFilename, downloadBlob, sanitizeFilename } from '../utils/download';

interface Props {
  onClose: () => void;
}

export function ExportDialog({ onClose }: Props) {
  const getWorkbookData = useGraphStore((s) => s.getWorkbookData);
  const [filename, setFilename] = useState(defaultExportFilename());

  const handleExport = () => {
    const blob = exportToExcelBlob(getWorkbookData());
    downloadBlob(blob, sanitizeFilename(filename));
    onClose();
  };

  return (
    <div className="overlay overlay--center" onClick={onClose} role="presentation">
      <div className="dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dialog__header">
          <h2>Export Excel</h2>
          <button type="button" className="sheet__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="form-field">
          <label htmlFor="export-name">File name</label>
          <input
            id="export-name"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            placeholder="famtree-2026-06-01.xlsx"
          />
        </div>

        <p className="hint">
          Saves People and Relationships sheets including node positions. Re-import this file next
          time you open Famtree.
        </p>

        <div className="form-actions">
          <button type="button" className="btn btn--primary" onClick={handleExport}>
            Download
          </button>
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
