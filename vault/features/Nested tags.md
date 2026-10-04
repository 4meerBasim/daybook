# Nested tags

Status: shipped
Summary: Hierarchical #a/b tags browsed as a tree and filterable at any level.

## Details
`src/screens/TagBrowserScreen.tsx` builds a tag tree from the `#a/b` tags on existing tasks, letting the user filter by any level of the hierarchy. The level matching is handled by `src/lib/matches.ts`, which also backs the tag filters on the list pages. The browser is reached from [[Profile]]; tags are entered in [[Quick Add Sheet]] and filtered on [[Today]], [[Inbox]] and [[Recent]].

## Related
- Page: [[Tag Browser]], [[Quick Add Sheet]], [[Today]], [[Inbox]], [[Recent]]
- Features: [[Persist + filter tags]], [[Smart lists]]
