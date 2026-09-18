import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { Screen } from '../components/Screen';
import { TabBar, TabKey } from '../components/TabBar';
import { TodayScreen } from '../screens/TodayScreen';
import { UpcomingScreen } from '../screens/UpcomingScreen';
import { InboxScreen } from '../screens/InboxScreen';
import { InboxEmptyScreen } from '../screens/InboxEmptyScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProjectScreen } from '../screens/ProjectScreen';
import { TaskDetailScreen } from '../screens/TaskDetailScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { FocusScreen } from '../screens/FocusScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PageClosedScreen } from '../screens/PageClosedScreen';
import { SwipeStatesScreen } from '../screens/SwipeStatesScreen';
import { QuickAddSheet } from '../screens/QuickAddSheet';

export type RootParams = {
  Onboarding: undefined;
  Main: undefined;
  Calendar: undefined;
  Project: undefined;
  TaskDetail: undefined;
  Focus: undefined;
  Settings: undefined;
  PageClosed: undefined;
  SwipeStates: undefined;
  InboxEmpty: undefined;
};

const Stack = createNativeStackNavigator<RootParams>();

function MainTabs({ navigation }: { navigation: { navigate: (r: keyof RootParams) => void } }) {
  const [tab, setTab] = useState<TabKey>('today');
  const [adding, setAdding] = useState(false);

  return (
    <Screen>
      {tab === 'today' ? (
        <TodayScreen
          onStamp={() => navigation.navigate('PageClosed')}
          onOpenTask={() => navigation.navigate('TaskDetail')}
          onPickDate={() => navigation.navigate('Calendar')}
        />
      ) : null}
      {tab === 'upcoming' ? <UpcomingScreen /> : null}
      {tab === 'inbox' ? <InboxScreen /> : null}
      {tab === 'search' ? <SearchScreen onOpenProject={() => navigation.navigate('Project')} /> : null}

      <TabBar
        active={tab}
        onSelect={setTab}
        onPen={() => setAdding(true)}
        onLongPress={(k) => {
          if (k === 'today') navigation.navigate('Settings');
          if (k === 'upcoming') navigation.navigate('Calendar');
          if (k === 'inbox') navigation.navigate('InboxEmpty');
        }}
      />

      <QuickAddSheet open={adding} onClose={() => setAdding(false)} />
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
          {({ navigation }) => (
            <TaskDetailScreen
              onBack={() => navigation.goBack()}
              onFocus={() => navigation.navigate('Focus')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Focus" options={{ presentation: 'fullScreenModal' }}>
          {({ navigation }) => <FocusScreen onClose={() => navigation.goBack()} />}
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
