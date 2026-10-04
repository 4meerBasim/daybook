import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { TodayWidget } from './TodayWidget';
import { loadWidgetState, widgetLabels } from './widget-data';

const WIDGET_NAMES = ['Today'];

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  if (!WIDGET_NAMES.includes(props.widgetInfo.widgetName)) return;
  if (props.widgetAction === 'WIDGET_DELETED') return;

  const { tasks, lang } = await loadWidgetState();
  const labels = widgetLabels(lang);
  props.renderWidget(<TodayWidget tasks={tasks} labels={labels} />);
}
