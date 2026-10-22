import type { ReactNode } from 'react';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { SQLiteProvider, type SQLiteDatabase } from 'expo-sqlite';
import { fontAssets } from './src/theme/fonts';
import { LIGHT } from './src/theme/palette';
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
      <GestureHandlerRootView
        style={{ flex: 1, backgroundColor: LIGHT.paper }}
      >
        <SQLiteProvider databaseName={DB_NAME} onInit={initDatabase}>
          <ThemeProvider systemDark={systemDark}>
            <Shell>
              <StoreProvider>
                <ThemedStatusBar />
                <Root />
              </StoreProvider>
            </Shell>
          </ThemeProvider>
        </SQLiteProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  return <View style={{ flex: 1, backgroundColor: c.paper }}>{children}</View>;
}

function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? 'light' : 'dark'} />;
}
