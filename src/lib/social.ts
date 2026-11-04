/** Social networks that have a glyph in Icon.tsx's `SocialIcon`; any other keeps its text link. */
export const SOCIAL_KEYS = ["instagram", "linkedin", "behance", "x", "whatsapp"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

const isSocialKey = (key: string): key is SocialKey => (SOCIAL_KEYS as readonly string[]).includes(key);

/** The glyph key for a link label ("Instagram" → "instagram"), or null when there is none. */
export function socialKey(label: string): SocialKey | null {
  const key = label.trim().toLowerCase();
  return isSocialKey(key) ? key : null;
}
