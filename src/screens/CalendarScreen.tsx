import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  Pressable,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootParams } from '../navigation/Root';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { align, insetEnd, insetStart, marginStart, pad, row } from '../lib/rtl';
import { formatTime, nextWeek, startOfToday, toArabicDigits, tomorrowMorning } from '../lib/day';
import { useStore, useTasks } from '../state/store';
import type { Task } from '../data/seed';
import { isSeedTaskId } from '../data/seed';
import { Screen, useHeaderTop } from '../components/Screen';
import { TallyMarks } from '../components/TallyMarks';
import { CheckIcon, ChevronBackIcon } from '../components/Icon';
import { useDeviceCalendarEvents } from '../hooks/useDeviceCalendarEvents';
import type { DeviceEvent } from '../lib/deviceCalendar';

type Rect = { x: number; y: number; w: number; h: number };
type DayRect = Rect & { n: number };

type Cell = {
  n: number;
  count: number;
  isToday: boolean;
  isPast: boolean;
  hasEvents: boolean;
} | null;

const OVERLAY_W = 200;
const MORNING_HOUR = 9;

function accentColor(c: ReturnType<typeof useTheme>['c'], task: Task): string | undefined {
  return task.color ? c[task.color] : undefined;
}

export function CalendarScreen() {
  const { c, t, ar, rtl, reduced, display, ui, mono } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootParams>>();
  const { sel, setSel, done, ensureTask, setDue, setTaskReminder } = useStore();
  const tasks = useTasks();
  const top = useHeaderTop();
  const bottomInset = useSafeAreaInsets().bottom;

  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay() + 6) % 7;

  const now = new Date();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;
  const todayN = isCurrentMonth ? now.getDate() : -1;
  const selN = Math.min(sel, daysInMonth);

  const selectedOnMount = useRef(false);
  useEffect(() => {
    if (selectedOnMount.current) return;
    selectedOnMount.current = true;
    if (isCurrentMonth) setSel(now.getDate());
  }, [isCurrentMonth, setSel]);

  const monthStart = useMemo(() => new Date(year, month, 1, 0, 0, 0, 0), [year, month]);
  const monthEnd = useMemo(
    () => new Date(year, month, daysInMonth, 23, 59, 59, 999),
    [year, month, daysInMonth]
  );
  const events = useDeviceCalendarEvents(monthStart, monthEnd);

  const { counts, eventDays, selectedTasks, selectedEvents, unscheduled } = useMemo(() => {
    const counts: Record<number, number> = {};
    const eventDays = new Set<number>();
    const selectedTasks: Task[] = [];
    const unscheduled: Task[] = [];
    for (const k of tasks) {
      if (k.dueAt == null) {
        if (!done[k.id]) unscheduled.push(k);
        continue;
      }
      const d = new Date(k.dueAt);
      if (d.getFullYear() === year && d.getMonth() === month) {
        counts[d.getDate()] = (counts[d.getDate()] ?? 0) + 1;
        if (d.getDate() === selN) selectedTasks.push(k);
      }
    }
    selectedTasks.sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0));

    const selectedEvents: DeviceEvent[] = [];
    for (const ev of events) {
      const startDate = new Date(ev.start);
      const endSrc = ev.allDay ? ev.end - 1 : ev.end;
      const endDate = new Date(Math.max(endSrc, ev.start));
      const cur = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      const last = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
      let guard = 0;
      while (cur <= last && guard < 366) {
        if (cur.getFullYear() === year && cur.getMonth() === month) {
          eventDays.add(cur.getDate());
          if (cur.getDate() === selN) selectedEvents.push(ev);
        }
        cur.setDate(cur.getDate() + 1);
        guard++;
      }
    }
    selectedEvents.sort((a, b) => Number(b.allDay) - Number(a.allDay) || a.start - b.start);

    return { counts, eventDays, selectedTasks, selectedEvents, unscheduled };
  }, [tasks, done, events, year, month, selN]);

  const cells: Cell[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      n: d,
      count: counts[d] ?? 0,
      isToday: d === todayN,
      isPast: isCurrentMonth && d < todayN,
      hasEvents: eventDays.has(d),
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const dayRefs = useRef<Map<number, View | null>>(new Map());
  const dayRects = useSharedValue<DayRect[]>([]);
  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragActive = useSharedValue(0);
  const [dragCard, setDragCard] = useState<Task | null>(null);

  useEffect(() => {
    dayRects.value = [];
  }, [year, month, dayRects]);

  const measureDay = useCallback(
    (n: number) => {
      const node = dayRefs.current.get(n);
      node?.measureInWindow((x, y, w, h) => {
        const arr = dayRects.value.slice();
        const i = arr.findIndex((r) => r.n === n);
        const rect: DayRect = { n, x, y, w, h };
        if (i >= 0) arr[i] = rect;
        else arr.push(rect);
        dayRects.value = arr;
      });
    },
    [dayRects]
  );

  const measureAllDays = useCallback(() => {
    for (let n = 1; n <= daysInMonth; n++) measureDay(n);
  }, [daysInMonth, measureDay]);

  const schedule = useCallback(
    (task: Task, y: number, m: number, day: number) => {
      const prevDue = task.dueAt ?? null;
      const base = prevDue != null ? new Date(prevDue) : null;
      const target = new Date(
        y,
        m,
        day,
        base ? base.getHours() : MORNING_HOUR,
        base ? base.getMinutes() : 0,
        base ? base.getSeconds() : 0,
        0
      ).getTime();
      if (isSeedTaskId(task.id)) ensureTask(task);
      setDue(task.id, target, false);
      const prevReminder = task.reminderAt ?? null;
      if (prevReminder != null && prevDue != null) {
        setTaskReminder(task.id, prevReminder + (target - prevDue));
      }
      if (!reduced) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [ensureTask, setDue, setTaskReminder, reduced]
  );

  const openTask = useCallback(
    (id: string) => navigation.navigate('TaskDetail', { taskId: id }),
    [navigation]
  );

  const beginDrag = useCallback(
    (task: Task) => {
      setDragCard(task);
      measureAllDays();
      if (!reduced) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [measureAllDays, reduced]
  );

  const endDrag = useCallback(() => setDragCard(null), []);

  const dropTask = useCallback(
    (task: Task, dayN: number) => schedule(task, year, month, dayN),
    [schedule, year, month]
  );

  const handleAction = useCallback(
    (task: Task, e: AccessibilityActionEvent) => {
      const name = e.nativeEvent.actionName;
      if (name === 'open') {
        openTask(task.id);
        return;
      }
      const src =
        name === 'today'
          ? startOfToday()
          : name === 'tomorrow'
            ? tomorrowMorning()
            : name === 'nextweek'
              ? nextWeek()
              : null;
      if (src == null) return;
      const d = new Date(src);
      schedule(task, d.getFullYear(), d.getMonth(), d.getDate());
    },
    [schedule, openTask]
  );

  const dragActions = useMemo<AccessibilityActionInfo[]>(
    () => [
      { name: 'open', label: t.openTask },
      { name: 'today', label: t.scheduleOnDay.replace('{day}', t.today) },
      { name: 'tomorrow', label: t.scheduleOnDay.replace('{day}', t.tomorrow) },
      { name: 'nextweek', label: t.scheduleOnDay.replace('{day}', t.nextWeek) },
    ],
    [t]
  );

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: dragActive.value,
    transform: [
      { translateX: dragX.value - OVERLAY_W / 2 },
      { translateY: dragY.value - 26 },
      { scale: reduced ? 1 : 1.04 },
    ],
  }));

  const goPrev = useCallback(() => setMonthCursor(new Date(year, month - 1, 1)), [year, month]);
  const goNext = useCallback(() => setMonthCursor(new Date(year, month + 1, 1)), [year, month]);

  const dragAccent = dragCard ? accentColor(c, dragCard) : undefined;

  const dragShared = { dayRects, dragX, dragY, dragActive };
  const dragHandlers = {
    onOpen: openTask,
    onBeginDrag: beginDrag,
    onDrop: dropTask,
    onEndDrag: endDrag,
    onAction: handleAction,
  };

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: top,
            paddingHorizontal: metrics.gutter,
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Pressable
            onPress={() => navigation.goBack()}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.back}
            hitSlop={metrics.hitSlop}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronBackIcon color={c.ink} flip={rtl} />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={goPrev}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.months[(month + 11) % 12]}
            hitSlop={metrics.hitSlop}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronBackIcon color={c.ink2} flip={rtl} />
          </Pressable>
          <Pressable
            onPress={goNext}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.months[(month + 1) % 12]}
            hitSlop={metrics.hitSlop}
            style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <ChevronBackIcon color={c.ink2} flip={!rtl} />
          </Pressable>
        </View>

        <View
          style={{
            paddingHorizontal: metrics.gutter,
            paddingBottom: 8,
            flexDirection: row(rtl),
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <Text
            maxFontSizeMultiplier={1.3}
            style={[display(40, { lineHeight: 44 }), { color: c.ink, textAlign: align(rtl) }]}
          >
            {t.months[month]}
          </Text>
          <Text style={[mono(13, 500), { color: c.ink3, paddingBottom: 6 }]}>
            {toArabicDigits(year, ar)}
          </Text>
        </View>

        <View
          style={{
            flexDirection: row(rtl),
            paddingHorizontal: 12,
            borderBottomWidth: 1,
            borderBottomColor: c.rule,
          }}
        >
          {t.wd.map((w, i) => (
            <Text
              key={i}
              style={[mono(11, 500), { flex: 1, textAlign: 'center', color: c.ink3, paddingVertical: 6 }]}
            >
              {w}
            </Text>
          ))}
        </View>

        <View key={`${year}-${month}`} style={{ paddingHorizontal: 12, paddingTop: 4 }}>
          {weeks.map((week, wi) => (
            <View key={wi} style={{ flexDirection: row(rtl) }}>
              {week.map((cell, ci) => {
                if (!cell) return <View key={ci} style={{ flex: 1, height: 56 }} />;
                const selected = cell.n === selN;
                const fg = cell.isToday ? c.ver : cell.isPast ? c.ink3 : c.ink;
                const tallyColor = cell.isToday ? c.ver : c.ink2;
                return (
                  <Pressable
                    key={ci}
                    ref={(node) => {
                      dayRefs.current.set(cell.n, node as View | null);
                    }}
                    onLayout={() => measureDay(cell.n)}
                    collapsable={false}
                    onPress={() => setSel(cell.n)}
                    android_ripple={null}
                    accessibilityRole="button"
                    accessibilityLabel={`${t.months[month]} ${toArabicDigits(cell.n, ar)}`}
                    accessibilityState={{ selected }}
                    style={{
                      flex: 1,
                      height: 56,
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      borderRadius: 8,
                      backgroundColor: selected ? c.paper2 : 'transparent',
                    }}
                  >
                    {cell.hasEvents ? (
                      <View
                        style={[
                          {
                            position: 'absolute',
                            top: 6,
                            width: 5,
                            height: 5,
                            borderRadius: 2.5,
                            backgroundColor: c.blue,
                          },
                          insetEnd(rtl, 8),
                        ]}
                      />
                    ) : null}
                    <Text
                      style={[
                        mono(15, 500),
                        {
                          color: fg,
                          borderBottomWidth: 1.5,
                          borderBottomColor: cell.isToday ? c.ver : 'transparent',
                        },
                      ]}
                    >
                      {toArabicDigits(cell.n, ar)}
                    </Text>
                    <View style={{ height: 8, justifyContent: 'flex-end' }}>
                      <TallyMarks count={cell.count} color={tallyColor} max={5} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={{ flex: 1, borderTopWidth: 1, borderTopColor: c.rule, marginTop: 8 }}>
          <View
            style={[
              { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: c.ver, opacity: 0.6 },
              insetStart(rtl, metrics.marginLine),
            ]}
          />
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                {
                  height: 56,
                  flexDirection: row(rtl),
                  alignItems: 'baseline',
                  gap: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: c.rule,
                },
                pad(rtl, 66, metrics.gutter),
              ]}
            >
              <Text
                accessibilityRole="header"
                style={[display(20, { weight: 400, italic: true }), { color: c.ink }]}
              >
                {`${t.months[month]} ${toArabicDigits(selN, ar)}`}
              </Text>
              <View style={{ flex: 1 }} />
              <Text style={[mono(12, 500), { color: c.ink3 }]}>
                {toArabicDigits(selectedTasks.length, ar)}
              </Text>
            </View>

            {selectedTasks.length === 0 ? (
              <View
                style={[
                  { height: 56, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: c.rule },
                  pad(rtl, 66, metrics.gutter),
                ]}
              >
                <Text style={[ui(15, 400), { color: c.ink3, textAlign: align(rtl) }]}>
                  {t.noTasksThisDay}
                </Text>
              </View>
            ) : (
              selectedTasks.map((task) => {
                const isDone = !!done[task.id];
                return (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    dragging={dragCard?.id === task.id}
                    actions={dragActions}
                    accessibilityLabel={isDone ? `${task.title}, ${t.done}` : task.title}
                    shared={dragShared}
                    handlers={dragHandlers}
                    style={[
                      {
                        flexDirection: row(rtl),
                        alignItems: 'center',
                        gap: 14,
                        height: 56,
                        borderBottomWidth: 1,
                        borderBottomColor: c.rule,
                        backgroundColor: c.paper,
                      },
                      pad(rtl, 16, metrics.gutter),
                    ]}
                  >
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderWidth: 1.5,
                        borderColor: c.ink,
                        borderRadius: 4,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: isDone ? c.ink : 'transparent',
                      }}
                    >
                      {isDone ? <CheckIcon color={c.paper} /> : null}
                    </View>
                    <Text
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.6}
                      style={[
                        ui(17),
                        {
                          flex: 1,
                          color: isDone ? c.ink3 : c.ink,
                          textAlign: align(rtl),
                          textDecorationLine: isDone ? 'line-through' : 'none',
                        },
                        marginStart(rtl, 16),
                      ]}
                    >
                      {task.title}
                    </Text>
                    {task.dueAt != null ? (
                      <Text style={[mono(12, 500), { color: c.ink3 }]}>
                        {formatTime(task.dueAt, ar)}
                      </Text>
                    ) : null}
                  </DraggableTask>
                );
              })
            )}

            {selectedEvents.length > 0 ? (
              <>
                <View
                  style={[
                    { height: 40, justifyContent: 'flex-end', paddingBottom: 6 },
                    pad(rtl, 66, metrics.gutter),
                  ]}
                >
                  <Text
                    accessibilityRole="header"
                    style={[mono(10, 600, 0.08, true), { color: c.ink3, textAlign: align(rtl) }]}
                  >
                    {t.events}
                  </Text>
                </View>
                {selectedEvents.map((ev) => (
                  <View
                    key={ev.id}
                    accessibilityRole="text"
                    accessibilityLabel={`${ev.title}, ${ev.allDay ? t.allDayEvent : formatTime(ev.start, ar)}`}
                    style={[
                      {
                        flexDirection: row(rtl),
                        alignItems: 'center',
                        gap: 14,
                        minHeight: 48,
                        borderBottomWidth: 1,
                        borderBottomColor: c.rule,
                      },
                      pad(rtl, 16, metrics.gutter),
                    ]}
                  >
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: ev.color ?? c.blue,
                      }}
                    />
                    <Text
                      numberOfLines={1}
                      maxFontSizeMultiplier={1.6}
                      style={[ui(16), { flex: 1, color: c.ink2, textAlign: align(rtl) }, marginStart(rtl, 16)]}
                    >
                      {ev.title}
                    </Text>
                    <Text style={[mono(12, 500), { color: c.ink3 }]}>
                      {ev.allDay ? t.allDayEvent : formatTime(ev.start, ar)}
                    </Text>
                  </View>
                ))}
              </>
            ) : null}
          </ScrollView>
        </View>

        {unscheduled.length > 0 ? (
          <View
            style={{
              borderTopWidth: 1,
              borderTopColor: c.rule,
              backgroundColor: c.paper2,
              paddingTop: 10,
              paddingBottom: bottomInset + 10,
            }}
          >
            <Text
              accessibilityRole="header"
              style={[
                mono(10, 600, 0.08, true),
                { color: c.ink3, paddingHorizontal: metrics.gutter, paddingBottom: 8, textAlign: align(rtl) },
              ]}
            >
              {t.unscheduled}
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: row(rtl),
                gap: 8,
                paddingHorizontal: metrics.gutter,
              }}
            >
              {unscheduled.map((task) => {
                const accent = accentColor(c, task);
                return (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    dragging={dragCard?.id === task.id}
                    actions={dragActions}
                    accessibilityLabel={task.title}
                    shared={dragShared}
                    handlers={dragHandlers}
                    style={{
                      minHeight: 44,
                      maxWidth: 190,
                      justifyContent: 'center',
                      backgroundColor: c.card,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: c.rule,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                    }}
                  >
                    <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
                      {accent ? (
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: accent }} />
                      ) : null}
                      <Text
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.4}
                        style={[ui(14, 500, 18), { color: c.ink, textAlign: align(rtl) }]}
                      >
                        {task.title}
                      </Text>
                    </View>
                  </DraggableTask>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>

      {dragCard ? (
        <Animated.View
          pointerEvents="none"
          accessible={false}
          importantForAccessibility="no-hide-descendants"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              width: OVERLAY_W,
              backgroundColor: c.card,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: c.ink,
              paddingVertical: 10,
              paddingHorizontal: 12,
            },
            reduced
              ? null
              : {
                  shadowColor: c.ink,
                  shadowOpacity: 0.3,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 10,
                },
            overlayStyle,
          ]}
        >
          <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
            {dragAccent ? (
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dragAccent }} />
            ) : null}
            <Text
              numberOfLines={1}
              style={[ui(14, 500, 18), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
            >
              {dragCard.title}
            </Text>
          </View>
        </Animated.View>
      ) : null}
    </Screen>
  );
}

type DragShared = {
  dayRects: SharedValue<DayRect[]>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  dragActive: SharedValue<number>;
};

type DragHandlers = {
  onOpen: (id: string) => void;
  onBeginDrag: (task: Task) => void;
  onDrop: (task: Task, dayN: number) => void;
  onEndDrag: () => void;
  onAction: (task: Task, e: AccessibilityActionEvent) => void;
};

function DraggableTask({
  task,
  dragging,
  actions,
  accessibilityLabel,
  shared,
  handlers,
  style,
  children,
}: {
  task: Task;
  dragging: boolean;
  actions: AccessibilityActionInfo[];
  accessibilityLabel: string;
  shared: DragShared;
  handlers: DragHandlers;
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
}) {
  const { t, reduced } = useTheme();
  const { dayRects, dragX, dragY, dragActive } = shared;
  const { onOpen, onBeginDrag, onDrop, onEndDrag, onAction } = handlers;

  const taskRef = useRef(task);
  taskRef.current = task;

  const open = useCallback(() => onOpen(taskRef.current.id), [onOpen]);
  const begin = useCallback(() => onBeginDrag(taskRef.current), [onBeginDrag]);
  const end = useCallback(() => onEndDrag(), [onEndDrag]);
  const drop = useCallback((dayN: number) => onDrop(taskRef.current, dayN), [onDrop]);

  const gesture = useMemo(() => {
    const tap = Gesture.Tap()
      .maxDuration(260)
      .onEnd((_e, success) => {
        if (success) scheduleOnRN(open);
      });

    const pan = Gesture.Pan()
      .activateAfterLongPress(reduced ? 150 : 190)
      .onStart((e) => {
        dragActive.value = 1;
        dragX.value = e.absoluteX;
        dragY.value = e.absoluteY;
        scheduleOnRN(begin);
      })
      .onUpdate((e) => {
        dragX.value = e.absoluteX;
        dragY.value = e.absoluteY;
      })
      .onEnd((e) => {
        const rects = dayRects.value;
        let hit = -1;
        for (let i = 0; i < rects.length; i++) {
          const r = rects[i];
          if (
            r &&
            r.w > 0 &&
            e.absoluteX >= r.x &&
            e.absoluteX <= r.x + r.w &&
            e.absoluteY >= r.y &&
            e.absoluteY <= r.y + r.h
          ) {
            hit = r.n;
            break;
          }
        }
        if (hit > 0) scheduleOnRN(drop, hit);
      })
      .onFinalize(() => {
        dragActive.value = 0;
        scheduleOnRN(end);
      });

    return Gesture.Exclusive(pan, tap);
  }, [reduced, dragActive, dragX, dragY, dayRects, open, begin, drop, end]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={t.dragTaskHint}
        accessibilityActions={actions}
        onAccessibilityAction={(e) => onAction(taskRef.current, e)}
        style={[style, { opacity: dragging ? 0.4 : 1 }]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
