import Link from "next/link";

export const metadata = {
  title: "nhaminhbach — Bach Nhat Minh",
  description: "Notes on nhaminhbach spatial housing discovery.",
};

export default function NhaminhbachCaseStudy() {
  return (
    <main className="min-h-screen py-16 px-5 max-w-[580px] mx-auto text-[#5C4A45]">
      {/* Back link */}
      <Link
        href="/"
        className="inline-block text-xs font-medium text-[#7A6863] hover:text-[#FF7A5C] underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors mb-10"
      >
        ← back
      </Link>

      <article className="space-y-10">
        {/* Header */}
        <header className="space-y-2 border-b border-[#E5CEC3]/70 pb-6">
          <h1 className="text-2xl font-bold text-[#3B2C27] tracking-tight">
            nhaminhbach
          </h1>
          <div className="flex items-center gap-3 text-xs text-[#8C7671] font-mono">
            <span>2026</span>
            <span>•</span>
            <a
              href="https://nhaminhbach.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#3B2C27] hover:text-[#FF7A5C] font-semibold underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors"
            >
              nhaminhbach.com
            </a>
          </div>
        </header>

        {/* Outline Sections */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#4A3A35]">
            overview
          </h2>
          <p className="text-sm leading-relaxed text-[#7A6863]">
            Spatial rental discovery platform aggregating and mapping social housing listings across Hanoi and Ho Chi Minh City.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#4A3A35]">
            information architecture
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#7A6863]">
            <li>Hierarchical faceted navigation: City → Category → Map Pin → Listing Specs.</li>
            <li>Elimination of synthetic classified title noise in favor of structured glance tokens.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#4A3A35]">
            telemetry & iteration
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#7A6863]">
            <li>PostHog telemetry tracking funnel progression from listing inspection to outbound contact.</li>
            <li>Conversion optimization by refining action pathways from passive citation to direct contact triggers.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#4A3A35]">
            state handling
          </h2>
          <ul className="list-disc list-inside space-y-1 text-sm text-[#7A6863]">
            <li>Full URL query parameter serialization for coordinates, filters, and active inspections.</li>
            <li>Zero-state fallback handling for empty spatial queries.</li>
          </ul>
        </section>
      </article>
    </main>
  );
}
