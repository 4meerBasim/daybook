import { supabase, isSyncConfigured } from './supabase';
import { getChangedRows, applyRemoteRows } from './db';

export type SyncTable = { local: string; remote: string; key: string[] };

export const SYNC_TABLES: SyncTable[] = [
  { local: 'tasks', remote: 'tasks', key: ['id'] },
  { local: 'projects', remote: 'projects', key: ['id'] },
  { local: 'entries', remote: 'entries', key: ['id'] },
  { local: 'journals', remote: 'journals', key: ['id'] },
  { local: 'habits', remote: 'habits', key: ['id'] },
  { local: 'subtasks', remote: 'subtasks', key: ['id'] },
  { local: 'smart_lists', remote: 'smart_lists', key: ['id'] },
  { local: 'focus_sessions', remote: 'focus_sessions', key: ['id'] },
  { local: 'attachments', remote: 'attachments', key: ['id'] },
  { local: 'task_state', remote: 'task_state', key: ['taskId'] },
  { local: 'task_tags', remote: 'task_tags', key: ['taskId', 'tag'] },
  { local: 'habit_sessions', remote: 'habit_sessions', key: ['id'] },
  { local: 'entry_templates', remote: 'entry_templates', key: ['id'] },
];

export type SyncReason = 'unconfigured' | 'disabled' | 'empty' | 'error';
export type SyncResult = {
  ok: boolean;
  pushed: number;
  pulled: number;
  at: number;
  reason?: SyncReason;
};

function toRemote(row: Record<string, unknown>, owner: string): Record<string, unknown> {
  const { updatedAt, deletedAt, ...rest } = row;
  return { ...rest, owner, updated_at: updatedAt ?? Date.now(), deleted_at: deletedAt ?? null };
}

export function toLocal(row: Record<string, unknown>): Record<string, unknown> {
  const { owner, updated_at, deleted_at, ...rest } = row;
  return { ...rest, updatedAt: updated_at ?? Date.now(), deletedAt: deleted_at ?? null };
}

export async function syncNow(params: {
  ownerId: string;
  since: number;
  setLastSync: (ts: number) => void;
  onApplied: () => Promise<void> | void;
  enabled?: boolean;
}): Promise<SyncResult> {
  const { ownerId, since, setLastSync, onApplied, enabled = true } = params;
  const at = Date.now();
  if (!enabled) return { ok: false, pushed: 0, pulled: 0, at, reason: 'disabled' };
  if (!isSyncConfigured() || !supabase || !ownerId) {
    return { ok: false, pushed: 0, pulled: 0, at, reason: 'unconfigured' };
  }

  let pushed = 0;
  let pulled = 0;
  try {
    for (const table of SYNC_TABLES) {
      const local = await getChangedRows(table.local, since);
      if (local.length) {
        const payload = local.map((r) => toRemote(r, ownerId));
        const { error } = await supabase
          .from(table.remote)
          .upsert(payload, { onConflict: table.key.join(',') });
        if (error) throw error;
        pushed += payload.length;
      }
    }

    for (const table of SYNC_TABLES) {
      const { data, error } = await supabase
        .from(table.remote)
        .select('*')
        .eq('owner', ownerId)
        .gt('updated_at', since);
      if (error) throw error;
      const rows = (data ?? []) as Record<string, unknown>[];
      if (rows.length) {
        await applyRemoteRows(table.local, rows.map(toLocal), table.key);
        pulled += rows.length;
      }
    }

    setLastSync(at);
    await onApplied();
    return { ok: true, pushed, pulled, at };
  } catch {
    return { ok: false, pushed, pulled, at, reason: 'error' };
  }
}
