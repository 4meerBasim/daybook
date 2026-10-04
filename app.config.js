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
  return { ...appJson, expo };
};
