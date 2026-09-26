# Offline First Local Store

Status: shipped
Summary: A real local database is the single source of truth — instant cold start, no spinners, fully usable with no account, and everything the user does survives a reload.

## Details
`src/db/` on `expo-sqlite`. `schema.ts` holds the DDL, the row types and a `PRAGMA user_version` migration; `queries.ts` holds every read and write; `seed.ts` plants first-run content; `reminders.ts` holds the snooze offsets. `App.tsx` wraps the tree in `SQLiteProvider` with an `onInit` that migrates then seeds, and `src/state/store.tsx` keeps its provider shape but reads snapshots from the database instead of holding `useState` maps.

The legacy `expo-sqlite` API is gone in SDK 57 — no `openDatabase`, no `db.transaction`, no `executeSql`. Everything here uses the async API (`execAsync`, `runAsync`, `getFirstAsync`, `getAllAsync`, `withTransactionAsync`), which behaves identically on native and web. The `*Sync` variants are avoided on purpose: on web they need `SharedArrayBuffer`, busy-spin the main thread and cap results at roughly 1MB. Generics are always passed explicitly, since `getAllAsync` without one yields `unknown[]`.

### Tables

`tasks` — `id` TEXT PK (generated), `title`, `seedKey`, `notes`, `projectId` → `projects(id)`, `color` (a palette token name, never a hex), `dueDate`, `createdAt`, `completedAt`, `snoozedUntil`, `deletedAt`, `duration`, `priority`, `sortOrder`, `reminderAt`, `tags`. Every date is real epoch milliseconds, not the display string the old seed carried. `tags` is a comma-separated list of hashtag names with no hash, written by [[Natural Language Quick Add]] and read back by `taskTags()`.

`projects` — `id`, `name`, `seedKey`, `color`, `createdAt`, `archivedAt`. `archivedAt` is the project's soft delete, and it comes with clearing `projectId` on that project's tasks so none of them disappear — see [[Projects As A Real Entity]].

`subtasks` — its own id space, `parentTaskId` → `tasks(id)`, `title`, `seedKey`, `completedAt`, `sortOrder`.

Three indexes, each matching a query that exists: `tasks (dueDate) WHERE deletedAt IS NULL`, `tasks (projectId) WHERE deletedAt IS NULL`, and `subtasks (parentTaskId, sortOrder)`. The partial predicate is there because every list query already filters soft-deleted rows.

`PRAGMA journal_mode = WAL` and `PRAGMA foreign_keys = ON` run via `execAsync` at init, before any DDL and outside any transaction — both are per-connection and both are no-ops inside one.

### Versioned migration steps

`migrate()` holds an array of steps indexed by schema version and runs `STEPS.slice(user_version)`, so a fresh install runs all of them and an existing database runs only what it has not seen. Step 1 is the DDL above; step 2 adds `tasks.tags` and `projects.seedKey`, names the seeded project, tags the seeded project's tasks so an upgraded database reads like a fresh one, and lifts hashtags out of the titles of tasks the user wrote under version 1. Nothing is dropped and nothing is recreated — the whole point is that an installed database survives.

### Completion, snooze and delete are three different columns

Completion is `completedAt` on the row, not a separate map — that is what fixed [[Task And Subtask Ids Share One Done Map]]. `snoozedUntil` hides a task until its time while it still exists everywhere else; `deletedAt` is a soft delete that `restore` can undo. Collapsing those two was [[Snooze And Delete Share One Cleared Map]].

### Bilingual seed content

Seed rows carry a nullable `seedKey` holding an i18n key. When it is set the row renders `t[seedKey]`, so demo content still switches with the app language; when it is null the row renders its stored `title`, which is what every user-created task does. `rowTitle()` in `schema.ts` is the whole mechanism, and `StringKey` in `src/i18n/strings.ts` narrows the key to the string-valued members of `EN` so a bad key is a compile error.

Seed due dates are computed relative to the first-run date — today, yesterday, tomorrow, later this week — so a fresh install always reads as the current day rather than a frozen September 2026. That is what exposed [[Page Header Shows A Frozen Date]]: once the rows were real, the literal date line above them was visibly wrong.

### What the lists became

Every screen that used to read a seed array now filters one task table: [[Today]] takes dated tasks up to end of day (carrying overdue ones that are still open), [[Upcoming]] takes future-dated tasks grouped into tomorrow / this week / later, [[Inbox]] takes undated tasks with no project, and [[Calendar]] takes the current month. One `assigned` query returns every task that has a project at all, which [[Project Detail]] filters by id and [[Projects]] counts per row, and `projects` is its own snapshot beside it. Header counts, the project progress fraction and the subtask tally are all derived now — see [[Calendar Tally Marks]].

### Notification readiness, deliberately unbuilt

No `expo-notifications`, no permission strings, no scheduler. The data model alone is what makes scheduling later trivial: epoch-ms dates, a per-task `reminderAt`, and `src/db/reminders.ts` naming the snooze offsets the mock draws (10 minutes, 1 hour, tomorrow) plus the 20:30 evening review that [[Settings]] already displays. [[Adaptive Reminders]] is where that work lands.

### What it unblocks

`duration` exists for [[Day Capacity Budget]], `createdAt` and `completedAt` for [[Ink Decay and Task Retirement]] and [[Closing the Page Ritual]], stable ids across every list for [[Inbox Triage Chips]]. Merge-friendliness for [[Shared Page Link]] is still undecided — rows are last-write-wins today, and CRDT-style merging would be a schema change. The sync row drawn in [[Settings]] is still inert by design.

## Related
- Page: [[Settings]], [[Today]], [[Inbox]], [[Upcoming]], [[Calendar]], [[Project Detail]], [[Projects]], [[Project Picker]], [[Task Detail]], [[Quick Add Sheet]]
- Features: [[Natural Language Quick Add]], [[Projects As A Real Entity]], [[Swipe Row Actions]], [[Calendar Tally Marks]], [[Ink Strike-Through Completion]]
- Bugs: [[Quick Add Does Not Create Tasks]], [[Snooze And Delete Share One Cleared Map]], [[Task And Subtask Ids Share One Done Map]], [[Page Header Shows A Frozen Date]]
- Enhancements: [[Closing the Page Ritual]], [[Day Capacity Budget]], [[Ink Decay and Task Retirement]], [[Notes With Live Task Lines]], [[Weekly Spread Review]], [[Shared Page Link]], [[Adaptive Reminders]], [[Focus Live Activity and Widgets]], [[System Capture Entry Points]], [[Inbox Triage Chips]], [[Waiting On Follow-Ups]], [[Voice Brain Dump Capture]]
