import React, { useEffect, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeProvider';
import { duration, easing } from '../theme/tokens';
import { row } from '../lib/rtl';
import { Screen } from '../components/Screen';
import { TabBar, TabKey } from '../components/TabBar';
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
import { PageClosedScreen } from '../screens/PageClosedScreen';
import { SwipeStatesScreen } from '../screens/SwipeStatesScreen';
import { QuickAddSheet } from '../screens/QuickAddSheet';

export type RootParams = {
  Onboarding: undefined;
  Main: undefined;
  Calendar: undefined;
  Project: { projectId: string };
  Projects: undefined;
  Unfiled: undefined;
  TaskDetail: undefined;
  Focus: undefined;
  Settings: undefined;
  PageClosed: undefined;
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
            onStamp={() => navigation.navigate('PageClosed')}
            onOpenTask={() => navigation.navigate('TaskDetail')}
            onPickDate={() => navigation.navigate('Calendar')}
          />
        </Pane>
        <Pane width={width} shown={tab === 'upcoming'}>
          <UpcomingScreen onOpenTask={() => navigation.navigate('TaskDetail')} />
        </Pane>
        <Pane width={width} shown={tab === 'profile'}>
          <ProfileScreen
            onOpenGestures={() => navigation.navigate('SwipeStates')}
            onOpenProjects={() => navigation.navigate('Projects')}
            onOpenUnfiled={() => navigation.navigate('Unfiled')}
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
          if (k === 'today') navigation.navigate('Settings');
          if (k === 'upcoming') navigation.navigate('Calendar');
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
              onOpenTask={() => navigation.navigate('TaskDetail')}
            />
          )}
        </Stack.Screen>
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
          {({ navigation }) => (
            <SettingsScreen
              onOpenGestures={() => navigation.navigate('SwipeStates')}
              onOpenProjects={() => navigation.navigate('Projects')}
              onOpenUnfiled={() => navigation.navigate('Unfiled')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="PageClosed">
          {({ navigation }) => <PageClosedScreen onPlanTomorrow={() => navigation.goBack()} />}
        </Stack.Screen>
        <Stack.Screen name="SwipeStates" component={SwipeStatesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
