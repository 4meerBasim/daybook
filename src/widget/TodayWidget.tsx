import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import type { WidgetLabels, WidgetTask } from './widget-data';

const C = {
  paper: '#FBF9F3',
  ink: '#201D17',
  ink3: '#8A857A',
  rule: '#E7E2D6',
  moss: '#5B6B4E',
} as const;

export function TodayWidget({ tasks, labels }: { tasks: WidgetTask[]; labels: WidgetLabels }) {
  const doneCount = tasks.filter((task) => task.done).length;
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: C.paper,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'column',
      }}
    >
      <FlexWidget
        style={{
          width: 'match_parent',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <TextWidget
          text={labels.title}
          style={{ fontSize: 15, fontWeight: '600', color: C.ink, letterSpacing: 1 }}
        />
        {tasks.length > 0 ? (
          <TextWidget
            text={labels.progress(doneCount, tasks.length)}
            style={{ fontSize: 12, color: C.ink3 }}
          />
        ) : (
          <TextWidget text="" style={{ fontSize: 12, color: C.ink3 }} />
        )}
      </FlexWidget>

      {tasks.length === 0 ? (
        <TextWidget text={labels.empty} style={{ fontSize: 14, color: C.ink3 }} />
      ) : (
        <FlexWidget style={{ width: 'match_parent', flexDirection: 'column' }}>
          {tasks.map((task) => (
            <FlexWidget
              key={task.id}
              clickAction="OPEN_APP"
              style={{
                width: 'match_parent',
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 4,
              }}
            >
              <TextWidget
                text={task.done ? '☑' : '☐'}
                style={{ fontSize: 15, color: task.done ? C.moss : C.ink3, marginRight: 10 }}
              />
              <TextWidget
                text={task.title}
                maxLines={1}
                truncate="END"
                style={{ fontSize: 15, color: task.done ? C.ink3 : C.ink }}
              />
            </FlexWidget>
          ))}
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
