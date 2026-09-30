import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, Pressable, TextInput, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { maxFontSizeMultiplier, metrics, radius } from '../theme/tokens';
import { align, row } from '../lib/rtl';
import { CloseIcon, SearchIcon } from './Icon';

const searchFieldHeight = 48;
const searchFieldGap = 28;

export const searchFieldInset = metrics.tabBar + searchFieldGap + searchFieldHeight + 12;

export function SearchField({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  const { c, t, ui, rtl } = useTheme();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    // android resizes the window for the keyboard, so the tab bar and this field ride up with it
    if (Platform.OS !== 'ios') return;
    const show = Keyboard.addListener('keyboardWillShow', (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hide = Keyboard.addListener('keyboardWillHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <View
      style={{
        position: 'absolute',
        left: metrics.gutter,
        right: metrics.gutter,
        bottom: keyboardHeight ? keyboardHeight + 8 : metrics.tabBar + searchFieldGap,
      }}
    >
      <View
        style={{
          height: searchFieldHeight,
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
