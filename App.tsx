import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { fontAssets } from './src/theme/fonts';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { StoreProvider } from './src/state/store';
import { bootstrapPersistence, Snapshot } from './src/lib/db';
import { Root } from './src/navigation/Root';
import { LockGate } from './src/components/LockGate';
import { useReminderSync } from './src/hooks/useReminderSync';

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

function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? 'light' : 'dark'} />;
}
