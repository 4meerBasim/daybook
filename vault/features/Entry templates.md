# Entry templates

Status: shipped
Summary: Reusable capture templates that pre-fill a new entry with a saved structure.

## Details
Built-in templates come from `builtinTemplates(t)` in `src/data/seed.ts` (Gratitude, Daily review, Weekly — ids `tpl-gratitude` / `tpl-review` / `tpl-weekly`); user templates live in the `entry_templates` table (`src/lib/db.ts`) and are created via `addTemplate` / read through `useTemplates()`. In the [[Entry Composer]] a new entry shows a horizontal picker of `useTemplates()` plus a "Blank" option that seeds the body (and title when blank); an `initialTemplateId` prefills on mount, and "Save as template" captures the current body.

## Related
- Page: [[Entry Composer]]
- Features: [[Daily writing prompts]], [[Persistence layer]]
- Enhancements: [[Markdown editor]]
