import { MaskIcon } from "@/components/ui/MaskIcon";
import { contact } from "@/content/contact";
import { ContactForm } from "./ContactForm";

/* Contact (DESIGN.md 7.8, Figma 3:30): oversized headline, an invitation, then two
   columns: email, location and socials on the left, the form on the right. */
const label = "font-display text-[12px] font-normal uppercase leading-[1.5] tracking-[0.18em] text-text-muted";

export function ContactSection() {
  return (
    <section id="contact" className="px-[var(--gutter)] pb-[96px] pt-[72px]">
      <p className="font-display text-[13px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">07 — CONTACT</p>
      <h2 className="mt-10 font-display text-[clamp(44px,7.92vw,114px)] font-semibold uppercase leading-none tracking-[0.025em] text-text">
        LET&apos;S WORK TOGETHER
      </h2>
      <div aria-hidden className="mt-10 h-px w-full bg-border" />

      <div className="mt-10 grid gap-16 lg:grid-cols-2 lg:gap-24">
        <div className="max-w-[552px]">
          <p className="font-body text-[19px] leading-[34px] text-text-2">
            Have a project in mind, or just want to say hello? Send a message and I will get back to you within a couple of days.
          </p>
          <dl className="mt-8 flex flex-col gap-8">
            <div>
              <dt className={label}>EMAIL</dt>
              <dd className="mt-[6px]">
                <a href={`mailto:${contact.email}`} className="font-body text-[19px] leading-[34px] text-text transition-opacity duration-300 hover:opacity-70 max-md:inline-flex max-md:min-h-11 max-md:items-center">
                  {contact.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className={label}>LOCATION</dt>
              <dd className="mt-[6px] font-body text-[19px] leading-[34px] text-text">{contact.location}</dd>
            </div>
            <div>
              <dt className={label}>SOCIALS</dt>
              <dd className="mt-[14px]">
                <ul className="flex flex-col gap-[14px] max-md:gap-0">
                  {contact.socials.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex w-fit items-center gap-[10px] font-display text-[14px] font-medium uppercase leading-5 tracking-[0.12em] text-text max-md:min-h-11"
                      >
                        {s.label}
                        <MaskIcon name="arrow-right" width={16} className="transition-transform duration-300 ease-brand group-hover:translate-x-1 motion-reduce:transition-none" />
                      </a>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
        </div>

        <ContactForm email={contact.email} />
      </div>
    </section>
  );
}
