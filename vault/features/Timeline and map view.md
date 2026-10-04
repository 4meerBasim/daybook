# Timeline and map view

Status: shipped
Summary: Browse every journal entry as a chronological timeline or plotted on a map of the places they were written.

## Details
`src/screens/TimelineMapScreen.tsx`. Reached from [[Recent]] via a ledger row at the top of the list labelled "Timeline & map" (`t.timelineMap`) with the `TimelineIcon`; `RecentScreen` takes an `onOpenTimeline` prop for this, and [[Main Tabs]] / navigation wires it to push the screen.

The screen header has a back button (`ChevronBackIcon`, flipped under RTL), the `t.timelineMap` title, and a `Segmented` toggle between `timeline` and `map`.

- Timeline: `useStore().entries` sorted by `createdAt` descending and grouped by `day`. Each day group renders a `SectionLabel` header (`formatDay(parseDayKey(day), t, ar)`) followed by one ledger-styled pressable row per entry — a `Dot` in the entry's journal colour (resolved through `useJournals()`), the entry title (falling back to the first line of the body, then the formatted day), a muted context line combining `placeName` and `formatWeather(tempC, weatherCode, t)`, and the trailing `formatTime(createdAt, ar)`. Rows are >= 44pt, carry an accessibility label, and open the entry via `onOpenEntry`. Empty state shows `t.noEntries`.
- Map: `react-native-maps` `MapView` (default provider — Apple Maps on iOS, the Google key wired separately via app config; no `PROVIDER_GOOGLE`) with a `Marker` for each entry that has non-null `lat`/`lng`. `initialRegion` centres on the most recent located entry with a 0.5 lat/lng delta. Each marker's title/description reuse the entry title and context line, and tapping it calls `onOpenEntry`. When no entry has a location the view shows `t.noMappedEntries`.

Builds on [[Auto context metadata (time, location, weather)]] for the location/weather data and [[Multiple journals]] for per-entry colour. All copy comes from i18n (EN + AR), RTL handled through `src/lib/rtl.ts` helpers.

## Related
- Page: [[Timeline and Map]], [[Recent]], [[Today]]
- Features: [[Auto context metadata (time, location, weather)]], [[Multiple journals]], [[On This Day]]
- Bugs: [[Android map blank without Google Maps key]]
