import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Platform, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';
import { metrics, radius } from '../theme/tokens';
import { useStore } from '../state/store';
import { authenticate } from '../lib/biometrics';
import { LockIcon } from './Icon';

const lockable = Platform.OS !== 'web';

export function LockGate({ children }: { children: React.ReactNode }) {
  const { appLockEnabled } = useStore();
  const { c, t, ui, display } = useTheme();
  const insets = useSafeAreaInsets();
  const [locked, setLocked] = useState(lockable && appLockEnabled);
  const authing = useRef(false);
  const lockedRef = useRef(locked);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  const tryUnlock = useCallback(async () => {
    if (authing.current) return;
    authing.current = true;
    const ok = await authenticate(t.appLock);
    authing.current = false;
    if (ok) setLocked(false);
  }, [t.appLock]);

  useEffect(() => {
    lockedRef.current = locked;
  }, [locked]);

  useEffect(() => {
    if (!appLockEnabled) setLocked(false);
  }, [appLockEnabled]);

  useEffect(() => {
    if (lockable && appLockEnabled && lockedRef.current) void tryUnlock();
    // run once on mount to prompt on cold launch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lockable) return;
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appState.current;
      appState.current = next;
      if (!appLockEnabled) return;
      if (next === 'background') setLocked(true);
      else if (next === 'active' && prev !== 'active' && lockedRef.current) void tryUnlock();
    });
    return () => sub.remove();
  }, [appLockEnabled, tryUnlock]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {locked ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: c.paper,
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: metrics.gutter,
          }}
        >
          <View style={{ alignItems: 'center', gap: 16 }}>
            <LockIcon size={40} color={c.ink} />
            <Text style={[display(28), { color: c.ink, textAlign: 'center' }]}>{t.locked}</Text>
            <Text style={[ui(15, 400, 20), { color: c.ink3, textAlign: 'center' }]}>
              {t.unlockHint}
            </Text>
          </View>
          <Pressable
            onPress={tryUnlock}
            android_ripple={null}
            accessibilityRole="button"
            accessibilityLabel={t.unlock}
            style={{
              position: 'absolute',
              left: metrics.gutter,
              right: metrics.gutter,
              bottom: insets.bottom + 40,
              height: metrics.pen,
              borderRadius: radius.card,
              backgroundColor: c.ink,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[ui(17, 500), { color: c.paper }]}>{t.unlock}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
