import { CAPABILITIES, CONTACT_PAGE } from "../content.ts";

export type BriefValues = {
  name: string;
  email: string;
  phone: string;
  company: string;
  services: string[];
  timeline: string;
  message: string;
};

export const BRIEF_LIMITS = { name: 120, email: 254, phone: 30, company: 240, message: 10000 };
export const EMPTY_BRIEF: BriefValues = { name: "", email: "", phone: "", company: "", services: [], timeline: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Digits with the usual separators and an optional leading "+": "+91 98765 43210", "(020) 7946-0958". */
const PHONE_RE = /^\+?[0-9 ().-]+$/;
const SINGLE_LINE = /^[^\u0000-\u001f\u007f]*$/;

export const checkBrief = {
  name: (v: BriefValues) =>
    v.name.trim().length >= 2 && v.name.length <= BRIEF_LIMITS.name && SINGLE_LINE.test(v.name)
      ? "" : "Who should we thank for the idea? Tell us your name.",
  email: (v: BriefValues) =>
    v.email.length <= BRIEF_LIMITS.email && EMAIL_RE.test(v.email.trim())
      ? "" : "Where can we reach you? Add a complete email address, like you@company.com.",
  // Optional: empty is fine. Between 7 and 15 digits (the international maximum), nothing else.
  phone: (v: BriefValues) => {
    const phone = v.phone.trim();
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "").length;
    return phone.length <= BRIEF_LIMITS.phone && PHONE_RE.test(phone) && digits >= 7 && digits <= 15
      ? "" : "That number doesn’t look quite right. Add the digits with your country code, like +91 98765 43210, or leave it blank.";
  },
  message: (v: BriefValues) => {
    if (v.message.trim().length < 10) {
      return "Give us a little more to work with. Tell us what you’d like to create, change, or solve so we can understand your brief.";
    }
    return v.message.length <= BRIEF_LIMITS.message ? "" : "There’s a lot to explore here. Share the highlights for now, and we’ll get into the details together.";
  },
};

export type BriefField = keyof typeof checkBrief;

/** Validate untrusted request data before anything is sent to the email provider. */
export function parseBrief(value: unknown): { brief: BriefValues; errors: Partial<Record<BriefField, string>> } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (!["name", "email", "message"].every((key) => typeof data[key] === "string")) return null;
  if (data.phone !== undefined && typeof data.phone !== "string") return null;
  if (data.company !== undefined && typeof data.company !== "string") return null;
  if (data.timeline !== undefined && typeof data.timeline !== "string") return null;
  if (data.services !== undefined && (!Array.isArray(data.services) || data.services.length > CAPABILITIES.length)) return null;
  const services = data.services ?? [];
  if (!(services as unknown[]).every((s) => typeof s === "string" && CAPABILITIES.some((c) => c.title === s))) return null;
  const brief: BriefValues = {
    name: (data.name as string).trim(),
    email: (data.email as string).trim(),
    phone: ((data.phone ?? "") as string).trim(),
    company: ((data.company ?? "") as string).trim(),
    timeline: ((data.timeline ?? "") as string).trim(),
    services: [...new Set(services as string[])],
    message: (data.message as string).trim(),
  };
  if (brief.company.length > BRIEF_LIMITS.company || !SINGLE_LINE.test(brief.company)) return null;
  if (brief.timeline && !CONTACT_PAGE.timelines.includes(brief.timeline)) return null;
  const errors: Partial<Record<BriefField, string>> = {};
  for (const field of Object.keys(checkBrief) as BriefField[]) {
    const error = checkBrief[field](brief);
    if (error) errors[field] = error;
  }
  return { brief, errors };
}
