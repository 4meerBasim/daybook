# Auto context metadata (time, location, weather)

Status: shipped
Summary: Attaches the time, location and weather automatically to each new entry.

## Details
`captureContext()` in `src/lib/context.ts` uses `expo-location` for coordinates and a reverse-geocoded place name, plus the Open-Meteo API for the current temperature and weather code (6s timeout, graceful nulls on web or on permission denial). The [[Entry Composer]] calls it when saving a new entry while `contextEnabled`, stamping `placeName` / `lat` / `lng` / `tempC` / `weatherCode` onto the entry row (`entries` table, `src/lib/db.ts`). It shows as a read-only metadata line on the entry and under each row and marker in [[Timeline and map view]] (`formatWeather`). Toggled on [[Settings]].

## Related
- Page: [[Entry Composer]], [[Timeline and Map]], [[Settings]]
- Features: [[Timeline and map view]], [[Persistence layer]]
