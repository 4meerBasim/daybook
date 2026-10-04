# Persist + filter tags

Status: shipped
Summary: Captures carry #tags that persist across restarts, and every list page surfaces its tags as ochre chips to filter the visible tasks, with nested-aware (parent/child) matching and full EN/AR RTL.

## Details
Tags are parsed from the quick-add line by `src/lib/parse.ts`; the tag token now accepts `/` for nesting (e.g. `#work/urgent`, `#a/b/c`) alongside the existing Arabic block, and the whole `work/urgent` string is stored as one tag. `QuickAddSheet.submit()` collects the parsed tag chips, strips the leading `#`, de-duplicates with a Set, and passes them as `tags: string[]` to `addTask`. The store persists them to the `task_tags` table via `setTaskTags` in `src/lib/db.ts`, and `loadSnapshot` restores them onto each task, so they survive a restart — building on [[Persistence layer]].

Each list page (`TodayScreen`, `InboxScreen`, `RecentScreen`, `ProjectScreen`) collects the tags present on its own tasks with `collectTags` and renders `src/components/TagFilterBar.tsx` — a horizontally scrollable, `row(rtl)`-mirrored row of ochre tag chips (`ochS`/`och` tokens, `radius.chip`), each a 44pt `accessibilityRole="button"` with `accessibilityState.checked` and a "Filter by tag" hint. The bar renders nothing when a screen has no tags. Tapping a chip filters the list to tasks carrying that tag; tapping it again clears. Matching is nested-aware through `hasTag` in `src/lib/matches.ts` (`tag === sel || tag.startsWith(sel + '/')`), so selecting a parent `work` also matches `work/urgent`.

On [[Today]] and [[Inbox]] the selected tag threads into `ProjectRows` via a `tagFilter` prop, so a project group shows only its matching tasks (and empty groups drop out while a tag is active); [[Recent]] and [[Project Detail]] filter their task list directly. The filter composes with the existing bottom search — both can be active at once. The new `filterByTag` string is added to EN and AR. A deeper hierarchical tag-tree UI remains the separate planned [[Nested tags]] enhancement.

## Related
- Page: [[Quick Add Sheet]], [[Today]], [[Inbox]], [[Recent]], [[Project Detail]]
- Features: [[Persistence layer]], [[Natural Language Quick Add]], [[Nested tags]]
