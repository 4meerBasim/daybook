# Offline First Local Store

Status: planned
Summary: A real local database as the single source of truth — instant cold start, no spinners, fully usable with no account, sync optional and later.

## Notes
The prerequisite for almost everything else in this folder. Today the app runs on `src/data/seed.ts` plus in-memory maps in `src/state/store.tsx`: [[Today]] and [[Inbox]] read from two separate arrays with no shared identity, inbox rows are keyed by title, header counts are literal strings, and nothing survives a reload. That is correct for a fidelity pass of the mock and insufficient for any of the features proposed here.

It is also a differentiator in its own right. Local-first means the app opens instantly, works on a plane, and never asks for a sign-up before it does its job — the opposite of how the category behaves.

What it has to settle, because several enhancements depend on the answers:

- One task table that every list filters, with stable ids — the blocker named in [[Inbox Triage Chips]].
- Timestamps for created, completed, carried and struck, which [[Ink Decay and Task Retirement]], [[Closing the Page Ritual]] and [[Weekly Spread Review]] all read.
- A duration field for [[Day Capacity Budget]], and attachment storage for [[Voice Brain Dump Capture]].
- Whether records are merge-friendly from the start. [[Shared Page Link]] needs CRDT-style merging, and retrofitting that later costs far more than designing for it now.
- A store the native side can also read, for [[Focus Live Activity and Widgets]].
- The sync row already drawn in [[Settings]] stays optional and off by default.

## Related
- Page: [[Settings]], [[Today]], [[Inbox]]
- Enhancements: [[Closing the Page Ritual]], [[Day Capacity Budget]], [[Ink Decay and Task Retirement]], [[Notes With Live Task Lines]], [[Weekly Spread Review]], [[Shared Page Link]], [[Adaptive Reminders]], [[Focus Live Activity and Widgets]], [[System Capture Entry Points]], [[Inbox Triage Chips]]
