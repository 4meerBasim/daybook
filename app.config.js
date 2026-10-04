const appJson = require('./app.json');

module.exports = () => {
  const expo = { ...appJson.expo };
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (apiKey) {
    expo.android = {
      ...expo.android,
      config: {
        ...(expo.android && expo.android.config),
        googleMaps: { apiKey },
      },
    };
  }
  // Google Sign-In needs the reversed-iOS-client-id URL scheme on iOS. Derive it
  // from the env var so no client id is hard-coded; when it is unset the plugin is
  // omitted entirely (Android still autolinks the native module; sign-in simply
  // no-ops until EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID is configured at runtime).
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (iosClientId) {
    const iosUrlScheme =
      'com.googleusercontent.apps.' + iosClientId.replace(/\.apps\.googleusercontent\.com$/, '');
    expo.plugins = [
      ...(expo.plugins || []),
      ['@react-native-google-signin/google-signin', { iosUrlScheme }],
    ];
  }
  return { ...appJson, expo };
};
