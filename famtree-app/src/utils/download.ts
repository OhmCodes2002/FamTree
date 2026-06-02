export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function sanitizeFilename(name: string): string {
  const trimmed = name.trim() || 'famtree-export';
  const base = trimmed.replace(/\.xlsx$/i, '');
  const safe = base.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_').slice(0, 120);
  return safe.endsWith('.xlsx') ? safe : `${safe}.xlsx`;
}

export function defaultExportFilename(): string {
  const d = new Date();
  const iso = d.toISOString().slice(0, 10);
  return `famtree-${iso}.xlsx`;
}
