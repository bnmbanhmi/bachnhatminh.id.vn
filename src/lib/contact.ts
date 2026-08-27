export function getUserContact(
  user: { user_metadata?: Record<string, unknown> } | null | undefined
): string {
  const contact = user?.user_metadata?.phone;
  return typeof contact === 'string' ? contact : '';
}

interface ContactAuthClient {
  auth: {
    updateUser: (options: { data: Record<string, unknown> }) => Promise<unknown>;
  };
}

export async function saveUserContact(supabase: ContactAuthClient, contact: string): Promise<void> {
  try {
    await supabase.auth.updateUser({ data: { phone: contact.trim() } });
  } catch (err) {
    console.error('Error saving contact for later:', err);
  }
}
