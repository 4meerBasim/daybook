import { registerRootComponent } from 'expo';
import { I18nManager } from 'react-native';

import App from './App';

// the app mirrors itself in styles from its own `lang`, so the native direction has to stay
// LTR — otherwise an RTL device makes every `row(rtl)` container flip twice
I18nManager.allowRTL(false);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
