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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider systemDark={systemDark}>
          <SQLiteProvider databaseName={DB_NAME} onInit={initDatabase}>
            <StoreProvider>
              <ThemedStatusBar />
              <Root />
            </StoreProvider>
          </SQLiteProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function ThemedStatusBar() {
  const { dark } = useTheme();
  return <StatusBar style={dark ? 'light' : 'dark'} />;
}
