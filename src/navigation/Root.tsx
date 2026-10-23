import React, { useEffect, useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import {
  NavigationContainer,
  DefaultTheme,
  useNavigationContainerRef,
  useNavigationState,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { useStore } from '../state/store';
import { duration, easing } from '../theme/tokens';
import { row } from '../lib/rtl';
import { startOfDay } from '../lib/date';
import { Screen, useScreenBottom } from '../components/Screen';
import { InkSlip } from '../components/InkSlip';
import { EscapeSheet } from '../components/EscapeSheet';
import { prepareChannels, reschedule } from '../lib/reminders';
import { clearSession, remainingSeconds, showSession } from '../lib/focus';
import { TabBar, TabKey, useTabBarFootprint } from '../components/TabBar';
import { TodayScreen } from '../screens/TodayScreen';
import { UpcomingScreen } from '../screens/UpcomingScreen';
import { SearchResults } from '../screens/SearchResults';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProjectScreen } from '../screens/ProjectScreen';
import { ProjectsScreen } from '../screens/ProjectsScreen';
import { UnfiledScreen } from '../screens/UnfiledScreen';
import { SEED_PROJECT_ID } from '../db/seed';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ClosePageScreen } from '../screens/ClosePageScreen';
import { PageClosedScreen } from '../screens/PageClosedScreen';
import { ClosedPagesScreen } from '../screens/ClosedPagesScreen';
import { WeeklyScreen } from '../screens/WeeklyScreen';
import { DealScreen } from '../screens/DealScreen';
import { NotesScreen } from '../screens/NotesScreen';
import { NoteScreen } from '../screens/NoteScreen';
import { BrainDumpScreen } from '../screens/BrainDumpScreen';
import { SwipeStatesScreen } from '../screens/SwipeStatesScreen';
import { QuickAddSheet } from '../screens/QuickAddSheet';

export type RootParams = {
  Onboarding: undefined;
  Main: undefined;
  Calendar: undefined;
  Project: { projectId: string };
  Projects: undefined;
  Unfiled: undefined;
  TaskDetail: { taskId: string };
  Focus: { taskId: string };
  Settings: undefined;
  ClosePage: undefined;
  PageClosed: { day: number };
  ClosedPages: undefined;
  Weekly: undefined;
  Deal: undefined;
  Notes: undefined;
  Note: { noteId: string };
  BrainDump: undefined;
  SwipeStates: undefined;
};

const TABS: TabKey[] = ['today', 'upcoming', 'profile'];

const Stack = createNativeStackNavigator<RootParams>();

function MainTabs({ navigation }: NativeStackScreenProps<RootParams, 'Main'>) {
  const { rtl, reduced } = useTheme();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<TabKey>('today');
  const [adding, setAdding] = useState(false);
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const index = TABS.indexOf(tab);
  const offset = -(rtl ? TABS.length - 1 - index : index) * width;
  const x = useSharedValue(offset);
  const searchProgress = useSharedValue(0);

  useEffect(() => {
    x.value = reduced
      ? offset
      : withTiming(offset, { duration: duration.page, easing: easing.standard });
  }, [offset, reduced]);

  useEffect(() => {
    const target = searching ? 1 : 0;
    searchProgress.value = reduced
      ? target
      : withTiming(target, { duration: duration.page, easing: easing.standard });
  }, [searching, reduced]);

  const slide = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <Screen>
      <Animated.View
        style={[
          { flex: 1, flexDirection: row(rtl), width: width * TABS.length },
          slide,
        ]}
      >
        <Pane width={width} shown={tab === 'today'}>
          <TodayScreen
            onClose={() => navigation.navigate('ClosePage')}
            onOpenClosed={(day) => navigation.navigate('PageClosed', { day })}
            onOpenTask={(taskId) => navigation.navigate('TaskDetail', { taskId })}
          />
        </Pane>
        <Pane width={width} shown={tab === 'upcoming'}>
          <UpcomingScreen
            onOpenTask={(taskId) => navigation.navigate('TaskDetail', { taskId })}
          />
        </Pane>
        <Pane width={width} shown={tab === 'profile'}>
          <ProfileScreen
            onOpenGestures={() => navigation.navigate('SwipeStates')}
            onOpenProjects={() => navigation.navigate('Projects')}
            onOpenUnfiled={() => navigation.navigate('Unfiled')}
            onOpenClosedPages={() => navigation.navigate('ClosedPages')}
            onOpenWeekly={() => navigation.navigate('Weekly')}
            onOpenNotes={() => navigation.navigate('Notes')}
          />
        </Pane>
      </Animated.View>

      <SearchResults
        progress={searchProgress}
        visible={searching}
        onOpenProject={() => navigation.navigate('Project', { projectId: SEED_PROJECT_ID })}
      />

      <TabBar
        active={tab}
        onSelect={setTab}
        onAdd={() => setAdding(true)}
        onLongPress={(k) => {
          if (k === 'add') navigation.navigate('BrainDump');
          if (k === 'today') navigation.navigate('Settings');
          if (k === 'upcoming') navigation.navigate('Calendar');
          if (k === 'profile') navigation.navigate('Deal');
        }}
        searching={searching}
        searchProgress={searchProgress}
        query={query}
        onQuery={setQuery}
        onSearchOpen={() => setSearching(true)}
        onSearchClose={() => {
          setSearching(false);
          setQuery('');
        }}
      />

      <QuickAddSheet open={adding} onClose={() => setAdding(false)} />
    </Screen>
  );
}

const NO_SLIP: (keyof RootParams)[] = [
  'Onboarding',
  'Focus',
  'PageClosed',
  'ClosePage',
  'Deal',
];

function GlobalSlip() {
  const route = useNavigationState((state) =>
    state ? (state.routes[state.index].name as keyof RootParams) : undefined
  );
  const footprint = useTabBarFootprint();
  const bottom = useScreenBottom();

  if (!route || NO_SLIP.includes(route)) return null;
  return <InkSlip bottom={route === 'Main' ? footprint : bottom} />;
}

function Pane({
  width,
  shown,
  children,
}: {
  width: number;
  shown: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={{ width }}
      accessibilityElementsHidden={!shown}
      importantForAccessibility={shown ? 'auto' : 'no-hide-descendants'}
    >
      {children}
    </View>
  );
}

function SharedCapture({ onCaptured }: { onCaptured: () => void }) {
  const { captureShared } = useStore();

  useEffect(() => {
    const take = (url: string | null) => {
      if (!url) return;
      const { queryParams } = Linking.parse(url);
      const text = queryParams?.text;
      if (typeof text !== 'string' || !text.trim()) return;
      captureShared(text);
      onCaptured();
    };

    Linking.getInitialURL().then(take);
    const opened = Linking.addEventListener('url', (event) => take(event.url));
    return () => opened.remove();
  }, [captureShared, onCaptured]);

  return null;
}

function SessionNotice() {
  const { t } = useTheme();
  const { session, remindersOn } = useStore();

  useEffect(() => {
    if (!session || !remindersOn) {
      clearSession();
      return;
    }

    const title = t.focus;
    showSession(title, session, Date.now(), t);
    if (session.pausedAt) return;

    const tick = setInterval(() => {
      const now = Date.now();
      if (remainingSeconds(session, now) <= 0) {
        clearSession();
        clearInterval(tick);
        return;
      }
      showSession(title, session, now, t);
    }, 30_000);

    return () => clearInterval(tick);
  }, [session, remindersOn, t]);

  return null;
}

function Reminders() {
  const { t } = useTheme();
  const { reminders, remindersOn, revision, escaping, escape, closeEscape, openEscape } =
    useStore();

  useEffect(() => {
    if (!remindersOn) {
      Notifications.cancelAllScheduledNotificationsAsync();
      return;
    }
    prepareChannels();
    reschedule(reminders, Date.now(), t);
  }, [remindersOn, revision, t]);

  useEffect(() => {
    const tapped = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as {
        taskId?: string;
        insistent?: boolean;
      };
      if (data.insistent && data.taskId) openEscape(data.taskId);
    });
    return () => tapped.remove();
  }, [openEscape]);

  if (!escaping) return null;

  return (
    <EscapeSheet
      task={escaping}
      onDoIt={closeEscape}
      onEscape={(reason) => escape(escaping.id, reason)}
    />
  );
}

export function Root() {
  const { c } = useTheme();
  const { loaded, onboarded, markOnboarded } = useStore();
  const rootRef = useNavigationContainerRef<RootParams>();

  const navTheme = useMemo(
    () => ({
      ...DefaultTheme,
      colors: { ...DefaultTheme.colors, background: c.paper, card: c.paper, text: c.ink, border: c.rule },
    }),
    [c]
  );

  // initialRouteName is only read on first mount
  if (!loaded) return null;

  return (
    <NavigationContainer ref={rootRef} theme={navTheme}>
      <Stack.Navigator
        initialRouteName={onboarded ? 'Main' : 'Onboarding'}
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.paper } }}
      >
        <Stack.Screen name="Onboarding">
          {({ navigation }) => (
            <OnboardingScreen
              onStart={() => {
                markOnboarded();
                navigation.replace('Main');
              }}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Calendar">
          {({ navigation }) => (
            <CalendarScreen onOpenWeek={() => navigation.navigate('Weekly')} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Weekly">
          {({ navigation }) => <WeeklyScreen onBack={() => navigation.goBack()} />}
        </Stack.Screen>
        <Stack.Screen name="Notes">
          {({ navigation }) => (
            <NotesScreen
              onBack={() => navigation.goBack()}
              onOpenNote={(noteId) => navigation.navigate('Note', { noteId })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Note">
          {({ navigation, route }) => (
            <NoteScreen
              noteId={route.params.noteId}
              onBack={() => navigation.goBack()}
              onOpenTask={(taskId) => navigation.navigate('TaskDetail', { taskId })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="BrainDump">
          {({ navigation }) => (
            <BrainDumpScreen
              onBack={() => navigation.goBack()}
              onCommitted={(noteId) => navigation.replace('Note', { noteId })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Deal" options={{ presentation: 'fullScreenModal' }}>
          {({ navigation }) => (
            <DealScreen
              onClose={() => navigation.goBack()}
              onFocus={(taskId) => navigation.replace('Focus', { taskId })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Project">
          {({ route }) => <ProjectScreen projectId={route.params.projectId} />}
        </Stack.Screen>
        <Stack.Screen name="Projects">
          {({ navigation }) => (
            <ProjectsScreen
              onOpenProject={(projectId) => navigation.navigate('Project', { projectId })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Unfiled">
          {({ navigation }) => (
            <UnfiledScreen
              onBack={() => navigation.goBack()}
              onOpenTask={(taskId) => navigation.navigate('TaskDetail', { taskId })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="TaskDetail">
          {({ navigation, route }) => (
            <TaskDetailScreen
              taskId={route.params.taskId}
              onBack={() => navigation.goBack()}
              onFocus={() => navigation.navigate('Focus', { taskId: route.params.taskId })}
              onOpenNote={(noteId) => navigation.navigate('Note', { noteId })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Focus" options={{ presentation: 'fullScreenModal' }}>
          {({ navigation, route }) => (
            <FocusScreen taskId={route.params.taskId} onClose={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {({ navigation }) => (
            <SettingsScreen
              onOpenGestures={() => navigation.navigate('SwipeStates')}
              onOpenProjects={() => navigation.navigate('Projects')}
              onOpenUnfiled={() => navigation.navigate('Unfiled')}
              onOpenClosedPages={() => navigation.navigate('ClosedPages')}
              onOpenWeekly={() => navigation.navigate('Weekly')}
              onOpenNotes={() => navigation.navigate('Notes')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ClosePage">
          {({ navigation }) => (
            <ClosePageScreen
              onBack={() => navigation.goBack()}
              onClosed={() =>
                navigation.replace('PageClosed', { day: startOfDay(Date.now()) })
              }
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="PageClosed">
          {({ navigation, route }) => (
            <PageClosedScreen
              day={route.params.day}
              onBack={() => navigation.goBack()}
              onPlanTomorrow={() => navigation.goBack()}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="ClosedPages">
          {({ navigation }) => (
            <ClosedPagesScreen
              onBack={() => navigation.goBack()}
              onOpenDay={(day) => navigation.navigate('PageClosed', { day })}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="SwipeStates" component={SwipeStatesScreen} />
      </Stack.Navigator>
      <GlobalSlip />
      <Reminders />
      <SessionNotice />
      <SharedCapture onCaptured={() => rootRef.current?.navigate('Unfiled')} />
    </NavigationContainer>
  );
}
