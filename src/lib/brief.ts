import { CAPABILITIES, CONTACT_PAGE } from "../content.ts";

export type BriefValues = {
  name: string;
  email: string;
  company: string;
  services: string[];
  timeline: string;
  message: string;
};

export const BRIEF_LIMITS = { name: 120, email: 254, company: 240, message: 10000 };
export const EMPTY_BRIEF: BriefValues = { name: "", email: "", company: "", services: [], timeline: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SINGLE_LINE = /^[^\u0000-\u001f\u007f]*$/;

export const checkBrief = {
  name: (v: BriefValues) =>
    v.name.trim().length >= 2 && v.name.length <= BRIEF_LIMITS.name && SINGLE_LINE.test(v.name)
      ? "" : "Who should we thank for the idea? Tell us your name.",
  email: (v: BriefValues) =>
    v.email.length <= BRIEF_LIMITS.email && EMAIL_RE.test(v.email.trim())
      ? "" : "Where can we reach you? Add a complete email address, like you@company.com.",
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
  if (data.company !== undefined && typeof data.company !== "string") return null;
  if (data.timeline !== undefined && typeof data.timeline !== "string") return null;
  if (data.services !== undefined && (!Array.isArray(data.services) || data.services.length > CAPABILITIES.length)) return null;
  const services = data.services ?? [];
  if (!(services as unknown[]).every((s) => typeof s === "string" && CAPABILITIES.some((c) => c.title === s))) return null;
  const brief: BriefValues = {
    name: (data.name as string).trim(),
    email: (data.email as string).trim(),
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
