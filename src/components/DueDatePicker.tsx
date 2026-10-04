import React, { useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { formatDay, formatTime, nextWeek, thisEvening, todayAt, tomorrowMorning } from '../lib/day';

type Props = {
  value: number | null;
  someday?: boolean;
  onChange: (dueAt: number | null, someday: boolean) => void;
};

export function useDateTimePicker() {
  const { c, t, ui, dark, reduced } = useTheme();
  const [pending, setPending] = useState<{ base: Date; cb: (d: Date) => void } | null>(null);
  const [draft, setDraft] = useState<Date | null>(null);

  const open = (base: Date, cb: (d: Date) => void) => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: base,
        mode: 'date',
        is24Hour: true,
        onChange: (e, d) => {
          if (e.type !== 'set' || !d) return;
          const day = d;
          DateTimePickerAndroid.open({
            value: day,
            mode: 'time',
            is24Hour: true,
            onChange: (e2, time) => {
              if (e2.type !== 'set' || !time) return;
              cb(
                new Date(
                  day.getFullYear(),
                  day.getMonth(),
                  day.getDate(),
                  time.getHours(),
                  time.getMinutes(),
                  0,
                  0
                )
              );
            },
          });
        },
      });
      return;
    }
    setDraft(base);
    setPending({ base, cb });
  };

  const close = () => {
    setPending(null);
    setDraft(null);
  };

  const confirm = () => {
    if (pending && draft) pending.cb(draft);
    close();
  };

  const element =
    pending && Platform.OS === 'ios' ? (
      <Modal transparent animationType={reduced ? 'none' : 'fade'} onRequestClose={close}>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t.cancel}
          style={{ flex: 1, backgroundColor: `${c.ink}66`, justifyContent: 'flex-end' }}
        >
          <Pressable
            onPress={() => {}}
            accessibilityViewIsModal
            style={{
              backgroundColor: c.paper,
              borderTopLeftRadius: radius.sheet,
              borderTopRightRadius: radius.sheet,
              paddingBottom: 24,
              paddingHorizontal: metrics.gutter,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Pressable
                onPress={close}
                hitSlop={metrics.hitSlop}
                accessibilityRole="button"
                accessibilityLabel={t.cancel}
                style={{ minHeight: 44, justifyContent: 'center' }}
              >
                <Text style={[ui(15, 500), { color: c.ink3 }]}>{t.cancel}</Text>
              </Pressable>
              <Pressable
                onPress={confirm}
                hitSlop={metrics.hitSlop}
                accessibilityRole="button"
                accessibilityLabel={t.done}
                style={{ minHeight: 44, justifyContent: 'center' }}
              >
                <Text style={[ui(15, 600), { color: c.ink }]}>{t.done}</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={draft ?? pending.base}
              mode="datetime"
              display="spinner"
              is24Hour
              themeVariant={dark ? 'dark' : 'light'}
              onChange={(_e, d) => {
                if (d) setDraft(d);
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    ) : null;

  return { open, element };
}

function SelectChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { c, ui, chipPadding } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      android_ripple={null}
      style={{
        height: 34,
        paddingHorizontal: chipPadding + 2,
        borderRadius: radius.chip,
        borderWidth: 1,
        borderColor: active ? c.ink : c.rule,
        backgroundColor: active ? c.ink : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={[ui(13, 500), { color: active ? c.paper : c.ink2, lineHeight: undefined }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function DueDatePicker({ value, someday = false, onChange }: Props) {
  const { c, t, ui, mono, ar, rtl } = useTheme();
  const picker = useDateTimePicker();

  const preset =
    value == null
      ? someday
        ? 'someday'
        : 'none'
      : value === todayAt(9, 0)
        ? 'today'
        : value === thisEvening()
          ? 'evening'
          : value === tomorrowMorning()
            ? 'tomorrow'
            : value === nextWeek()
              ? 'nextWeek'
              : 'custom';

  const summary =
    value != null
      ? `${formatDay(new Date(value), t, ar)} · ${formatTime(value, ar)}`
      : someday
        ? t.someday
        : t.noDueDate;

  const openExact = () => {
    const base = value != null ? new Date(value) : new Date(todayAt(9, 0));
    picker.open(base, (d) => onChange(d.getTime(), false));
  };

  const chips: { key: string; label: string; onPress: () => void }[] = [
    { key: 'today', label: t.today, onPress: () => onChange(todayAt(9, 0), false) },
    { key: 'evening', label: t.thisEvening, onPress: () => onChange(thisEvening(), false) },
    { key: 'tomorrow', label: t.tomorrow, onPress: () => onChange(tomorrowMorning(), false) },
    { key: 'nextWeek', label: t.nextWeek, onPress: () => onChange(nextWeek(), false) },
    { key: 'someday', label: t.someday, onPress: () => onChange(null, true) },
    { key: 'none', label: t.noDueDate, onPress: () => onChange(null, false) },
  ];

  return (
    <View style={{ gap: 12 }}>
      <Text
        style={[
          mono(13, 500),
          { color: value != null ? c.ink : c.ink3, textAlign: align(rtl), writingDirection: rtl ? 'rtl' : 'ltr' },
        ]}
      >
        {summary}
      </Text>

      <View style={{ flexDirection: row(rtl), flexWrap: 'wrap', gap: 8 }}>
        {chips.map((chip) => (
          <SelectChip
            key={chip.key}
            label={chip.label}
            active={preset === chip.key}
            onPress={chip.onPress}
          />
        ))}
        <SelectChip label={t.pickDate} active={preset === 'custom'} onPress={openExact} />
      </View>

      {picker.element}
    </View>
  );
}

export function DueDatePickerModal({
  value,
  someday = false,
  onChange,
  onClose,
}: Props & { onClose: () => void }) {
  const { c, t, mono, reduced, rtl } = useTheme();
  return (
    <Modal transparent animationType={reduced ? 'none' : 'fade'} onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel={t.cancel}
        style={{ flex: 1, backgroundColor: `${c.ink}66`, justifyContent: 'flex-end' }}
      >
        <Pressable
          onPress={() => {}}
          accessibilityViewIsModal
          style={{
            backgroundColor: c.paper,
            borderTopLeftRadius: radius.sheet,
            borderTopRightRadius: radius.sheet,
            paddingTop: 20,
            paddingBottom: 28,
            paddingHorizontal: metrics.gutter,
            gap: 16,
          }}
        >
          <View
            style={{
              flexDirection: row(rtl),
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text style={[mono(11, 500, 0.1, true), { color: c.ink3 }]}>{t.dueDate}</Text>
            <Pressable
              onPress={onClose}
              hitSlop={metrics.hitSlop}
              accessibilityRole="button"
              accessibilityLabel={t.done}
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              <Text style={[mono(12, 500), { color: c.ink }]}>{t.done}</Text>
            </Pressable>
          </View>
          <DueDatePicker value={value} someday={someday} onChange={onChange} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}
