# Famtree

A lightweight tribal-styled family graph PWA. Import an Excel workbook on each visit, explore relationships on an interactive canvas, and export your changes back to Excel.

## Quick start

```bash
cd famtree-app
npm install
npm run generate:template
npm run dev
```

Open the URL shown in the terminal on your phone (same Wi‑Fi) or use `npm run build` + `npm run preview`.

## Install on your phone (PWA)

### Android (Chrome)

1. Open the app URL in Chrome.
2. Menu → **Install app** or **Add to Home screen**.

### iOS (Safari)

1. Open the app URL in Safari.
2. Share → **Add to Home Screen**.

## Excel format

Two sheets are required: **People** and **Relationships**.

### People columns

| Column | Required | Notes |
|--------|----------|-------|
| id | Yes | Stable unique id, e.g. `p_001` |
| name | Yes | Full name |
| village | No | Village or hometown |
| current_address | No | Full address (multiline in app) |
| life_status | Yes | `alive` or `dead` |
| notes | No | Optional |
| pos_x, pos_y | No | Node layout; filled on export |

### Relationships columns

| Column | Required | Notes |
|--------|----------|-------|
| id | Yes | Unique id, e.g. `r_001` |
| from_id | Yes | Person id |
| to_id | Yes | Person id |
| relationship | Yes | Machine value, e.g. `father`, `mother`, `cousin` |
| notes | No | Optional detail |

### Edge direction

`from_id` → `to_id` means **from** is the **relationship** toward **to**.

Example: `from_id=p_001`, `to_id=p_003`, `relationship=father` → person p_001 is the **father of** p_003.

Download the sample: `/templates/famtree-template.xlsx`

## Workflow

1. Open Famtree → **Select Excel file** (required each session).
2. Pan/zoom the graph; tap a person to edit.
3. **+ Person**, **Link** (pick two people, choose relationship), **Arrange**, **Export**.
4. Save the exported `.xlsx` with your chosen name and re-import it next time.

All data stays in the browser; nothing is uploaded.

## Scripts

- `npm run dev` — development server
- `npm run build` — production build + template generation
- `npm run generate:template` — write `public/templates/famtree-template.xlsx`
- `node scripts/verify-roundtrip.mjs` — checks template sheets load correctly

## Mobile test checklist

1. Import `famtree-template.xlsx` from the home screen.
2. Confirm three nodes and labeled edges appear; pinch-zoom and drag the canvas.
3. Tap a person → edit village/address → Save.
4. **+ Person** → add someone → appears on canvas.
5. **Link** → pick two people → choose e.g. Father (Pita) → Save link.
6. **Arrange** → nodes reflow; drag a node; **Export** with a custom filename.
7. Return to **Import**, open the exported file → same people, relationships, and positions.

Build verified with `npm run build` (TypeScript + Vite PWA).

### Phone cannot open the dev URL?

1. **Use your laptop’s Wi‑Fi IP, not `localhost`.** On the phone open `http://192.168.x.x:5173` (see terminal “Network” line after `npm run dev`).
2. **Restart dev** from `famtree-app`: `npm run dev` (listens on all interfaces).
3. **Allow Windows Firewall** (run PowerShell **as Administrator** once):
   ```powershell
   cd "C:\Users\ohmsa\OneDrive\Desktop\FamtreeJune 1\famtree-app"
   powershell -ExecutionPolicy Bypass -File scripts\open-lan-firewall.ps1
   ```
4. **Same network** — phone on home Wi‑Fi, not mobile data or a “Guest” SSID (guest networks often block device-to-device access).
5. **Turn off VPN** on laptop and phone while testing.
6. **Fallback:** `npm run preview:lan` then on phone open `http://192.168.x.x:4173` (production build; often easier than dev + firewall).
