import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { useHabits, useJournals, useProjects, useStore, useTasks } from '../state/store';
import { requestNotificationPermission } from '../lib/notifications';
import { authenticate, isBiometricAvailable } from '../lib/biometrics';
import { ExportData, ExportFormat, exportData } from '../lib/export';
import { JournalPrefs, loadSnapshot } from '../lib/db';
import { isSyncConfigured } from '../lib/supabase';
import { syncNow } from '../lib/sync';
import { joinSharedList } from '../lib/shared';
import {
  getCalendarAccessStatus,
  listDeviceCalendars,
  requestCalendarAccess,
} from '../lib/deviceCalendar';
import { Screen, useHeaderTop } from '../components/Screen';
import { Segmented } from '../components/Segmented';
import { Toggle } from '../components/Toggle';
import { Checkbox, Dot } from '../components/Ledger';

function parseTime(time: string): { hour: number; minute: number } {
  const [h, m] = time.split(':');
  return { hour: Number(h), minute: Number(m) };
}

export function SettingsScreen({ onOpenGestures }: { onOpenGestures: () => void }) {
  const { c, t, lang, appearance, motion, ui, display, rtl, setLang, setAppearance, setMotion } =
    useTheme();
  const top = useHeaderTop();
  const store = useStore();
  const {
    contextEnabled,
    setContextEnabled,
    reminderEnabled,
    reminderTime,
    setReminder,
    onThisDayEnabled,
    setOnThisDay,
    deviceCalendarEnabled,
    setDeviceCalendarEnabled,
    deviceCalendarIds,
    setDeviceCalendarIds,
    appLockEnabled,
    setAppLockEnabled,
    syncEnabled,
    setSyncEnabled,
    ensureOwnerId,
    lastSyncAt,
    setLastSyncAt,
    hydrate,
  } = store;
  const tasks = useTasks();
  const projects = useProjects();
  const journals = useJournals();
  const habits = useHabits();
  const [denied, setDenied] = useState(false);
  const [lockUnavailable, setLockUnavailable] = useState(false);
  const [calDenied, setCalDenied] = useState(false);
  const [calStatus, setCalStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [calendars, setCalendars] = useState<{ id: string; title: string; color?: string }[]>([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const remindersOn = reminderEnabled || onThisDayEnabled;
  const syncConfigured = isSyncConfigured();
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (!deviceCalendarEnabled) {
      setCalStatus('undetermined');
      setCalendars([]);
      return;
    }
    let mounted = true;
    (async () => {
      const status = await getCalendarAccessStatus();
      if (!mounted) return;
      setCalStatus(status);
      if (status !== 'granted') {
        setCalDenied(status === 'denied');
        setCalendars([]);
        return;
      }
      setCalDenied(false);
      const list = await listDeviceCalendars();
      if (mounted) setCalendars(list);
    })();
    return () => {
      mounted = false;
    };
  }, [deviceCalendarEnabled]);

  const ensurePermission = async (): Promise<boolean> => {
    const granted = await requestNotificationPermission();
    setDenied(!granted);
    return granted;
  };

  const toggleReminder = async (v: boolean) => {
    if (Platform.OS === 'web') return;
    if (v && !(await ensurePermission())) return;
    setReminder(v, reminderTime);
  };

  const toggleOnThisDay = async (v: boolean) => {
    if (Platform.OS === 'web') return;
    if (v && !(await ensurePermission())) return;
    setOnThisDay(v);
  };

  const toggleReminders = async (v: boolean) => {
    if (Platform.OS === 'web') return;
    if (v) {
      if (!(await ensurePermission())) return;
      setReminder(true, reminderTime);
    } else {
      setReminder(false, reminderTime);
      setOnThisDay(false);
    }
  };

  const toggleDeviceCalendar = async (v: boolean) => {
    if (Platform.OS === 'web') return;
    if (v) {
      const granted = await requestCalendarAccess();
      setCalDenied(!granted);
      if (!granted) return;
      setDeviceCalendarEnabled(true);
    } else {
      setCalDenied(false);
      setDeviceCalendarEnabled(false);
    }
  };

  const toggleCalendar = (id: string) => {
    if (deviceCalendarIds.includes(id)) {
      setDeviceCalendarIds(deviceCalendarIds.filter((x) => x !== id));
    } else {
      setDeviceCalendarIds([...deviceCalendarIds, id]);
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    setShowTimePicker(false);
    if (event.type !== 'set' || !date) return;
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    setReminder(reminderEnabled, `${hh}:${mm}`);
  };

  const toggleAppLock = async (v: boolean) => {
    if (!v) {
      setAppLockEnabled(false);
      setLockUnavailable(false);
      return;
    }
    if (Platform.OS === 'web' || !(await isBiometricAvailable())) {
      setLockUnavailable(true);
      return;
    }
    if (!(await authenticate(t.appLock))) return;
    setLockUnavailable(false);
    setAppLockEnabled(true);
  };

  const reloadStore = async () => {
    const snap = await loadSnapshot();
    hydrate(snap.store);
  };

  const runSync = async () => {
    if (!syncConfigured) {
      setSyncMsg(t.syncNotConfigured);
      return;
    }
    const ownerId = ensureOwnerId();
    setSyncBusy(true);
    setSyncMsg(t.syncing);
    const res = await syncNow({
      ownerId,
      since: lastSyncAt,
      setLastSync: setLastSyncAt,
      onApplied: reloadStore,
    });
    setSyncBusy(false);
    setSyncMsg(res.ok ? t.syncComplete : res.reason === 'unconfigured' ? t.syncNotConfigured : t.syncFailed);
  };

  const toggleSync = (v: boolean) => {
    if (v && !syncConfigured) {
      setSyncMsg(t.syncNotConfigured);
      return;
    }
    setSyncEnabled(v);
    if (v) {
      ensureOwnerId();
      void runSync();
    }
  };

  const submitJoin = async () => {
    const code = joinCode.trim();
    setJoining(false);
    setJoinCode('');
    if (!code) return;
    if (!syncConfigured) {
      setSyncMsg(t.syncNotConfigured);
      return;
    }
    const ownerId = ensureOwnerId();
    const projectId = await joinSharedList(code, ownerId, reloadStore);
    setSyncMsg(projectId ? t.joinedSharedList : t.joinFailed);
  };

  const onExport = async (format: ExportFormat) => {
    const prefs: JournalPrefs = {
      currentJournalId: store.currentJournalId,
      contextEnabled,
      reminderEnabled,
      reminderTime,
      onThisDayEnabled,
      deviceCalendarEnabled,
      deviceCalendarIds,
      appLockEnabled,
      syncEnabled,
      syncOwnerId: store.syncOwnerId,
      lastSyncAt,
    };
    const data: ExportData = {
      tasks,
      projects,
      entries: store.entries,
      journals,
      habits,
      subtasks: store.subtasks,
      smartLists: store.smartLists,
      attachments: store.attachments,
      focusSessions: store.focusSessions,
      prefs,
      done: store.done,
    };
    const ok = await exportData(format, data, t);
    if (!ok) Alert.alert(t.exportUnavailable);
  };

  return (
    <Screen>
      <ScrollView>
        <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.settings}
          </Text>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: c.rule }}>
          <Row
            onPress={() => setLang(lang === 'en' ? 'ar' : 'en')}
            label={`${t.language}: ${t.langLabel}`}
          >
            <RowLabel label={t.language} />
            <Text style={[ui(15), { color: c.ink3 }]}>{t.langLabel}</Text>
          </Row>

          <Row>
            <RowLabel label={t.appearance} />
            <Segmented
              options={[
                { key: 'light', label: t.light },
                { key: 'dark', label: t.dark },
                { key: 'auto', label: t.auto },
              ]}
              value={appearance}
              onChange={setAppearance}
            />
          </Row>

          <Row>
            <RowLabel label={t.weekStart} />
            <Text style={[ui(15), { color: c.ink3 }]}>{t.weekStartLabel}</Text>
          </Row>

          <GroupHeader label={t.reminders} />

          <ToggleRow
            title={t.enableReminders}
            subtitle={t.enableRemindersDesc}
            value={remindersOn}
            onChange={toggleReminders}
          />

          <GroupHeader label={t.journaling} />

          <ToggleRow
            title={t.dailyReminder}
            subtitle={t.dailyReminderDesc}
            trailing={reminderTime}
            onTrailingPress={Platform.OS === 'web' ? undefined : () => setShowTimePicker(true)}
            trailingLabel={t.reminderTime}
            value={reminderEnabled}
            onChange={toggleReminder}
          />

          {showTimePicker ? (
            <DateTimePicker
              value={(() => {
                const { hour, minute } = parseTime(reminderTime);
                const d = new Date();
                d.setHours(hour, minute, 0, 0);
                return d;
              })()}
              mode="time"
              onChange={onTimeChange}
              accessibilityLabel={t.reminderTime}
            />
          ) : null}

          <ToggleRow
            title={t.contextMetadata}
            subtitle={t.contextMetadataDesc}
            value={contextEnabled}
            onChange={setContextEnabled}
          />

          <ToggleRow
            title={t.onThisDayNotify}
            subtitle={t.onThisDayNotifyDesc}
            value={onThisDayEnabled}
            onChange={toggleOnThisDay}
          />

          {denied ? <HelperText label={t.notificationsDenied} /> : null}

          <GroupHeader label={t.calendarSection} />

          <ToggleRow
            title={t.deviceCalendar}
            subtitle={t.deviceCalendarDesc}
            value={deviceCalendarEnabled}
            onChange={toggleDeviceCalendar}
          />

          {calDenied ? <HelperText label={t.calendarPermissionDenied} /> : null}

          {deviceCalendarEnabled && calStatus === 'granted' ? (
            calendars.length ? (
              <>
                <CalendarPickRow
                  label={t.allCalendars}
                  checked={deviceCalendarIds.length === 0}
                  onPress={() => setDeviceCalendarIds([])}
                />
                {calendars.map((cal) => (
                  <CalendarPickRow
                    key={cal.id}
                    label={cal.title}
                    color={cal.color}
                    checked={deviceCalendarIds.includes(cal.id)}
                    onPress={() => toggleCalendar(cal.id)}
                  />
                ))}
              </>
            ) : (
              <HelperText label={t.noCalendars} />
            )
          ) : null}

          <GroupHeader label={t.security} />

          <ToggleRow
            title={t.appLock}
            subtitle={t.appLockDesc}
            value={appLockEnabled}
            onChange={toggleAppLock}
          />

          {lockUnavailable ? <HelperText label={t.appLockUnavailable} /> : null}

          <Row>
            <RowLabel label={t.textSize} />
            <Text style={[ui(15), { color: c.ink3 }]}>{t.system}</Text>
          </Row>

          <Row>
            <RowLabel label={t.reduceMotion} />
            <Toggle
              value={motion === 'reduced'}
              onChange={(v) => setMotion(v ? 'reduced' : 'full')}
              accessibilityLabel={t.reduceMotion}
            />
          </Row>

          <Row>
            <RowLabel label={t.sync} />
            <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 6 }}>
              <Dot color={c.moss} />
              <Text style={[ui(15), { color: c.moss }]}>{t.syncedAgo}</Text>
            </View>
          </Row>

          <Row onPress={onOpenGestures} label={t.shortcuts}>
            <RowLabel label={t.shortcuts} />
            <View style={{ flexDirection: row(rtl), gap: 4 }}>
              <Keycap label="⌘" />
              <Keycap label="N" />
            </View>
          </Row>

          <Row>
            <RowLabel label={t.sharing} />
            <Text style={[ui(15), { color: c.ink3 }]}>{t.sharingVal}</Text>
          </Row>

          <GroupHeader label={t.data} />

          <Row onPress={() => onExport('json')} label={t.exportJson}>
            <RowLabel label={t.exportJson} />
            <Text style={[ui(15), { color: c.blue }]}>JSON</Text>
          </Row>

          <Row onPress={() => onExport('markdown')} label={t.exportMarkdown}>
            <RowLabel label={t.exportMarkdown} />
            <Text style={[ui(15), { color: c.blue }]}>MD</Text>
          </Row>

          <GroupHeader label={t.cloudSync} />

          <ToggleRow
            title={t.enableSync}
            subtitle={t.enableSyncDesc}
            value={syncEnabled}
            onChange={toggleSync}
          />

          <Row onPress={syncBusy ? undefined : runSync} label={t.syncNow}>
            <RowLabel label={t.syncNow} />
            <Text style={[ui(15), { color: syncBusy ? c.ink3 : c.blue }]}>
              {syncBusy ? t.syncing : t.syncNow}
            </Text>
          </Row>

          <Row
            onPress={() => {
              if (!syncConfigured) {
                setSyncMsg(t.syncNotConfigured);
                return;
              }
              setJoining((v) => !v);
            }}
            label={t.joinSharedList}
          >
            <RowLabel label={t.joinSharedList} />
            <Text style={[ui(15), { color: c.blue }]}>+</Text>
          </Row>

          {joining ? (
            <View
              style={{
                flexDirection: row(rtl),
                alignItems: 'center',
                gap: 12,
                paddingHorizontal: metrics.gutter,
                borderBottomWidth: 1,
                borderBottomColor: c.rule,
                minHeight: metrics.row,
              }}
            >
              <TextInput
                value={joinCode}
                onChangeText={setJoinCode}
                onSubmitEditing={submitJoin}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="done"
                placeholder={t.enterShareCode}
                placeholderTextColor={c.ink3}
                selectionColor={c.ink}
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={[ui(17), { flex: 1, color: c.ink, padding: 0, textAlign: align(rtl) }]}
              />
              <Pressable
                onPress={submitJoin}
                accessibilityRole="button"
                accessibilityLabel={t.join}
                hitSlop={metrics.hitSlop}
                android_ripple={null}
                style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }}
              >
                <Text style={[ui(15), { color: c.blue }]}>{t.join}</Text>
              </Pressable>
            </View>
          ) : null}

          {syncMsg ? <HelperText label={syncMsg} /> : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function Row({
  children,
  onPress,
  label,
}: {
  children: React.ReactNode;
  onPress?: () => void;
  label?: string;
}) {
  const { c, rtl } = useTheme();
  const style = {
    height: metrics.row,
    flexDirection: row(rtl),
    alignItems: 'center' as const,
    paddingHorizontal: metrics.gutter,
    borderBottomWidth: 1,
    borderBottomColor: c.rule,
  };

  if (!onPress) return <View style={style}>{children}</View>;

  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={style}
    >
      {children}
    </Pressable>
  );
}

function RowLabel({ label }: { label: string }) {
  const { c, ui, rtl } = useTheme();
  return (
    <Text
      numberOfLines={1}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
    >
      {label}
    </Text>
  );
}

function Keycap({ label }: { label: string }) {
  const { c, mono } = useTheme();
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: c.rule,
        borderRadius: radius.checkbox,
        paddingHorizontal: 5,
        paddingVertical: 1,
      }}
    >
      <Text style={[mono(12, 500), { color: c.ink3, lineHeight: undefined }]}>{label}</Text>
    </View>
  );
}

function GroupHeader({ label }: { label: string }) {
  const { c, mono, rtl } = useTheme();
  return (
    <View
      style={{
        flexDirection: row(rtl),
        paddingHorizontal: metrics.gutter,
        paddingTop: 22,
        paddingBottom: 8,
      }}
    >
      <Text style={[mono(11, 500, 0.1, true), { color: c.ink3 }]}>{label}</Text>
    </View>
  );
}

function ToggleRow({
  title,
  subtitle,
  trailing,
  onTrailingPress,
  trailingLabel,
  value,
  onChange,
}: {
  title: string;
  subtitle?: string;
  trailing?: string;
  onTrailingPress?: () => void;
  trailingLabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { c, ui, rtl } = useTheme();
  return (
    <View
      style={{
        minHeight: metrics.row,
        flexDirection: row(rtl),
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: metrics.gutter,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          style={[ui(17), { color: c.ink, textAlign: align(rtl) }]}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[ui(13, 400, 18), { color: c.ink3, textAlign: align(rtl), marginTop: 2 }]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing ? (
        onTrailingPress ? (
          <Pressable
            onPress={onTrailingPress}
            accessibilityRole="button"
            accessibilityLabel={trailingLabel}
            hitSlop={metrics.hitSlop}
            android_ripple={null}
            style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 4 }}
          >
            <Text style={[ui(15), { color: c.blue }]}>{trailing}</Text>
          </Pressable>
        ) : (
          <Text style={[ui(15), { color: c.ink3 }]}>{trailing}</Text>
        )
      ) : null}
      <Toggle value={value} onChange={onChange} accessibilityLabel={title} />
    </View>
  );
}

function CalendarPickRow({
  label,
  color,
  checked,
  onPress,
}: {
  label: string;
  color?: string;
  checked: boolean;
  onPress: () => void;
}) {
  const { c, ui, rtl } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      android_ripple={null}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        {
          minHeight: 44,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: 12,
          paddingVertical: 10,
          borderBottomWidth: 1,
          borderBottomColor: c.rule,
          backgroundColor: pressed ? c.paper2 : 'transparent',
        },
        pad(rtl, metrics.gutter, metrics.gutter),
      ]}
    >
      <Checkbox checked={checked} />
      {color ? <Dot color={color} /> : null}
      <Text
        numberOfLines={1}
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[ui(17), { flex: 1, color: c.ink, textAlign: align(rtl) }, marginStart(rtl, 4)]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HelperText({ label }: { label: string }) {
  const { c, ui, rtl } = useTheme();
  return (
    <View
      style={{
        flexDirection: row(rtl),
        paddingHorizontal: metrics.gutter,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: c.rule,
      }}
    >
      <Text
        maxFontSizeMultiplier={maxFontSizeMultiplier}
        style={[ui(13, 400, 18), { flex: 1, color: c.ver, textAlign: align(rtl) }]}
      >
        {label}
      </Text>
    </View>
  );
}
