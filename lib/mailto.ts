// Builds a mailto: link so an admin can send a status email to the customer
// directly from their own email client - no backend/SMTP needed for this one.
export function mailtoLink(email: string | null | undefined, subject: string, body: string) {
  if (!email) return null;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
