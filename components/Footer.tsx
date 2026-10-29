export function Footer() {
  return (
    <footer className="flex h-[100px] items-center justify-between border-t border-border px-12 max-sm:h-auto max-sm:flex-col max-sm:items-start max-sm:gap-3 max-sm:px-6 max-sm:py-6">
      <p className="font-display text-[12px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
        © 2026 NICK.ODE. ALL RIGHTS RESERVED.
      </p>
      <a
        href="#top"
        className="group flex min-h-11 items-center gap-2 font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text"
      >
        BACK TO TOP
        <span
          aria-hidden
          className="icon-arrow-up transition-transform duration-300 ease-brand group-hover:-translate-y-1 motion-reduce:transition-none"
        />
      </a>
    </footer>
  );
}
