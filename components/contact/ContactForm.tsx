"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MaskIcon } from "@/components/ui/MaskIcon";
import { LIMITS, validateContact, type ContactErrors, type ContactFields } from "@/lib/contact";

/* The contact form (DESIGN.md 7.8): underline fields, client-side validation, and a
   POST to /api/contact, which emails the message. A hidden "website" field and a
   fill-time check catch simple bots; the route repeats every check. */
type Status = "idle" | "sending" | "sent" | "error";

const labelCls = "block font-display text-[12px] font-normal uppercase leading-[1.5] tracking-[0.18em] text-text-muted";
const fieldCls =
  "block w-full resize-none rounded-none border-0 border-b border-border-strong bg-transparent font-body text-[16.5px] leading-[29px] text-text outline-none transition-colors duration-300 placeholder:text-text-muted focus:border-text aria-invalid:border-text";

export function ContactForm({ email }: { email: string }) {
  const [fields, setFields] = useState<ContactFields>({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState("");
  const [fallback, setFallback] = useState(false); // point at the email address in the error
  const opened = useRef(0); // when the form appeared, for the fill-time check
  const honeypot = useRef<HTMLInputElement>(null);

  useEffect(() => {
    opened.current = Date.now();
  }, []);

  const set = (k: keyof ContactFields) => (e: { target: { value: string } }) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined })); // clear a complaint as soon as it is being fixed
  };
  const blur = (k: keyof ContactFields) => () => {
    const e = validateContact(fields)[k];
    if (fields[k] && e) setErrors((x) => ({ ...x, [k]: e }));
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    if (status === "sending") return;
    const found = validateContact(fields);
    setErrors(found);
    const first = (Object.keys(found) as (keyof ContactFields)[])[0];
    if (first) {
      document.getElementById(`contact-${first}`)?.focus();
      return;
    }
    setStatus("sending");
    setNote("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, website: honeypot.current?.value ?? "", elapsed: Date.now() - opened.current }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; errors?: ContactErrors; fallback?: boolean };
      if (res.ok) {
        setStatus("sent");
        setFields({ name: "", email: "", message: "" });
        return;
      }
      if (data.errors) setErrors(data.errors);
      setNote(data.error ?? "Something went wrong.");
      setFallback(!!data.fallback);
      setStatus("error");
    } catch {
      setNote("I could not reach the server. Check your connection and try again.");
      setFallback(false);
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div role="status" className="flex min-h-[320px] max-w-[552px] flex-col items-start justify-center gap-6">
        <p className="font-display text-[clamp(28px,3vw,40px)] font-medium uppercase leading-[1.2] tracking-[0.02em] text-text">Message sent</p>
        <p className="font-body text-[20px] leading-[1.7] text-text-2">Thanks for reaching out. I will get back to you within a couple of days.</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            opened.current = Date.now();
          }}
          className="font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text underline underline-offset-[6px] transition-opacity duration-300 hover:opacity-70"
        >
          SEND ANOTHER
        </button>
      </div>
    );
  }

  const err = (k: keyof ContactFields) =>
    errors[k] ? (
      <p id={`contact-${k}-error`} role="alert" className="absolute left-0 top-full mt-[6px] font-body text-[14px] leading-[1.3] text-text">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={submit} noValidate className="flex max-w-[552px] flex-col gap-9">
      {/* Honeypot: invisible to people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="relative">
        <label htmlFor="contact-name" className={labelCls}>
          NAME
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={LIMITS.name}
          placeholder="Your name"
          value={fields.name}
          onChange={set("name")}
          onBlur={blur("name")}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={`${fieldCls} mt-3 h-[54px] pb-6`}
        />
        {err("name")}
      </div>

      <div className="relative">
        <label htmlFor="contact-email" className={labelCls}>
          EMAIL
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={LIMITS.email}
          placeholder="you@email.com"
          value={fields.email}
          onChange={set("email")}
          onBlur={blur("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={`${fieldCls} mt-3 h-[54px] pb-6`}
        />
        {err("email")}
      </div>

      <div className="relative">
        <label htmlFor="contact-message" className={labelCls}>
          MESSAGE
        </label>
        <textarea
          id="contact-message"
          name="message"
          maxLength={LIMITS.message}
          placeholder="Tell me about your project"
          value={fields.message}
          onChange={set("message")}
          onBlur={blur("message")}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${fieldCls} mt-3 h-[122px]`}
        />
        {err("message")}
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <button
          type="submit"
          disabled={status === "sending"}
          className="inline-flex h-14 items-center gap-[10px] rounded-control bg-text px-9 font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-inverse transition-[transform,box-shadow,opacity] duration-300 ease-brand enabled:hover:-translate-y-0.5 enabled:hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--text)_20%,transparent)] disabled:opacity-60 motion-reduce:transition-none"
        >
          {status === "sending" ? "SENDING…" : "SEND MESSAGE"}
          {status !== "sending" && <MaskIcon name="arrow-right" width={16} />}
        </button>
        {status === "error" && (
          <p role="alert" className="max-w-[320px] font-body text-[15px] leading-[1.5] text-text-2">
            {note}
            {fallback && (
              <>
                {" "}
                <a href={`mailto:${email}`} className="text-text underline underline-offset-4">
                  {email}
                </a>
              </>
            )}
          </p>
        )}
      </div>
    </form>
  );
}
