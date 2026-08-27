'use client';

import { useEffect, useRef, useState } from 'react';
import { signInWithGoogleIdToken } from '@/lib/supabase/auth';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  '629888221922-houv6qnejr6ousoghb9i9f73i0okvqff.apps.googleusercontent.com';

interface CredentialResponse {
  credential?: string;
}

interface GoogleIdentityApi {
  initialize(config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    nonce: string;
    ux_mode: 'popup';
    use_fedcm_for_prompt: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      type: 'standard';
      theme: 'outline';
      size: 'large';
      text: 'signin_with';
      shape: 'rectangular';
      logo_alignment: 'left';
      locale: 'vi';
      width: number;
    },
  ): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdentityApi;
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleIdentityServices(): Promise<void> {
  if (window.google?.accounts.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src*="https://accounts.google.com/gsi/client"]',
    );

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(), { once: true });
      existingScript.addEventListener(
        'error',
        () => reject(new Error('Không thể tải Google Identity Services.')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client?hl=vi';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      googleScriptPromise = null;
      reject(new Error('Không thể tải Google Identity Services.'));
    };
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

async function createNonce(): Promise<{ nonce: string; hashedNonce: string }> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const nonce = btoa(String.fromCharCode(...randomBytes));
  const encodedNonce = new TextEncoder().encode(nonce);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce);
  const hashedNonce = Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');

  return { nonce, hashedNonce };
}

export default function GoogleSignInButton() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function initializeButton() {
      try {
        await loadGoogleIdentityServices();
        const googleIdentity = window.google?.accounts.id;
        const button = buttonRef.current;

        if (cancelled || !googleIdentity || !button) return;

        const { nonce, hashedNonce } = await createNonce();
        if (cancelled) return;

        googleIdentity.initialize({
          client_id: GOOGLE_CLIENT_ID,
          nonce: hashedNonce,
          ux_mode: 'popup',
          use_fedcm_for_prompt: true,
          callback: async (response) => {
            if (!response.credential) {
              setErrorMessage('Google không trả về thông tin đăng nhập.');
              return;
            }

            const { error } = await signInWithGoogleIdToken(response.credential, nonce);
            if (error) {
              console.error('Google ID token sign-in failed:', error.message);
              setErrorMessage('Đăng nhập thất bại. Vui lòng thử lại.');
              return;
            }

            window.location.reload();
          },
        });

        button.replaceChildren();
        googleIdentity.renderButton(button, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          locale: 'vi',
          width: 280,
        });
      } catch (error) {
        console.error('Google Identity Services initialization failed:', error);
        if (!cancelled) {
          setErrorMessage('Không thể tải đăng nhập Google. Vui lòng thử lại.');
        }
      }
    }

    initializeButton();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-2">
      <div ref={buttonRef} className="min-h-11" aria-label="Đăng nhập bằng Google" />
      {errorMessage && (
        <p className="text-center text-xs font-semibold text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
