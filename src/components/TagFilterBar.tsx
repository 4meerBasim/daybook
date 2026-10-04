import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { row } from '../lib/rtl';

export function TagFilterBar({
  tags,
  selected,
  onSelect,
}: {
  tags: string[];
  selected: string | null;
  onSelect: (tag: string | null) => void;
}) {
  const { c, t, ui, rtl } = useTheme();
  if (tags.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexDirection: row(rtl),
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: metrics.gutter,
        paddingVertical: 8,
      }}
    >
      {tags.map((tag) => {
        const on = selected === tag;
        return (
          <Pressable
            key={tag}
            onPress={() => onSelect(on ? null : tag)}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityState={{ checked: on }}
            accessibilityLabel={tag}
            accessibilityHint={t.filterByTag}
            style={{ height: 44, minWidth: 44, alignItems: 'center', justifyContent: 'center' }}
          >
            <View
              style={{
                height: 28,
                paddingHorizontal: 10,
                borderRadius: radius.chip,
                backgroundColor: on ? c.och : c.ochS,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                maxFontSizeMultiplier={maxFontSizeMultiplier}
                style={[ui(12, 500), { lineHeight: undefined, color: on ? c.card : c.och }]}
              >
                {`#${tag}`}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
