import { useEffect, useRef, useState } from 'react';
import { AppState, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import type { Session } from '@supabase/supabase-js';
import { fontAssets } from './src/theme/fonts';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { StoreProvider, useStore } from './src/state/store';
import { bootstrapPersistence, Snapshot } from './src/lib/db';
import { Root } from './src/navigation/Root';
import { LockGate } from './src/components/LockGate';
import { useReminderSync } from './src/hooks/useReminderSync';
import { supabase } from './src/lib/supabase';
import { getCurrentSession, onAuthChange } from './src/lib/auth';

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  const systemDark = useColorScheme() === 'dark';
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    void bootstrapPersistence().then(setSnapshot);
  }, []);

  if (!fontsLoaded || !snapshot) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider systemDark={systemDark} initial={snapshot.settings}>
          <StoreProvider initial={snapshot.store}>
            <ReminderSync />
            <AuthSync />
            <ThemedStatusBar />
            <LockGate>
              <Root />
            </LockGate>
          </StoreProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ReminderSync() {
  useReminderSync();
  return null;
}

function AuthSync() {
  const store = useStore();
  const setSessionRef = useRef(store.setSession);
  setSessionRef.current = store.setSession;

  useEffect(() => {
    const apply = (session: Session | null) =>
      setSessionRef.current(
        session ? { userId: session.user.id, email: session.user.email ?? null } : null
      );
    void getCurrentSession().then(apply);
    const unsubscribe = onAuthChange(apply);
    const sub = AppState.addEventListener('change', (state) => {
      if (!supabase) return;
      if (state === 'active') void supabase.auth.startAutoRefresh();
      else void supabase.auth.stopAutoRefresh();
    });
    return () => {
      unsubscribe();
      sub.remove();
    };
  }, []);

  return null;
}

function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? 'light' : 'dark'} />;
}
