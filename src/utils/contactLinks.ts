export const CONTACT_EMAIL = 'anthonyandino959@gmail.com';

export function gmailComposeUrl(
  email: string = CONTACT_EMAIL,
  subject?: string
): string {
  const base =
    'https://mail.google.com/mail/?view=cm&fs=1&tf=1&to=' +
    encodeURIComponent(email);

  return subject ? `${base}&su=${encodeURIComponent(subject)}` : base;
}
