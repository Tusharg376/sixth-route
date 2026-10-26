import { useId, useState, type FormEvent } from "react";
import { CAPABILITIES, CONTACT_PAGE, EMAIL } from "../content";
import { Mark } from "../brand/Logo";
import { ArrowRight } from "./Icon";
import "./brief.css";

type Values = { name: string; email: string; company: string; services: string[]; timeline: string; message: string };
type Status = "idle" | "sending" | "sent" | "mailto" | "error";

const EMPTY: Values = { name: "", email: "", company: "", services: [], timeline: "", message: "" };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const check = {
  name: (v: Values) => (v.name.trim().length >= 2 ? "" : "Enter your name."),
  email: (v: Values) => (EMAIL_RE.test(v.email.trim()) ? "" : "Enter an email address like name@company.com."),
  message: (v: Values) =>
    v.message.trim().length >= 10 ? "" : "Tell us a little about the project — a sentence or two is enough.",
};
type Checked = keyof typeof check;

// Optional: set VITE_FORM_ENDPOINT to a form backend (Formspree, Basin, your API) that accepts JSON.
// Without it, the brief opens in the visitor's email app, addressed to the studio.
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT;

export function BriefForm() {
  const id = useId();
  const [v, setV] = useState<Values>(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Checked, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const err = (k: Checked) => (touched[k] ? check[k](v) : "");
  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((p) => ({ ...p, [k]: val }));
  const toggle = (s: string) =>
    set("services", v.services.includes(s) ? v.services.filter((x) => x !== s) : [...v.services, s]);

  // The form is its own route: each part lights its stretch of line once it's complete.
  const done = [!check.name(v) && !check.email(v), !check.message(v)];
  const group = (i: number) => `brief__group ${done[i] ? "is-done" : ""}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    const firstBad = (Object.keys(check) as Checked[]).find((k) => check[k](v));
    if (firstBad) {
      document.getElementById(`${id}-${firstBad}`)?.focus();
      return;
    }
    const brief = {
      name: v.name.trim(),
      email: v.email.trim(),
      company: v.company.trim(),
      services: v.services,
      timeline: v.timeline,
      message: v.message.trim(),
    };
    if (!ENDPOINT) {
      const lines = [`Name: ${brief.name}`, `Email: ${brief.email}`];
      if (brief.company) lines.push(`Business / website: ${brief.company}`);
      if (brief.services.length) lines.push(`Interested in: ${brief.services.join(", ")}`);
      if (brief.timeline) lines.push(`Timeline: ${brief.timeline}`);
      const body = [...lines, "", brief.message].join("\n");
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Project brief — ${brief.name}`)}&body=${encodeURIComponent(body)}`;
      setStatus("mailto");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(brief),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent" || status === "mailto") {
    return (
      <div className="brief brief--done" role="status">
        <Mark size={72} glow />
        <h2>{status === "sent" ? "Brief sent." : "Your brief is ready to send."}</h2>
        <p>
          {status === "sent" ? (
            <>
              Thanks, {v.name.trim().split(" ")[0]}. We'll reply to <strong>{v.email.trim()}</strong> with next steps.
            </>
          ) : (
            <>
              Your email app should have opened with the brief filled in — send it from there and we'll take it from
              that point. Nothing opened? Email us at <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </>
          )}
        </p>
        <div className="brief__done-actions">
          <a href="/" className="btn btn--orange">
            <span className="btn__label">Back to home</span>
            <span className="btn__dot">
              <ArrowRight />
            </span>
          </a>
          {status === "mailto" && (
            <button type="button" className="btn btn--ghost btn--on-light" onClick={() => setStatus("idle")}>
              Edit the brief
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form id="brief" className="brief" onSubmit={submit} noValidate aria-describedby={`${id}-note`}>
      <fieldset className={group(0)}>
        <legend>
          <span>01</span> About you
        </legend>
        <div className="brief__row">
          <Field id={`${id}-name`} label="Your name" error={err("name")}>
            <input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              aria-invalid={!!err("name")}
              aria-describedby={err("name") ? `${id}-name-err` : undefined}
              required
            />
          </Field>
          <Field id={`${id}-email`} label="Work email" error={err("email")}>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={v.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={!!err("email")}
              aria-describedby={err("email") ? `${id}-email-err` : undefined}
              required
            />
          </Field>
        </div>
        <Field id={`${id}-company`} label="Business or website" hint="Optional">
          <input
            id={`${id}-company`}
            name="company"
            autoComplete="organization"
            value={v.company}
            onChange={(e) => set("company", e.target.value)}
          />
        </Field>
      </fieldset>

      <fieldset className={group(1)}>
        <legend>
          <span>02</span> Your project
        </legend>
        <fieldset className="brief__chips">
          <legend>
            What do you need help with? <em>Pick any</em>
          </legend>
          <div>
            {CAPABILITIES.map((c) => (
              <label key={c.title} className="chip">
                <input type="checkbox" checked={v.services.includes(c.title)} onChange={() => toggle(c.title)} />
                <span>{c.title}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="brief__chips">
          <legend>
            When would you like to start? <em>Optional</em>
          </legend>
          <div>
            {CONTACT_PAGE.timelines.map((t) => (
              <label key={t} className="chip">
                <input type="radio" name="timeline" checked={v.timeline === t} onChange={() => set("timeline", t)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <Field id={`${id}-message`} label="Tell us about your project" error={err("message")}>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={5}
            placeholder="Your goals, the challenge you're facing, any timing or budget context…"
            value={v.message}
            onChange={(e) => set("message", e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, message: true }))}
            aria-invalid={!!err("message")}
            aria-describedby={err("message") ? `${id}-message-err` : undefined}
            required
          />
        </Field>
      </fieldset>

      <div className={`brief__group brief__send ${done[0] && done[1] ? "is-ready" : ""}`}>
        <p className="brief__legend">
          <span>03</span> Send
        </p>
        {status === "error" && (
          <p className="brief__error" role="alert">
            Your brief didn't send. Check your connection and try again, or email us at{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>
        )}
        <button type="submit" className="btn btn--orange" disabled={status === "sending"}>
          <span className="btn__label">{status === "sending" ? "Sending brief…" : "Send brief"}</span>
          <span className="btn__dot">
            <ArrowRight />
          </span>
        </button>
        <p id={`${id}-note`} className="brief__note">
          We only use these details to reply to your enquiry.
        </p>
      </div>
    </form>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>
        {label} {hint && <em>{hint}</em>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="field__error">
          {error}
        </p>
      )}
    </div>
  );
}
