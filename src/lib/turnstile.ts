export interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
  cdata?: string;
}

/**
 * Server-side Turnstile verification helper.
 * Calls Cloudflare siteverify API (https://challenges.cloudflare.com/turnstile/v0/siteverify).
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIp?: string
): Promise<TurnstileVerifyResponse> {
  const secret = process.env.TURNSTILE_SECRET;

  if (process.env.NODE_ENV === 'development' || !secret) {
    return { success: true };
  }

  if (!token) {
    return { success: false, 'error-codes': ['missing-input-response'] };
  }

  const formData = new URLSearchParams();
  formData.append('secret', secret);
  formData.append('response', token);
  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!res.ok) {
      return { success: false, 'error-codes': [`http-${res.status}`] };
    }

    const data: TurnstileVerifyResponse = await res.json();
    return data;
  } catch (error) {
    console.error('Turnstile siteverify error:', error);
    return { success: false, 'error-codes': ['internal-error'] };
  }
}
