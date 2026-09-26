import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align } from '../lib/rtl';
import { useStore } from '../state/store';
import { projectName, rowTitle, type TaskRow } from '../db/schema';
import { Dot } from '../components/Ledger';
import { Sheet, SheetRow } from '../components/Sheet';
import { CheckIcon } from '../components/Icon';

export function ProjectPickerSheet({ task, onClose }: { task: TaskRow; onClose: () => void }) {
  const { c, t, ui, display, rtl } = useTheme();
  const { projects, edit } = useStore();

  const pick = (projectId: string | null) => {
    if (projectId !== task.projectId) edit(task.id, { projectId });
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <View style={{ paddingTop: 14, paddingBottom: 12, paddingHorizontal: metrics.gutter }}>
        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[display(22), { color: c.ink, textAlign: align(rtl) }]}
        >
          {rowTitle(task, t)}
        </Text>
      </View>

      {projects.map((project) => {
        const name = projectName(project, t);
        return (
          <SheetRow key={project.id} onPress={() => pick(project.id)} label={name}>
            <Dot color={c[project.color]} size={8} />
            <Text
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
            >
              {name}
            </Text>
            {task.projectId === project.id ? <CheckIcon color={c.ink} /> : null}
          </SheetRow>
        );
      })}

      <SheetRow onPress={() => pick(null)} label={t.noProject}>
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[ui(17), { flex: 1, color: c.ink2, textAlign: align(rtl) }]}
        >
          {t.noProject}
        </Text>
        {task.projectId === null ? <CheckIcon color={c.ink} /> : null}
      </SheetRow>
    </Sheet>
  );
}
