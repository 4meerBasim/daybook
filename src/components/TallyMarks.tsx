import React from 'react';
import { View } from 'react-native';

export function TallyMarks({ count, color, max = 5 }: { count: number; color: string; max?: number }) {
  const n = Math.min(count, max);
  if (n <= 0) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 2, height: 8 }}>
      {Array.from({ length: n }).map((_, i) => (
        <View key={i} style={{ width: 1.5, height: 8, backgroundColor: color }} />
      ))}
    </View>
  );
}
