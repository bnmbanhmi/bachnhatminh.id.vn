/**
 * Sanitizes user-facing error messages to hide internal Supabase endpoint URLs (*.supabase.co),
 * sensitive database details, or raw stack traces.
 */
export function sanitizeErrorMessage(msg: string | null | undefined): string {
  if (!msg) return 'Đã có lỗi xảy ra. Vui lòng thử lại sau.';
  let sanitized = String(msg);

  // If the message contains a raw Supabase URL (*.supabase.co), mask it
  if (/supabase\.co/i.test(sanitized)) {
    sanitized = sanitized.replace(/https?:\/\/[a-z0-9-]+\.supabase\.co[^\s]*/gi, '[hệ thống]');
    sanitized = sanitized.replace(/[a-z0-9-]+\.supabase\.co/gi, '[hệ thống]');
    // If it's a raw network or backend API failure
    if (sanitized.includes('[hệ thống]') || sanitized.toLowerCase().includes('fetch failed')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.';
    }
  }

  return sanitized;
}
