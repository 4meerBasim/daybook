# Projects As A Real Entity

Status: shipped
Summary: Projects are things the user owns now — a list of them, names they choose, a progress fraction over real rows, tags that come out of their own tasks, and a way to file a capture into one.

## Details

`projects` was a table with one seeded row and no way to reach it. [[Project Detail]] hardcoded the name as `t.studio`, drew `#design` and `#invoice` as literals, and was reachable only by tapping a tag result in search. This is the work that made the table mean something.

### The list

[[Projects]] is a new screen: a ruled ledger of project rows, each one a colour dot in the checkbox column, the project's name, and its completed / total fraction in mono. It is the same paper as every other list — same ruling unit, same margin line, same 66pt text column — because the mock has no projects screen to copy and inventing a card grid would have introduced a surface the app does not have. A trailing `New project` row opens the naming sheet. It hangs off the Projects row above Sharing in the shared `SettingsRows` list, which means both [[Settings]] and [[Profile]] reach it.

### Create, rename, delete

`createProject`, `renameProject` and `removeProject` on the store, over `insertProject`, `updateProjectName` and `archiveProject` in `src/db/queries.ts`. Creation is unlimited and takes no colour picker: the colour cycles through blue, moss, ochre and vermilion by the number of live projects, so a new project is distinguishable without asking the user a question the mock never asks.

Rename clears `seedKey`. A seeded project renders its name through i18n, so without that a user who renamed Studio would see their name vanish the moment they switched language.

Delete is a soft delete that does **not** touch the user's tasks. `archiveProject` stamps `archivedAt` on the project and sets `projectId = NULL` on every task that pointed at it, inside one transaction, so the tasks come back as unfiled captures — dated ones to [[Today]] and [[Upcoming]]. Undated ones used to come back to the Inbox; with that screen gone they come back to nothing, which is the second source of [[Undated Unassigned Tasks Have No Screen]]. Both halves are needed: `projectId` has a foreign key and `PRAGMA foreign_keys = ON`, so a hard `DELETE` would be refused while tasks reference the row; and a task still pointing at an archived project would vanish from every list at once, which is data loss with extra steps. The confirmation line in the sheet still says so out loud, reworded with the Inbox's removal: `deleteProjectHint` is now "Its tasks are unassigned, not deleted." This is the same philosophy as `deletedAt` on a task in [[Offline First Local Store]].

### A real route

`Project` carries `{ projectId }` now instead of no params. [[Project Detail]] reads the row out of the `projects` snapshot, derives the fraction from its tasks, and splits them into this week and later by due date rather than printing a literal `LATER · 5`. Both entry points pass a real id: [[Projects]] passes the row that was tapped, and [[Search Results]]'s `#invoice` result passes the seeded project, which keeps that path exactly as it was.

### Tags

Hashtags used to be lost into the title — `Water the plants #home` was stored with the hash inside it, because no column caught them. `tasks` now has a `tags` column holding a comma-separated list. `splitTags` in `src/lib/parse.ts` pulls the hashtags out and cleans the title, `draft()` calls it so [[Natural Language Quick Add]] writes both halves, and `taskTags()` reads them back. A project's chips are the union of its tasks' tags in first-appearance order, so a project describes itself from its contents rather than from a hardcoded pair.

`tagColors` maps a tag onto one of the four tint pairs by the sum of its code points, which lands `#design` on blue and `#invoice` on ochre — the exact pairing the mock draws. Tags remain the only tinted surfaces in the app.

### Filing a task

Long-pressing a row on [[Project Detail]] opens [[Project Picker]], a sheet listing every project plus `No project`, with the current one ticked. Picking one writes `projectId` through the existing `edit` action; `No project` is how an assignment is cleared. The row carries an `assign` accessibility action, so the sheet is not reachable only by holding a finger down.

It had a second entry point. Long-pressing an Inbox row opened the same sheet and was the only way to file a capture into a project, so with the Inbox screen gone `ProjectScreen.tsx` is the picker's sole caller and there is now no path from an unfiled task to a project at all — see [[Undated Unassigned Tasks Have No Screen]].

No collaborator entity was invented. There is no backend, no accounts and no sharing — [[Shared Page Link]] is still unbuilt — so the `LM` / `NA` circles and the "shared with Nadia" line stay presentational and render for the seeded Studio project only. A project the user made shows neither.

### Migrating, not wiping

Schema version 2. The migration steps are indexed by version, so an existing database runs only what it has not seen: add `tasks.tags`, add `projects.seedKey`, name the seeded project, tag the seeded project's tasks so an upgrade looks like a fresh install, then lift hashtags out of the titles of every task the user wrote under version 1. Nothing is dropped and nothing is recreated.

## Related
- Page: [[Projects]], [[Project Detail]], [[Project Picker]], [[Settings]], [[Profile]], [[Main Tabs]], [[Search Results]], [[Today]], [[Upcoming]]
- Features: [[Offline First Local Store]], [[Natural Language Quick Add]], [[Ledger Paper Chrome]], [[In-App RTL and Arabic Typography]], [[Light and Dark Paper Palettes]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Bottom Sheet Text Input Crashes On Web]], [[Undated Unassigned Tasks Have No Screen]]
- Enhancements: [[Inbox Triage Chips]], [[Shared Page Link]], [[Waiting On Follow-Ups]]
