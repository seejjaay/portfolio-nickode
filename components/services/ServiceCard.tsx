import type { Service } from "@/content/services";

/* One service card (DESIGN.md 7.3.1): index, title, summary, tag chips. The
   scene positions and transforms it; this only lays out what is on it. */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <li className="svc-card" data-svc-card>
      <span className="font-display text-[14px] font-normal leading-[1.4] tracking-[0.18em] text-text-muted">
        {String(service.index).padStart(2, "0")}
      </span>
      <h3 className="mt-3 font-display text-[28px] font-medium uppercase leading-[1.15] tracking-[0.04em] text-text md:text-[30px]">
        {service.title}
      </h3>
      <p className="mt-4 text-[17px] leading-[1.6] text-text-2">{service.summary}</p>
      <ul className="mt-auto flex flex-wrap gap-2 pt-5">
        {service.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-control border border-border px-[10px] py-[5px] font-display text-[12px] font-medium uppercase leading-[1.4] tracking-[0.12em] text-text-muted"
          >
            {tag}
          </li>
        ))}
      </ul>
      {/* Dims the card once others are on top of it. A veil, not card opacity, so a
          dimmed card still hides the ones behind it. */}
      <span aria-hidden className="svc-veil" />
    </li>
  );
}
