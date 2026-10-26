export function Footer() {
  return (
    <footer className="flex h-[100px] items-center justify-between border-t border-border px-12">
      <p className="font-display text-[12px] font-normal uppercase leading-[1.4] tracking-[0.18em] text-text-muted">
        © 2026 NICK.ODE. ALL RIGHTS RESERVED.
      </p>
      <a
        href="#top"
        className="group flex items-center gap-2 font-display text-[14px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text"
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
