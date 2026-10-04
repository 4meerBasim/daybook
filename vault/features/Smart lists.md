# Smart lists

Status: shipped
Summary: Rule-based saved views that collect tasks matching tags, due state, priority, project or colour.

## Details
`src/screens/SmartListsScreen.tsx` presents saved views whose rules are evaluated by `src/lib/smartlists.ts` — matching on tags (including nested tags), due/overdue, priority, project and colour. Built-in lists ship for "Someday", "Overdue" and "This week", and user lists are persisted via the `smart_lists` table in `src/lib/db.ts` with smart-list CRUD in `src/state/store.tsx`. The screen is reached from [[Profile]], and matching tasks open on [[Task Detail]]; the same rule results feed the [[Today]], [[Inbox]] and [[Recent]] pages.

## Related
- Page: [[Smart Lists]], [[Today]], [[Inbox]], [[Recent]]
- Features: [[Nested tags]]
