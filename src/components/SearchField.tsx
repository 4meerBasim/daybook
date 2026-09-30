import React from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { CloseIcon, SearchIcon } from './Icon';

export function SearchField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  const { c, t, ui, rtl } = useTheme();

  return (
    <View style={{ paddingHorizontal: metrics.gutter, paddingBottom: 12 }}>
      <View
        style={{
          height: 48,
          borderRadius: radius.card,
          backgroundColor: c.paper2,
          borderWidth: 1,
          borderColor: c.rule,
          flexDirection: row(rtl),
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 12,
        }}
      >
        <SearchIcon size={20} color={c.ink3} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          selectionColor={c.ink}
          placeholder={t.search}
          placeholderTextColor={c.ink3}
          maxFontSizeMultiplier={maxFontSizeMultiplier}
          accessibilityLabel={t.search}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          style={[
            ui(17),
            { flex: 1, alignSelf: 'stretch', color: c.ink, padding: 0, textAlign: align(rtl) },
          ]}
        />
        {value ? (
          <Pressable
            onPress={() => onChangeText('')}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.clear}
            hitSlop={12}
          >
            <CloseIcon size={20} color={c.ink3} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
