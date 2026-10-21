# Shared Page Link

Status: planned
Summary: Hand one list to someone by link — groceries, a trip — without either side creating an account.

## Notes
Sharing in this category is gated behind sign-up, which is why nobody shares a grocery list. Handing over a single page by link, scoped and expiring, is the whole feature. No workspace, no invitations, no roles.

[[Settings]] already draws a sharing row and [[Project Detail]] already shows shared avatars, so the design anticipates collaboration without specifying it.

Open decisions:

- This is the one enhancement here that cannot stay local-only. It needs a minimal relay — the smallest possible server holding one shared document, ideally anonymous and short-lived.
- Conflict handling. Two people editing one list offline needs a merge strategy; CRDT-style merging is the honest answer, and it constrains the data layer, so it should be decided alongside [[Offline First Local Store]] rather than after it.
- Scope and expiry defaults: one list, read-write, expiring in a day or a week.
- Privacy line: sharing is opt-in per page and must never carry the rest of the vault along.

## Related
- Page: [[Settings]], [[Profile]], [[Project Detail]]
- Enhancements: [[Offline First Local Store]]
