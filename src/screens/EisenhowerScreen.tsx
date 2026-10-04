import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  AccessibilityActionEvent,
  AccessibilityActionInfo,
  Pressable,
  Text,
  View,
} from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector, ScrollView } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootParams } from '../navigation/Root';
import { useTheme } from '../theme/ThemeProvider';
import type { Palette } from '../theme/palette';
import { maxFontSizeMultiplier, metrics, priorityColors, radius } from '../theme/tokens';
import { align, pad, row } from '../lib/rtl';
import { useStore, useTasks } from '../state/store';
import type { Task } from '../data/seed';
import { Screen, useHeaderTop } from '../components/Screen';
import { ChevronBackIcon } from '../components/Icon';

type Rect = { x: number; y: number; w: number; h: number };

type Quad = {
  key: string;
  title: string;
  important: boolean;
  urgent: boolean;
  fg: keyof Palette;
  bg: keyof Palette;
};

const OVERLAY_W = 208;
const EMPTY_RECT: Rect = { x: 0, y: 0, w: 0, h: 0 };

function quadOf(task: Task, quads: Quad[]): number {
  const important = !!task.important;
  const urgent = !!task.urgent;
  return quads.findIndex((q) => q.important === important && q.urgent === urgent);
}

function accentColor(c: Palette, task: Task): string | undefined {
  if (task.color) return c[task.color];
  if (task.priority && task.priority !== 'none') return c[priorityColors[task.priority].fg];
  return undefined;
}

export function EisenhowerScreen() {
  const { c, t, rtl, reduced, display, ui, mono } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootParams>>();
  const { done, cleared, ensureTask, setEisenhower } = useStore();
  const allTasks = useTasks();
  const top = useHeaderTop();

  const quads = useMemo<Quad[]>(
    () => [
      { key: 'do', title: t.quadrantDo, important: true, urgent: true, fg: 'ver', bg: 'verS' },
      { key: 'schedule', title: t.quadrantSchedule, important: true, urgent: false, fg: 'blue', bg: 'blueS' },
      { key: 'delegate', title: t.quadrantDelegate, important: false, urgent: true, fg: 'och', bg: 'ochS' },
      { key: 'eliminate', title: t.quadrantEliminate, important: false, urgent: false, fg: 'moss', bg: 'mossS' },
    ],
    [t]
  );

  const visible = useMemo(
    () => allTasks.filter((k) => !done[k.id] && !cleared[k.id]),
    [allTasks, done, cleared]
  );

  const grouped = useMemo(() => {
    const buckets: Task[][] = [[], [], [], []];
    for (const task of visible) {
      const idx = quadOf(task, quads);
      if (idx >= 0) buckets[idx].push(task);
    }
    return buckets;
  }, [visible, quads]);

  const quadRefs = useRef<Array<View | null>>([null, null, null, null]);
  const quadRects = useSharedValue<Rect[]>([EMPTY_RECT, EMPTY_RECT, EMPTY_RECT, EMPTY_RECT]);

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragActive = useSharedValue(0);

  const [dragCard, setDragCard] = useState<Task | null>(null);

  const measureQuad = useCallback(
    (i: number) => {
      const node = quadRefs.current[i];
      node?.measureInWindow((x, y, w, h) => {
        const next = quadRects.value.slice();
        next[i] = { x, y, w, h };
        quadRects.value = next;
      });
    },
    [quadRects]
  );

  const openTask = useCallback(
    (id: string) => navigation.navigate('TaskDetail', { taskId: id }),
    [navigation]
  );

  const commit = useCallback(
    (task: Task, important: boolean, urgent: boolean) => {
      if (!task.id.startsWith('a')) {
        ensureTask({ ...task, important, urgent });
      }
      setEisenhower(task.id, important, urgent);
    },
    [ensureTask, setEisenhower]
  );

  const moveTask = useCallback(
    (task: Task, targetIndex: number) => {
      const q = quads[targetIndex];
      if (!q) return;
      if (!!task.important === q.important && !!task.urgent === q.urgent) return;
      commit(task, q.important, q.urgent);
      if (!reduced) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [quads, commit, reduced]
  );

  const beginDrag = useCallback(
    (task: Task) => {
      setDragCard(task);
      if (!reduced) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [reduced]
  );

  const endDrag = useCallback(() => setDragCard(null), []);

  const dropTask = useCallback(
    (task: Task, targetIndex: number, sourceIndex: number) => {
      if (targetIndex !== sourceIndex) moveTask(task, targetIndex);
    },
    [moveTask]
  );

  const handleAction = useCallback(
    (task: Task, e: AccessibilityActionEvent) => {
      const name = e.nativeEvent.actionName;
      const idx = quads.findIndex((q) => q.key === name);
      if (idx >= 0) moveTask(task, idx);
    },
    [quads, moveTask]
  );

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: dragActive.value,
    transform: [
      { translateX: dragX.value - OVERLAY_W / 2 },
      { translateY: dragY.value - 26 },
      { scale: reduced ? 1 : 1.04 },
    ],
  }));

  const dragAccent = dragCard ? accentColor(c, dragCard) : undefined;
  const rotate = rtl ? '90deg' : '-90deg';

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <View
          style={{
            paddingTop: top,
            paddingHorizontal: metrics.gutter,
            paddingBottom: 6,
            flexDirection: row(rtl),
            alignItems: 'center',
            gap: 6,
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
          <Text
            maxFontSizeMultiplier={maxFontSizeMultiplier}
            style={[display(24), { color: c.ink, textAlign: align(rtl), flex: 1 }]}
          >
            {t.eisenhower}
          </Text>
        </View>

        <Text
          style={[
            ui(13, 400),
            { color: c.ink3, paddingHorizontal: metrics.gutter, paddingBottom: 10, textAlign: align(rtl) },
          ]}
        >
          {t.dragHint}
        </Text>

        {visible.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: metrics.gutter }}>
            <Text style={[ui(15, 400), { color: c.ink3, textAlign: 'center' }]}>{t.emptyMatrix}</Text>
          </View>
        ) : (
          <>
            <View
              style={{
                flexDirection: row(rtl),
                paddingHorizontal: metrics.gutter,
                paddingBottom: 4,
              }}
            >
              <View style={{ width: 18 }} />
              <Text
                style={[mono(10, 600, 0.08, true), { flex: 1, color: c.ink3, textAlign: 'center' }]}
              >
                {t.urgent}
              </Text>
              <Text
                style={[mono(10, 600, 0.08, true), { flex: 1, color: c.ink3, textAlign: 'center' }]}
              >
                {t.notUrgent}
              </Text>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: row(rtl),
                paddingHorizontal: metrics.gutter,
                paddingBottom: metrics.gutter,
                gap: 6,
              }}
            >
              <View style={{ width: 18 }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text
                    numberOfLines={1}
                    style={[mono(10, 600, 0.08, true), { width: 120, color: c.ink3, textAlign: 'center', transform: [{ rotate: rotate }] }]}
                  >
                    {t.importantLabel}
                  </Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text
                    numberOfLines={1}
                    style={[mono(10, 600, 0.08, true), { width: 120, color: c.ink3, textAlign: 'center', transform: [{ rotate: rotate }] }]}
                  >
                    {t.notImportant}
                  </Text>
                </View>
              </View>

              <View style={{ flex: 1, gap: 6 }}>
                <View style={{ flex: 1, flexDirection: row(rtl), gap: 6 }}>
                  <Quadrant
                    quad={quads[0]}
                    index={0}
                    tasks={grouped[0]}
                    cellRef={(n) => (quadRefs.current[0] = n)}
                    onMeasure={() => measureQuad(0)}
                    quads={quads}
                    dragCardId={dragCard?.id ?? null}
                    quadRects={quadRects}
                    dragX={dragX}
                    dragY={dragY}
                    dragActive={dragActive}
                    onOpen={openTask}
                    onBeginDrag={beginDrag}
                    onDrop={dropTask}
                    onEndDrag={endDrag}
                    onAction={handleAction}
                  />
                  <Quadrant
                    quad={quads[1]}
                    index={1}
                    tasks={grouped[1]}
                    cellRef={(n) => (quadRefs.current[1] = n)}
                    onMeasure={() => measureQuad(1)}
                    quads={quads}
                    dragCardId={dragCard?.id ?? null}
                    quadRects={quadRects}
                    dragX={dragX}
                    dragY={dragY}
                    dragActive={dragActive}
                    onOpen={openTask}
                    onBeginDrag={beginDrag}
                    onDrop={dropTask}
                    onEndDrag={endDrag}
                    onAction={handleAction}
                  />
                </View>
                <View style={{ flex: 1, flexDirection: row(rtl), gap: 6 }}>
                  <Quadrant
                    quad={quads[2]}
                    index={2}
                    tasks={grouped[2]}
                    cellRef={(n) => (quadRefs.current[2] = n)}
                    onMeasure={() => measureQuad(2)}
                    quads={quads}
                    dragCardId={dragCard?.id ?? null}
                    quadRects={quadRects}
                    dragX={dragX}
                    dragY={dragY}
                    dragActive={dragActive}
                    onOpen={openTask}
                    onBeginDrag={beginDrag}
                    onDrop={dropTask}
                    onEndDrag={endDrag}
                    onAction={handleAction}
                  />
                  <Quadrant
                    quad={quads[3]}
                    index={3}
                    tasks={grouped[3]}
                    cellRef={(n) => (quadRefs.current[3] = n)}
                    onMeasure={() => measureQuad(3)}
                    quads={quads}
                    dragCardId={dragCard?.id ?? null}
                    quadRects={quadRects}
                    dragX={dragX}
                    dragY={dragY}
                    dragActive={dragActive}
                    onOpen={openTask}
                    onBeginDrag={beginDrag}
                    onDrop={dropTask}
                    onEndDrag={endDrag}
                    onAction={handleAction}
                  />
                </View>
              </View>
            </View>
          </>
        )}
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
              borderRadius: radius.chip,
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

function Quadrant({
  quad,
  index,
  tasks,
  cellRef,
  onMeasure,
  quads,
  dragCardId,
  quadRects,
  dragX,
  dragY,
  dragActive,
  onOpen,
  onBeginDrag,
  onDrop,
  onEndDrag,
  onAction,
}: {
  quad: Quad;
  index: number;
  tasks: Task[];
  cellRef: (node: View | null) => void;
  onMeasure: () => void;
  quads: Quad[];
  dragCardId: string | null;
  quadRects: SharedValue<Rect[]>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  dragActive: SharedValue<number>;
  onOpen: (id: string) => void;
  onBeginDrag: (task: Task) => void;
  onDrop: (task: Task, targetIndex: number, sourceIndex: number) => void;
  onEndDrag: () => void;
  onAction: (task: Task, e: AccessibilityActionEvent) => void;
}) {
  const { c, ui, mono, rtl } = useTheme();

  const actions = useMemo<AccessibilityActionInfo[]>(
    () => quads.filter((_, i) => i !== index).map((q) => ({ name: q.key, label: q.title })),
    [quads, index]
  );

  return (
    <View
      ref={cellRef}
      onLayout={onMeasure}
      collapsable={false}
      style={{
        flex: 1,
        backgroundColor: c.paper2,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: c.rule,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          flexDirection: row(rtl),
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: c[quad.bg],
          paddingHorizontal: 10,
          paddingVertical: 7,
          gap: 6,
        }}
      >
        <Text
          numberOfLines={1}
          maxFontSizeMultiplier={1.4}
          style={[ui(12, 600, 16), { flex: 1, color: c[quad.fg], textAlign: align(rtl) }]}
        >
          {quad.title}
        </Text>
        <Text style={[mono(11, 600), { color: c[quad.fg] }]}>{tasks.length}</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 6, gap: 6 }}
        showsVerticalScrollIndicator={false}
      >
        {tasks.map((task) => (
          <Card
            key={task.id}
            task={task}
            sourceIndex={index}
            quadTitle={quad.title}
            dimmed={dragCardId === task.id}
            actions={actions}
            quadRects={quadRects}
            dragX={dragX}
            dragY={dragY}
            dragActive={dragActive}
            onOpen={onOpen}
            onBeginDrag={onBeginDrag}
            onDrop={onDrop}
            onEndDrag={onEndDrag}
            onAction={onAction}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function Card({
  task,
  sourceIndex,
  quadTitle,
  dimmed,
  actions,
  quadRects,
  dragX,
  dragY,
  dragActive,
  onOpen,
  onBeginDrag,
  onDrop,
  onEndDrag,
  onAction,
}: {
  task: Task;
  sourceIndex: number;
  quadTitle: string;
  dimmed: boolean;
  actions: AccessibilityActionInfo[];
  quadRects: SharedValue<Rect[]>;
  dragX: SharedValue<number>;
  dragY: SharedValue<number>;
  dragActive: SharedValue<number>;
  onOpen: (id: string) => void;
  onBeginDrag: (task: Task) => void;
  onDrop: (task: Task, targetIndex: number, sourceIndex: number) => void;
  onEndDrag: () => void;
  onAction: (task: Task, e: AccessibilityActionEvent) => void;
}) {
  const { c, t, ui, mono, rtl, reduced } = useTheme();

  const taskRef = useRef(task);
  taskRef.current = task;
  const srcRef = useRef(sourceIndex);
  srcRef.current = sourceIndex;

  const open = useCallback(() => onOpen(taskRef.current.id), [onOpen]);
  const begin = useCallback(() => onBeginDrag(taskRef.current), [onBeginDrag]);
  const end = useCallback(() => onEndDrag(), [onEndDrag]);
  const drop = useCallback(
    (targetIndex: number) => onDrop(taskRef.current, targetIndex, srcRef.current),
    [onDrop]
  );

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
        const rects = quadRects.value;
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
            hit = i;
            break;
          }
        }
        if (hit >= 0) scheduleOnRN(drop, hit);
      })
      .onFinalize(() => {
        dragActive.value = 0;
        scheduleOnRN(end);
      });

    return Gesture.Exclusive(pan, tap);
  }, [reduced, dragActive, dragX, dragY, quadRects, open, begin, drop, end]);

  const dot = accentColor(c, task);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        accessibilityRole="button"
        accessibilityLabel={`${task.title}, ${quadTitle}`}
        accessibilityHint={t.dragHint}
        accessibilityActions={actions}
        onAccessibilityAction={(e) => onAction(taskRef.current, e)}
        style={[
          {
            minHeight: 44,
            justifyContent: 'center',
            backgroundColor: c.card,
            borderRadius: radius.chip,
            borderWidth: 1,
            borderColor: c.rule,
            paddingVertical: 8,
            opacity: dimmed ? 0.35 : 1,
          },
          pad(rtl, 10, 10),
        ]}
      >
        <View style={{ flexDirection: row(rtl), alignItems: 'center', gap: 8 }}>
          {dot ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: dot }} /> : null}
          <Text
            numberOfLines={2}
            maxFontSizeMultiplier={1.6}
            style={[ui(14, 500, 18), { flex: 1, color: c.ink, textAlign: align(rtl) }]}
          >
            {task.title}
          </Text>
        </View>
        {task.meta ? (
          <Text style={[mono(11, 500), { color: c.ink3, marginTop: 3, textAlign: align(rtl) }]}>
            {task.meta}
          </Text>
        ) : null}
      </Animated.View>
    </GestureDetector>
  );
}
