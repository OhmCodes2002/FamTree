# Cursor Activity Log (Notion)

Logs hook-observable Cursor Agent activity to a single Notion page.

## Setup

1. Create a Notion internal integration and copy the token.
2. Share a parent page with that integration.
3. Set token (new terminal after `setx`):

```powershell
setx NOTION_TOKEN "ntn_your_token_here"
```

4. Create the log page:

```powershell
cd "C:\Users\ohmsa\OneDrive\Desktop\FamtreeJune 1"
powershell -NoProfile -ExecutionPolicy Bypass -File .cursor\hooks\init-notion-log.ps1 -ParentPageId "YOUR_PARENT_PAGE_ID"
```

5. Restart Cursor.

## Files

- `hooks.json` (project root `.cursor/`) - event wiring
- `log-to-notion.ps1` - hook handler
- `init-notion-log.ps1` - creates Notion page and stores `targetPageId`
- `.notion-log.json` - config
- `.notion-log-state.json` - dedupe cache (auto-created)
- `.notion-log-errors.log` - Notion write failures (auto-created)

## Notes

- Hooks are fail-open: logging errors do not block Cursor.
- Secrets are redacted by default in logged text.
- Manual edits/terminal actions outside Agent hooks may not be logged.
