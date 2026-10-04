import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics } from '../theme/tokens';
import { align, marginStart, row } from '../lib/rtl';
import { toArabicDigits } from '../lib/day';
import { useStore, useSubtaskProgress, useSubtasks } from '../state/store';
import { Checkbox } from './Ledger';
import { CloseIcon, PlusIcon } from './Icon';

export function SubtaskList({ taskId }: { taskId: string }) {
  const { c, t, ui, mono, ar, rtl } = useTheme();
  const { addSubtask, toggleSubtask, removeSubtask } = useStore();
  const subtasks = useSubtasks(taskId);
  const { done, total } = useSubtaskProgress(taskId);
  const [draft, setDraft] = useState('');

  const add = () => {
    const title = draft.trim();
    if (!title) return;
    addSubtask(taskId, title);
    setDraft('');
  };

  return (
    <View style={{ gap: 4 }}>
      {total > 0 ? (
        <Text
          accessibilityLabel={`${done} ${t.of} ${total}`}
          style={[
            mono(12, 500),
            { color: c.ink3, textAlign: align(rtl), writingDirection: 'ltr' },
          ]}
        >
          {`${toArabicDigits(done, ar)}/${toArabicDigits(total, ar)}`}
        </Text>
      ) : null}

      {subtasks.map((s) => (
        <View key={s.id} style={{ flexDirection: row(rtl), alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => {
              if (!s.done) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleSubtask(s.id);
            }}
            android_ripple={null}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: s.done }}
            accessibilityLabel={s.title}
            hitSlop={{ top: 11, bottom: 11, left: 6, right: 6 }}
            style={{ flex: 1, flexDirection: row(rtl), alignItems: 'center', gap: 12, minHeight: 44 }}
          >
            <Checkbox checked={s.done} circle size={20} />
            <Text
              numberOfLines={2}
              maxFontSizeMultiplier={maxFontSizeMultiplier}
              style={[
                ui(15, 400, 20),
                {
                  flex: 1,
                  color: s.done ? c.ink3 : c.ink,
                  textDecorationLine: s.done ? 'line-through' : 'none',
                  textAlign: align(rtl),
                },
              ]}
            >
              {s.title}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => removeSubtask(s.id)}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.deleteSubtask}
            hitSlop={metrics.hitSlop}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <CloseIcon size={18} color={c.ink3} />
          </Pressable>
        </View>
      ))}

      <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 12, minHeight: 44 }}>
        <View style={{ width: 20, alignItems: 'center' }}>
          <PlusIcon size={18} color={c.ink3} />
        </View>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={add}
          submitBehavior="submit"
          returnKeyType="done"
          placeholder={t.subtaskPlaceholder}
          placeholderTextColor={c.ink3}
          selectionColor={c.ink}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          accessibilityLabel={t.addSubtask}
          style={[
            ui(15),
            { flex: 1, color: c.ink, padding: 0, textAlign: align(rtl) },
            marginStart(rtl, 0),
          ]}
        />
      </View>
    </View>
  );
}
