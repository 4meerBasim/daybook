# Deal Me One Task Picker

Status: shipped
Summary: Say how long you have and where you are, then one button deals a single task face up and leaves the rest of the deck face down.

## Details
Prioritisation by energy and context rather than importance. The failure this fixes is the moment of use — forty rows, none of them doable in the ten minutes the user actually has.

`DealScreen` is a `fullScreenModal` on `paper2`, the same sheet treatment [[Focus Mode]] uses, because the whole point is one task on an otherwise blank page.

**The deck.** `selectDealable` is "what could I do right now": incomplete, not deleted, not shelved to Someday, not snoozed, not blocked with a future nudge, and either undated or due today or earlier. Anything scheduled for next Tuesday is not in the deck.

**The filters.**

- *How long have you got* — Any / 5m / 15m / 30m, matched against [[Day Capacity Budget]]'s `duration`. A task with no estimate never satisfies a time filter, which is correct: an unestimated task is not a known five-minute task.
- *Where are you* — built from the tags actually present on the dealable rows, so the contexts are the user's own vocabulary rather than a fixed list the app invented. Reusing tags is what the note predicted would be both cheaper and right, and it means `#phone` or `#desk` work the moment the user writes them in [[Natural Language Quick Add]].

Narrowing either filter resets the refusal memory and clears the face-up card, because the deck it was drawn from no longer exists.

**Dealing.** A uniform draw from what fits, minus the ids refused this session and minus the card already face up — "deal me another" never deals the same task twice in a row, which was the note's requirement. Refusals live in component state, so they last exactly as long as the screen: a task refused today is not held against it tomorrow. When every card has been refused the deck reshuffles rather than dead-ending, so the screen always has an answer.

**What you can do with the card.** Focus — which is this feature's other job, since [[Focus Timer]] had no discovery path at all and [[Focus Mode Unreachable]] was the bug — Done, or deal another. Choosing Focus `replace`s the deal screen, so finishing the session returns to the tabs rather than to a stale card.

**Where it lives.** The Profile tab's long-press in [[Glass Tab Bar]], which the tab-bar redesign left unassigned — Today's long-press is [[Settings]] and Upcoming's is [[Calendar]]. The Add item is capture; this is retrieval, so it gets its own gesture rather than sharing one.

## Decisions taken
- **Energy is time, not a separate scale.** The note left energy and context open. Context reuses tags; energy reduces to "how long have you got", which is a question the user can answer honestly in the moment. A separate low/medium/high energy field would be another column for the user to maintain on every task.
- **Refusals are per-session, not persisted.** Persisting them would need a column and a rule for when it expires, and refusing a task because it is 9pm says nothing about tomorrow morning.

## Related
- Page: [[Today]], [[Focus Mode]], [[Main Tabs]], [[Profile]]
- Features: [[Focus Timer]], [[Glass Tab Bar]], [[Pen FAB]], [[Ledger Paper Chrome]], [[Day Capacity Budget]], [[Natural Language Quick Add]], [[Waiting On Follow-Ups]], [[Inbox Triage Chips]]
- Bugs: [[Focus Mode Unreachable]]
