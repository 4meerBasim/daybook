# Export JSON and Markdown

Status: shipped
Summary: Export all tasks, projects and journal entries to a JSON or Markdown file and share it. (PDF deferred — out of scope.)

## Details
`src/lib/export.ts` builds two formats. `buildJsonExport()` emits a full structured dump (tasks with their done state, projects, entries, journals, habits, subtasks, smart lists, attachment metadata, focus sessions and prefs). `buildMarkdownExport()` emits a human-readable document — journal entries grouped by journal with date + title + body, and tasks as checklists grouped by project/list with their subtasks. `exportData(format, data, t)` writes the file to the cache directory via `expo-file-system` (`File` / `Paths`) and shares it with `expo-sharing` (`Sharing.shareAsync`), guarding `Sharing.isAvailableAsync` and web — when unavailable it surfaces the `exportUnavailable` alert. Two rows ("Export as JSON", "Export as Markdown") sit under a Data group on [[Settings]]. PDF from the original enhancement is intentionally not implemented.

## Related
- Page: [[Settings]], [[Profile]]
- Features: [[Persistence layer]], [[Attachments]]
- Enhancements: [[Markdown editor]]
