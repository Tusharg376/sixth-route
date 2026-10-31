import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { CAPABILITIES, CONTACT_PAGE, EMAIL } from "../content";
import { Mark } from "../brand/Logo";
import { PHONE, useMedia } from "../lib/media";
import { BRIEF_LIMITS, EMPTY_BRIEF, checkBrief as check, type BriefValues as Values, type BriefField as Checked } from "../lib/brief";
import { ArrowRight } from "./Icon";
import "./brief.css";
import "./thumbcta.css";

type Status = "idle" | "sending" | "sent" | "error";

export function BriefForm() {
  const id = useId();
  const [v, setV] = useState<Values>(EMPTY_BRIEF);
  const [touched, setTouched] = useState<Partial<Record<Checked, boolean>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [deliveryError, setDeliveryError] = useState("");
  const [serverErrors, setServerErrors] = useState<Partial<Record<Checked, string>>>({});
  const requestId = useRef<string | null>(null);
  const submitting = useRef(false);
  const confirmation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (status === "sent") confirmation.current?.focus();
  }, [status]);

  // Phones: keep a "Send brief" button within thumb reach while the form is on screen and its
  // own send button isn't. It steps aside while typing, so it never sits over the keyboard.
  const phone = useMedia(PHONE);
  const form = useRef<HTMLFormElement>(null);
  const send = useRef<HTMLButtonElement>(null);
  const [reach, setReach] = useState(false);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    const f = form.current;
    const b = send.current;
    if (!phone || !f || !b) return;
    let inForm = false;
    let atSend = false;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.target === f ? (inForm = e.isIntersecting) : (atSend = e.isIntersecting)));
      setReach(inForm && !atSend);
    });
    io.observe(f);
    io.observe(b);
    return () => io.disconnect();
  }, [phone, status]);
  const bar = phone && reach && !typing;

  const err = (k: Checked) => serverErrors[k] || (touched[k] ? check[k](v) : "");
  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    requestId.current = null;
    setServerErrors({});
    setDeliveryError("");
    if (status === "error") setStatus("idle");
    setV((p) => ({ ...p, [k]: val }));
  };
  const toggle = (s: string) =>
    set("services", v.services.includes(s) ? v.services.filter((x) => x !== s) : [...v.services, s]);

  // The form is its own route: each part lights its stretch of line once it's complete.
  const done = [!check.name(v) && !check.email(v), !check.message(v)];
  const group = (i: number) => `brief__group ${done[i] ? "is-done" : ""}`;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting.current) return;
    setTouched({ name: true, email: true, message: true });
    const firstBad = (Object.keys(check) as Checked[]).find((k) => check[k](v));
    if (firstBad) {
      const field = document.getElementById(`${id}-${firstBad}`);
      field?.focus({ preventScroll: true });
      field?.scrollIntoView({ block: "center" });
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
    submitting.current = true;
    setStatus("sending");
    setDeliveryError("");
    requestId.current ??= crypto.randomUUID();
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "Idempotency-Key": requestId.current },
        body: JSON.stringify(brief),
        signal: AbortSignal.timeout(15000),
      });
      const result = await res.json() as { ok?: boolean; id?: string; error?: string; errors?: Partial<Record<Checked, string>> };
      if (res.ok && result.ok === true && typeof result.id === "string" && result.id) {
        setStatus("sent");
      } else if (res.status === 422 && result.errors) {
        setServerErrors(result.errors);
        setStatus("idle");
        const firstField = (Object.keys(check) as Checked[]).find((key) => result.errors?.[key]);
        if (firstField) {
          const field = document.getElementById(`${id}-${firstField}`);
          field?.focus({ preventScroll: true });
          field?.scrollIntoView({ block: "center" });
        }
      } else {
        setDeliveryError(result.error || "Your brief couldn’t find its way to us just yet. Please try again in a moment.");
        setStatus("error");
      }
    } catch {
      setDeliveryError("The connection took a detour. Your brief is still here — please try sending it again.");
      setStatus("error");
    } finally {
      submitting.current = false;
    }
  };

  if (status === "sent") {
    return (
      <div className="brief brief--done" role="status" ref={confirmation} tabIndex={-1}>
        <Mark size={72} glow />
        <h2>Your next route starts here.</h2>
        <p>
          Thanks, {v.name.trim().split(" ")[0]}. Your brief is on its way to our team.
          We’ll reply to <strong>{v.email.trim()}</strong> with next steps.
        </p>
        <div className="brief__done-actions">
          <a href="/" className="btn btn--orange">
            <span className="btn__label">Back to home</span>
            <span className="btn__dot">
              <ArrowRight />
            </span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      id="brief"
      ref={form}
      className="brief"
      onSubmit={submit}
      noValidate
      aria-busy={status === "sending"}
      aria-describedby={`${id}-note`}
      onFocus={(e) => setTyping(e.target.matches("input:not([type=checkbox]):not([type=radio]), textarea"))}
      onBlur={() => setTyping(false)}
    >
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
              enterKeyHint="next"
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              aria-invalid={!!err("name")}
              aria-describedby={err("name") ? `${id}-name-err` : undefined}
              required
              maxLength={BRIEF_LIMITS.name}
              disabled={status === "sending"}
            />
          </Field>
          <Field id={`${id}-email`} label="Work email" error={err("email")}>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              enterKeyHint="next"
              value={v.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              aria-invalid={!!err("email")}
              aria-describedby={err("email") ? `${id}-email-err` : undefined}
              required
              maxLength={BRIEF_LIMITS.email}
              disabled={status === "sending"}
            />
          </Field>
        </div>
        <Field id={`${id}-company`} label="Business or website" hint="Optional">
          <input
            id={`${id}-company`}
            name="company"
            autoComplete="organization"
            enterKeyHint="next"
            value={v.company}
            maxLength={BRIEF_LIMITS.company}
            disabled={status === "sending"}
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
                <input type="checkbox" checked={v.services.includes(c.title)} onChange={() => toggle(c.title)} disabled={status === "sending"} />
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
                <input type="radio" name="timeline" checked={v.timeline === t} onChange={() => set("timeline", t)} disabled={status === "sending"} />
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
            maxLength={BRIEF_LIMITS.message}
            disabled={status === "sending"}
          />
        </Field>
      </fieldset>

      <div className={`brief__group brief__send ${done[0] && done[1] ? "is-ready" : ""}`}>
        <p className="brief__legend">
          <span>03</span> Send
        </p>
        {status === "error" && (
          <p className="brief__error" role="alert">
            {deliveryError} You can also reach us at{" "}
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
          </p>
        )}
        <button ref={send} type="submit" className="btn btn--orange" disabled={status === "sending"}>
          <span className="btn__label">{status === "sending" ? "Sending brief…" : "Send brief"}</span>
          <span className="btn__dot">
            <ArrowRight />
          </span>
        </button>
        <p id={`${id}-note`} className="brief__note">
          We only use these details to reply to your enquiry.
        </p>
      </div>

      {phone && (
        <div className={`thumb ${bar ? "is-shown" : ""}`} inert={!bar}>
          <button type="submit" className="btn btn--orange thumb__btn" disabled={status === "sending"}>
            <span className="btn__label">{status === "sending" ? "Sending brief…" : "Send brief"}</span>
            <span className="btn__dot">
              <ArrowRight />
            </span>
          </button>
        </div>
      )}
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
        <p id={`${id}-err`} className="field__error" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}
