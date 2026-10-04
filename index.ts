import { registerRootComponent } from 'expo';
import { Platform } from 'react-native';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

// Headless handler that renders the Android home-screen widget. Only Android links
// the native module; importing it elsewhere (or in Expo Go without a dev build) would
// throw at load, so it is required lazily behind a platform guard and swallowed.
if (Platform.OS === 'android') {
  try {
    const { registerWidgetTaskHandler } = require('react-native-android-widget');
    const { widgetTaskHandler } = require('./src/widget/widget-task-handler');
    registerWidgetTaskHandler(widgetTaskHandler);
  } catch {
    // Native widget module unavailable (e.g. Expo Go / no dev build) — widget simply absent.
  }
}
