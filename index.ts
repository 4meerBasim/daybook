import { registerRootComponent } from 'expo';
import { I18nManager } from 'react-native';

import App from './App';

// style-level mirroring assumes native LTR; an RTL device flips rows and swaps left/right edges on top of it
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
