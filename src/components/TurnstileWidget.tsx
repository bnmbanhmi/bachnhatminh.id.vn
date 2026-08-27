'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          action?: string;
          callback?: (token: string) => void;
          'error-callback'?: (error?: unknown) => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
    onloadTurnstileCallback?: () => void;
  }
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error?: unknown) => void;
  onExpire?: () => void;
  siteKey?: string;
  action?: string;
  className?: string;
}

export default function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '0x4AAAAAAD7uuiLxNtuW8Xxg',
  action = 'turnstile-spin-v2',
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let isMounted = true;

    const renderWidget = () => {
      if (!isMounted || !containerRef.current || !window.turnstile) return;

      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore cleanup errors
        }
        widgetIdRef.current = null;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          callback: (token: string) => {
            if (isMounted && onVerify) onVerify(token);
          },
          'error-callback': (err?: unknown) => {
            if (isMounted && onError) onError(err);
          },
          'expired-callback': () => {
            if (isMounted && onExpire) onExpire();
          },
          theme: 'light',
        });
        widgetIdRef.current = id;
      } catch (err) {
        console.error('Turnstile render error:', err);
      }
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
      );

      if (!script) {
        script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      window.onloadTurnstileCallback = () => {
        if (isMounted) renderWidget();
      };

      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          renderWidget();
        }
      }, 200);

      return () => {
        isMounted = false;
        clearInterval(interval);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {}
        }
      };
    }

    return () => {
      isMounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {}
      }
    };
  }, [siteKey, action, onVerify, onError, onExpire]);

  return <div ref={containerRef} className={`cf-turnstile my-2 ${className}`} data-action={action} />;
}
