import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { metrics } from '../theme/tokens';
import { align, marginStart, pad, row } from '../lib/rtl';
import { formatDay, formatTime, parseDayKey } from '../lib/day';
import { formatWeather } from '../lib/context';
import { useJournals, useStore } from '../state/store';
import type { Entry } from '../data/seed';
import { Screen, useHeaderTop } from '../components/Screen';
import { Segmented } from '../components/Segmented';
import { Dot, EmptyRules, Ledger, SectionLabel } from '../components/Ledger';
import { ChevronBackIcon } from '../components/Icon';

let MapView: any = null;
let Marker: any = null;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
}

type TimelineTab = 'timeline' | 'map';
type LocatedEntry = Entry & { lat: number; lng: number };

export function TimelineMapScreen({
  onOpenEntry,
  onBack,
}: {
  onOpenEntry: (entryId: string) => void;
  onBack: () => void;
}) {
  const { c, t, ar, ui, mono, display, rtl } = useTheme();
  const top = useHeaderTop();
  const { entries } = useStore();
  const journals = useJournals();
  const [view, setView] = useState<TimelineTab>('timeline');

  const journalColor = useMemo(() => {
    const map = new Map(journals.map((j) => [j.id, c[j.color]]));
    return (id: string) => map.get(id) ?? c.ink3;
  }, [journals, c]);

  const sorted = useMemo(() => [...entries].sort((a, b) => b.createdAt - a.createdAt), [entries]);

  const groups = useMemo(() => {
    const out: { day: string; items: Entry[] }[] = [];
    for (const e of sorted) {
      const last = out[out.length - 1];
      if (last && last.day === e.day) last.items.push(e);
      else out.push({ day: e.day, items: [e] });
    }
    return out;
  }, [sorted]);

  const mapped = useMemo(
    () => sorted.filter((e): e is LocatedEntry => e.lat !== null && e.lng !== null),
    [sorted]
  );

  const entryTitle = (e: Entry) =>
    e.title.trim() || e.body.split('\n')[0].trim() || formatDay(parseDayKey(e.day), t, ar);

  const entryContext = (e: Entry) =>
    [e.placeName ?? '', formatWeather(e.tempC, e.weatherCode, t)].filter(Boolean).join(' · ');

  return (
    <Screen>
      <View style={{ paddingTop: top, paddingHorizontal: metrics.gutter, paddingBottom: 12, gap: 10 }}>
        <View style={{ flexDirection: row(rtl) }}>
          <Pressable
            onPress={onBack}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.back}
            style={[
              { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
              marginStart(rtl, -10),
            ]}
          >
            <ChevronBackIcon color={c.ink} flip={rtl} />
          </Pressable>
        </View>

        <Text
          numberOfLines={1}
          style={[display(30, { lineHeight: 34 }), { color: c.ink, textAlign: align(rtl) }]}
        >
          {t.timelineMap}
        </Text>

        <View style={{ flexDirection: row(rtl) }}>
          <Segmented<TimelineTab>
            options={[
              { key: 'timeline', label: t.timeline },
              { key: 'map', label: t.map },
            ]}
            value={view}
            onChange={setView}
          />
        </View>
      </View>

      {view === 'timeline' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <Ledger>
            {groups.length === 0 ? <SectionLabel label={t.noEntries} /> : null}

            {groups.map((g) => (
              <React.Fragment key={g.day}>
                <SectionLabel label={formatDay(parseDayKey(g.day), t, ar)} />
                {g.items.map((e) => {
                  const title = entryTitle(e);
                  const context = entryContext(e);
                  const time = formatTime(e.createdAt, ar);
                  return (
                    <Pressable
                      key={e.id}
                      onPress={() => onOpenEntry(e.id)}
                      android_ripple={null}
                      accessibilityRole="button"
                      accessibilityLabel={[title, time, context].filter(Boolean).join(', ')}
                      style={({ pressed }) => [
                        {
                          minHeight: metrics.row,
                          flexDirection: row(rtl),
                          alignItems: 'center',
                          gap: 14,
                          paddingVertical: 9,
                          borderBottomWidth: 1,
                          borderBottomColor: c.rule,
                          backgroundColor: pressed ? c.paper2 : 'transparent',
                        },
                        pad(rtl, 16, metrics.gutter),
                      ]}
                    >
                      <View style={{ width: metrics.checkbox, alignItems: 'center' }}>
                        <Dot color={journalColor(e.journalId)} size={8} />
                      </View>

                      <View style={[{ flex: 1, minWidth: 0, gap: 2 }, marginStart(rtl, 16)]}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={[ui(17, 400, 22), { color: c.ink, textAlign: align(rtl) }]}
                        >
                          {title}
                        </Text>
                        {context ? (
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[mono(12, 500), { color: c.ink3, textAlign: align(rtl) }]}
                          >
                            {context}
                          </Text>
                        ) : null}
                      </View>

                      <Text style={[mono(12, 500), { color: c.ink3 }]}>{time}</Text>
                    </Pressable>
                  );
                })}
              </React.Fragment>
            ))}

            <EmptyRules count={4} />
          </Ledger>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {Platform.OS === 'web' || MapView == null || mapped.length === 0 ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: metrics.gutter }}>
              <Text style={[ui(15, 400, 20), { color: c.ink3, textAlign: 'center' }]}>
                {t.noMappedEntries}
              </Text>
            </View>
          ) : (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: mapped[0].lat,
                longitude: mapped[0].lng,
                latitudeDelta: 0.5,
                longitudeDelta: 0.5,
              }}
            >
              {mapped.map((e) => {
                const title = entryTitle(e);
                const context = entryContext(e);
                return (
                  <Marker
                    key={e.id}
                    coordinate={{ latitude: e.lat, longitude: e.lng }}
                    title={title}
                    description={context || undefined}
                    onPress={() => onOpenEntry(e.id)}
                  />
                );
              })}
            </MapView>
          )}
        </View>
      )}
    </Screen>
  );
}
