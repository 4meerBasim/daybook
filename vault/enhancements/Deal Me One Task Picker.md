# Deal Me One Task Picker

Status: planned
Summary: Filter by energy and context — "5 minutes", "phone only", "at desk" — then one button deals a single task, like drawing a card.

## Notes
Prioritisation by energy and context rather than by importance. Most lists fail at the moment of use: forty rows, none of them doable in the ten minutes and the mental state the user actually has. Dealing one task removes the choice entirely.

The paper metaphor supports it well — one task on an otherwise blank sheet, the rest of the deck face down. It is also the natural front door to [[Focus Timer]], which currently has no discovery path at all ([[Focus Mode Unreachable]]).

Open decisions:

- Tags exist as chips in the design but carry no semantics. Energy and context could reuse tags or be a separate dimension; reusing tags is cheaper and probably right.
- The time-based filters need the duration field from [[Day Capacity Budget]] to mean anything.
- Where the button lives. The bar's Add item is capture; this is retrieval, so it wants its own affordance. A long-press is the obvious candidate, and the redesign freed one up: Profile's long-press is unassigned now that the Inbox tab is gone, where before the only free slot would have meant displacing [[Settings]] or [[Calendar]]. See [[Main Tabs]] and [[Glass Tab Bar]]. The raised pen it used to be contrasted against is gone too — [[Pen FAB]].
- "Deal me another" needs session memory of what was refused, so the same task is not dealt twice in a row.

## Related
- Page: [[Today]], [[Focus Mode]], [[Main Tabs]], [[Profile]]
- Features: [[Focus Timer]], [[Glass Tab Bar]], [[Pen FAB]], [[Ledger Paper Chrome]]
- Bugs: [[Focus Mode Unreachable]]
- Enhancements: [[Day Capacity Budget]]
