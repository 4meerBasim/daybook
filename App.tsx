import type { ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { fontAssets } from './src/theme/fonts';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { DB_NAME, migrate } from './src/db/schema';
import { seedFirstRun } from './src/db/seed';
import { StoreProvider } from './src/state/store';
import { Root } from './src/navigation/Root';

async function initDatabase(db: SQLiteDatabase) {
  await migrate(db);
  await seedFirstRun(db);
}

export default function App() {
  const [fontsLoaded] = useFonts(fontAssets);
  const systemDark = useColorScheme() === 'dark';

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider systemDark={systemDark}>
        <Shell>
          <SQLiteProvider databaseName={DB_NAME} onInit={initDatabase}>
            <StoreProvider>
              <ThemedStatusBar />
              <Root />
            </StoreProvider>
          </SQLiteProvider>
        </Shell>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: c.paper }}>
      {children}
    </GestureHandlerRootView>
  );
}

function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? 'light' : 'dark'} />;
}
