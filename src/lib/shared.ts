import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSyncConfigured, newShareCode } from './supabase';
import { applyRemoteRows } from './db';
import { toLocal } from './sync';

export type ShareInfo = { shareCode: string };

export async function getShareCode(projectId: string): Promise<string | null> {
  if (!isSyncConfigured() || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('shared_projects')
      .select('share_code')
      .eq('project_id', projectId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) throw error;
    return (data?.share_code as string) ?? null;
  } catch {
    return null;
  }
}

export async function shareProject(projectId: string, ownerId: string): Promise<string | null> {
  if (!isSyncConfigured() || !supabase || !ownerId) return null;
  try {
    const existing = await getShareCode(projectId);
    if (existing) return existing;
    const shareCode = newShareCode();
    const now = Date.now();
    const { error } = await supabase.from('shared_projects').upsert(
      {
        project_id: projectId,
        owner: ownerId,
        share_code: shareCode,
        updated_at: now,
        deleted_at: null,
      },
      { onConflict: 'project_id' }
    );
    if (error) throw error;
    await supabase.from('project_members').upsert(
      { project_id: projectId, member: ownerId, updated_at: now, deleted_at: null },
      { onConflict: 'project_id,member' }
    );
    return shareCode;
  } catch {
    return null;
  }
}

export async function joinSharedList(
  shareCode: string,
  ownerId: string,
  onApplied: () => Promise<void> | void
): Promise<string | null> {
  if (!isSyncConfigured() || !supabase || !ownerId) return null;
  try {
    const code = shareCode.trim().toUpperCase();
    if (!code) return null;
    const { data: share, error: shareErr } = await supabase
      .from('shared_projects')
      .select('project_id, owner')
      .eq('share_code', code)
      .is('deleted_at', null)
      .maybeSingle();
    if (shareErr) throw shareErr;
    const projectId = share?.project_id as string | undefined;
    const projectOwner = share?.owner as string | undefined;
    if (!projectId || !projectOwner) return null;

    await supabase.from('project_members').upsert(
      { project_id: projectId, member: ownerId, updated_at: Date.now(), deleted_at: null },
      { onConflict: 'project_id,member' }
    );

    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .maybeSingle();
    if (project) await applyRemoteRows('projects', [toLocal(project as Record<string, unknown>)]);

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('projectId', projectId);
    const taskRows = (tasks ?? []) as Record<string, unknown>[];
    if (taskRows.length) await applyRemoteRows('tasks', taskRows.map(toLocal));

    await onApplied();
    return projectId;
  } catch {
    return null;
  }
}

export function subscribeSharedProject(
  projectId: string,
  onChange: () => void
): (() => void) | null {
  const client = supabase;
  if (!isSyncConfigured() || !client) return null;
  try {
    const channel: RealtimeChannel = client
      .channel(`shared_project_${projectId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `projectId=eq.${projectId}` },
        () => onChange()
      )
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  } catch {
    return null;
  }
}
