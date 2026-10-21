import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, row } from '../lib/rtl';
import { useStore } from '../state/store';
import { projectName, type ProjectRow, type TaskRow } from '../db/schema';
import { Screen, useHeaderTop } from '../components/Screen';
import { Dot, EmptyRules, Ledger, rowContent, useRuling } from '../components/Ledger';
import { Sheet, SheetButton, SheetRow } from '../components/Sheet';
import { NameSheet } from '../components/NameSheet';
import { PlusIcon } from '../components/Icon';

export function ProjectsScreen({ onOpenProject }: { onOpenProject: (projectId: string) => void }) {
  const { c, t, display, rtl } = useTheme();
  const { projects, assigned, createProject, renameProject, removeProject } = useStore();
  const top = useHeaderTop();
  const [managed, setManaged] = useState<ProjectRow | null>(null);
  const [named, setNamed] = useState<ProjectRow | 'new' | null>(null);

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: metrics.gutter }}>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.projects}
          </Text>
        </View>

        <Ledger>
          {projects.map((project) => (
            <ProjectListRow
              key={project.id}
              project={project}
              tasks={assigned.filter((k) => k.projectId === project.id)}
              onOpen={() => onOpenProject(project.id)}
              onManage={() => setManaged(project)}
            />
          ))}

          <NewProjectRow onPress={() => setNamed('new')} />

          <EmptyRules count={3} />
        </Ledger>
      </ScrollView>

      {managed ? (
        <ManageSheet
          project={managed}
          onClose={() => setManaged(null)}
          onRename={() => {
            setNamed(managed);
            setManaged(null);
          }}
          onDelete={() => {
            removeProject(managed.id);
            setManaged(null);
          }}
        />
      ) : null}

      {named ? (
        <NameSheet
          initial={named === 'new' ? '' : projectName(named, t)}
          placeholder={t.projectName}
          onClose={() => setNamed(null)}
          onSubmit={(name) => {
            if (!name) return;
            if (named === 'new') createProject(name);
            else renameProject(named.id, name);
          }}
        />
      ) : null}
    </Screen>
  );
}

function ProjectListRow({
  project,
  tasks,
  onOpen,
  onManage,
}: {
  project: ProjectRow;
  tasks: TaskRow[];
  onOpen: () => void;
  onManage: () => void;
}) {
  const { c, t, ui, mono, rtl } = useTheme();
  const { height, onContentLayout } = useRuling();
  const name = projectName(project, t);
  const done = tasks.filter((k) => k.completedAt !== null).length;

  return (
    <Pressable
      onPress={onOpen}
      onLongPress={onManage}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={name}
      accessibilityActions={[{ name: 'manage', label: t.moreOptions }]}
      onAccessibilityAction={(e) => {
        if (e.nativeEvent.actionName === 'manage') onManage();
      }}
      style={({ pressed }) => ({
        height,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
        backgroundColor: pressed ? c.paper2 : 'transparent',
      })}
    >
      <View onLayout={onContentLayout} style={rowContent(rtl, 16)}>
        <View style={{ width: metrics.checkbox, alignItems: 'center' }}>
          <Dot color={c[project.color]} size={8} />
        </View>

        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[
            ui(17, 400, 22),
            { flex: 1, minWidth: 0, color: c.ink, textAlign: align(rtl) },
            marginStart(rtl, 16),
          ]}
        >
          {name}
        </Text>

        <Text numberOfLines={1} style={[mono(12, 500), { color: c.ink3 }]}>
          <Text style={{ color: c.ink }}>{done}</Text>
          {` / ${tasks.length}`}
        </Text>
      </View>
    </Pressable>
  );
}

function NewProjectRow({ onPress }: { onPress: () => void }) {
  const { c, t, ui, rtl, unit } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={t.newProject}
      style={({ pressed }) => ({
        minHeight: unit,
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
        backgroundColor: pressed ? c.paper2 : 'transparent',
      })}
    >
      <View style={rowContent(rtl, 16)}>
        <View style={{ width: metrics.checkbox, alignItems: 'center' }}>
          <PlusIcon size={18} color={c.ink2} />
        </View>
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[
            ui(17, 400, 22),
            { flex: 1, minWidth: 0, color: c.ink2, textAlign: align(rtl) },
            marginStart(rtl, 16),
          ]}
        >
          {t.newProject}
        </Text>
      </View>
    </Pressable>
  );
}

function ManageSheet({
  project,
  onClose,
  onRename,
  onDelete,
}: {
  project: ProjectRow;
  onClose: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const { c, t, ui, display, rtl } = useTheme();
  const [confirming, setConfirming] = useState(false);

  return (
    <Sheet onClose={onClose}>
      <View style={{ paddingTop: 14, paddingBottom: 12, paddingHorizontal: metrics.gutter }}>
        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[display(22), { color: c.ink, textAlign: align(rtl) }]}
        >
          {projectName(project, t)}
        </Text>
      </View>

      {confirming ? (
        <View style={{ paddingHorizontal: metrics.gutter, gap: 16 }}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[ui(15, 400, 22), { color: c.ink2, textAlign: align(rtl) }]}
          >
            {t.deleteProjectHint}
          </Text>
          <View style={{ flexDirection: row(rtl), gap: 12 }}>
            <SheetButton secondary label={t.cancel} onPress={onClose} />
            <SheetButton label={t.delete} onPress={onDelete} />
          </View>
        </View>
      ) : (
        <View>
          <SheetRow onPress={onRename} label={t.rename}>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
            >
              {t.rename}
            </Text>
          </SheetRow>
          <SheetRow onPress={() => setConfirming(true)} label={t.deleteProject}>
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[ui(17), { flex: 1, color: c.ver, textAlign: align(rtl) }]}
            >
              {t.deleteProject}
            </Text>
          </SheetRow>
        </View>
      )}
    </Sheet>
  );
}

