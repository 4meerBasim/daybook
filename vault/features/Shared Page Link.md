# Shared Page Link

Status: shipped
Summary: Hand one page to someone as a link they can open — no account on either side, and nothing but that page travels.

## Details
Sharing in this category is gated behind sign-up, which is why nobody shares a grocery list. The whole feature is handing over one page.

**The link carries the page.** `pageLink(title, lines)` builds `daybook://page?d=…` where `d` is the URL-encoded JSON `{ v, t, l }` — a version, the title, and the lines. The recipient's app decodes it and creates a note. There is no server, no document id to look up and nothing to expire, because the link *is* the page.

A four-item grocery list is a 212-character link; a thirty-item trip list is 1.5KB. Both go through any messaging app. Round-tripping is verified, Arabic lines included, and `decodePage` returns null rather than throwing on malformed input or a version it does not know — a link from a future version fails closed instead of importing half a page.

Sharing is a SHARE control in the [[Note]] header, using React Native's own `Share` sheet, so no dependency was added. The [[Settings]] sharing row was a static "2 shared projects" label; it now says what sharing is and opens [[Notes]], where it actually happens.

**Privacy, which was the note's hard line.** Opt-in per page and nothing else goes: the payload is built from that one note's lines and its title, and carries no ids, no timestamps, no tasks, no projects and no reference to the sender's database. There is no account to leak and no server to hold a copy.

**Imported lines are plain text, not tasks.** An imported page is a note whose lines are text, titled "Groceries (shared)". Receiving someone's twenty-item list must not inject twenty rows into the recipient's [[Today]] — they promote the ones they are actually taking on, one tap each, through [[Notes With Live Task Lines]]. The sender's page keeps its own tasks; only the words crossed over.

## Not done: live two-way sharing
The note was explicit that this is "the one enhancement here that cannot stay local-only", and that remains true of the *collaborative* half. What shipped is a one-way handover, which is the whole of the stated summary and the grocery-list case; what it is not is a list both people edit and both people see change.

That needs a relay — the smallest anonymous short-lived document store — and with it the conflict model the note already identified: two people editing one list offline is a merge problem, and CRDT-style merging would constrain the shape of [[Offline First Local Store]] rather than sitting on top of it. Building a server is outside this app, and faking it with polling against someone else's backend would add an account and a network dependency to an app whose premise is neither.

The versioned payload is the forward path: a relay-backed page would be the same `{ v, t, l }` shape at `v: 2` with a document id, so the link format does not have to be redesigned to get there.

## Related
- Page: [[Settings]], [[Profile]], [[Project Detail]], [[Note]], [[Notes]]
- Features: [[Notes With Live Task Lines]], [[System Capture Entry Points]], [[Offline First Local Store]], [[Inbox Triage Chips]]
