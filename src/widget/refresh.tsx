import React from 'react';
import { Platform } from 'react-native';
import { TodayWidget } from './TodayWidget';
import { loadWidgetState, widgetLabels } from './widget-data';

export async function refreshTodayWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } =
      require('react-native-android-widget') as typeof import('react-native-android-widget');
    const { tasks, lang } = await loadWidgetState();
    const labels = widgetLabels(lang);
    await requestWidgetUpdate({
      widgetName: 'Today',
      renderWidget: () => <TodayWidget tasks={tasks} labels={labels} />,
      widgetNotFound: () => {},
    });
  } catch {
    // Widget native module unavailable (Expo Go / iOS / web) or no widget pinned.
  }
}
