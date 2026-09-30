import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { ListKey } from '../data/seed';
import { Screen } from '../components/Screen';
import { TabBar, TabKey } from '../components/TabBar';
import { TodayScreen } from '../screens/TodayScreen';
import { RecentScreen } from '../screens/RecentScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { InboxEmptyScreen } from '../screens/InboxEmptyScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProjectScreen } from '../screens/ProjectScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { HabitScreen } from '../screens/HabitScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PageClosedScreen } from '../screens/PageClosedScreen';
import { SwipeStatesScreen } from '../screens/SwipeStatesScreen';
import { AddKind, QuickAddSheet } from '../screens/QuickAddSheet';

export type RootParams = {
  Onboarding: undefined;
  Main: undefined;
  Calendar: undefined;
  Project: { projectId: string | null; list?: ListKey };
  TaskDetail: { taskId: string };
  Focus: undefined;
  Habit: { habitId: string };
  Settings: undefined;
  PageClosed: undefined;
  SwipeStates: undefined;
  InboxEmpty: undefined;
};

const Stack = createNativeStackNavigator<RootParams>();

function MainTabs({ navigation }: NativeStackScreenProps<RootParams, 'Main'>) {
  const [tab, setTab] = useState<TabKey>('today');
  const [adding, setAdding] = useState<AddKind | null>(null);

  const openProject = (list: ListKey) => (projectId: string | null) =>
    navigation.navigate('Project', { projectId, list });

  return (
    <Screen>
      {tab === 'today' ? (
        <TodayScreen
          onStamp={() => navigation.navigate('PageClosed')}
          onOpenProject={openProject('today')}
          onOpenHabit={(habitId) => navigation.navigate('Habit', { habitId })}
          onAddProject={() => setAdding('project')}
          onAddHabit={() => setAdding('habit')}
        />
      ) : null}
      {tab === 'recent' ? (
        <RecentScreen
          onOpenTask={(taskId) => navigation.navigate('TaskDetail', { taskId })}
          onPickDate={() => navigation.navigate('Calendar')}
        />
      ) : null}
      {tab === 'inbox' ? <InboxScreen onOpenProject={openProject('inbox')} onAddProject={() => setAdding('project')} /> : null}
      {tab === 'profile' ? (
        <ProfileScreen
          onOpenProject={() => navigation.navigate('Project', { projectId: 'studio' })}
          onOpenSettings={() => navigation.navigate('Settings')}
        />
      ) : null}

      <TabBar
        active={tab}
        onSelect={setTab}
        onPen={() => setAdding('task')}
        onLongPress={(k) => {
          if (k === 'today') navigation.navigate('Settings');
          if (k === 'inbox') navigation.navigate('InboxEmpty');
        }}
      />

      {adding ? <QuickAddSheet initialKind={adding} onClose={() => setAdding(null)} /> : null}
    </Screen>
  );
}

export function Root() {
  const { c } = useTheme();

  const navTheme = {
    ...DefaultTheme,
    colors: { ...DefaultTheme.colors, background: c.paper, card: c.paper, text: c.ink, border: c.rule },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.paper } }}>
        <Stack.Screen name="Onboarding">
          {({ navigation }) => <OnboardingScreen onStart={() => navigation.replace('Main')} />}
        </Stack.Screen>
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="Calendar" component={CalendarScreen} />
        <Stack.Screen name="Project" component={ProjectScreen} />
        <Stack.Screen name="TaskDetail">
          {({ navigation, route }) => (
            <TaskDetailScreen
              taskId={route.params.taskId}
              onBack={() => navigation.goBack()}
              onFocus={() => navigation.navigate('Focus')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Focus" options={{ presentation: 'fullScreenModal' }}>
          {({ navigation }) => <FocusScreen onClose={() => navigation.goBack()} />}
        </Stack.Screen>
        <Stack.Screen name="Habit" options={{ presentation: 'fullScreenModal' }}>
          {({ navigation, route }) => (
            <HabitScreen habitId={route.params.habitId} onClose={() => navigation.goBack()} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Settings">
          {({ navigation }) => <SettingsScreen onOpenGestures={() => navigation.navigate('SwipeStates')} />}
        </Stack.Screen>
        <Stack.Screen name="PageClosed">
          {({ navigation }) => <PageClosedScreen onPlanTomorrow={() => navigation.goBack()} />}
        </Stack.Screen>
        <Stack.Screen name="SwipeStates" component={SwipeStatesScreen} />
        <Stack.Screen name="InboxEmpty" component={InboxEmptyScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
