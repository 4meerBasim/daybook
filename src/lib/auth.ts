import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import type { Session } from '@supabase/supabase-js';
import { supabase, googleWebClientId, googleIosClientId } from './supabase';

export type AuthResult = { ok: boolean; userId?: string; error?: 'cancelled' | 'unconfigured' | 'failed' };

export function isGoogleConfigured(): boolean {
  if (supabase == null || googleWebClientId === '') return false;
  // On iOS the native flow needs the reversed-id URL scheme, which app.config.js
  // only adds when the iOS client id is set — hide the button otherwise.
  if (Platform.OS === 'ios' && googleIosClientId === '') return false;
  return true;
}

export async function isAppleAvailable(): Promise<boolean> {
  if (supabase == null || Platform.OS !== 'ios') return false;
  try {
    return await AppleAuthentication.isAvailableAsync();
  } catch {
    return false;
  }
}

let googleConfigured = false;
function configureGoogle(): void {
  if (googleConfigured || googleWebClientId === '') return;
  GoogleSignin.configure({
    webClientId: googleWebClientId,
    iosClientId: googleIosClientId || undefined,
  });
  googleConfigured = true;
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!isGoogleConfigured() || !supabase) return { ok: false, error: 'unconfigured' };
  try {
    configureGoogle();
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return { ok: false, error: 'cancelled' };
    const idToken = response.data.idToken;
    if (!idToken) return { ok: false, error: 'failed' };
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: idToken });
    if (error) return { ok: false, error: 'failed' };
    return { ok: true, userId: data.user?.id };
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) {
      return { ok: false, error: 'cancelled' };
    }
    return { ok: false, error: 'failed' };
  }
}

export async function signInWithApple(): Promise<AuthResult> {
  if (supabase == null || Platform.OS !== 'ios') return { ok: false, error: 'unconfigured' };
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const idToken = credential.identityToken;
    if (!idToken) return { ok: false, error: 'failed' };
    const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'apple', token: idToken });
    if (error) return { ok: false, error: 'failed' };
    return { ok: true, userId: data.user?.id };
  } catch (e) {
    if (e != null && typeof e === 'object' && (e as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
      return { ok: false, error: 'cancelled' };
    }
    return { ok: false, error: 'failed' };
  }
}

export async function signOut(): Promise<void> {
  if (supabase == null) return;
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore — best effort
  }
  try {
    if (googleConfigured) await GoogleSignin.signOut();
  } catch {
    // ignore — best effort
  }
}

export async function getCurrentSession(): Promise<Session | null> {
  if (supabase == null) return null;
  try {
    const { data } = await supabase.auth.getSession();
    return data.session ?? null;
  } catch {
    return null;
  }
}

export function onAuthChange(cb: (session: Session | null) => void): () => void {
  if (supabase == null) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return () => data.subscription.unsubscribe();
}
