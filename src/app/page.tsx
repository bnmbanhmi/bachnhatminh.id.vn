import Link from "next/link";
import HandwritingCard from "@/components/HandwritingCard";

export default function Home() {
  return (
    <main className="min-h-[90vh] flex flex-col items-center justify-center py-16 px-5 max-w-[480px] mx-auto text-[#5C4A45]">
      {/* Name tag card */}
      <HandwritingCard className="mb-12" />

      {/* Major sections outline */}
      <div className="w-full space-y-9 text-left">
        {/* Projects */}
        <section className="space-y-3.5">
          <h2 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-[#2D211E] pb-1.5 border-b border-[#E5CEC3]">
            projects
          </h2>
          <div className="space-y-3.5 text-sm pt-0.5">
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <a
                  href="https://nhaminhbach.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B2C27] hover:text-[#FF7A5C] font-semibold underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors"
                >
                  nhaminhbach.com
                </a>
                <span className="text-[11px] text-[#8C7671] font-mono flex-shrink-0 whitespace-nowrap">2026</span>
              </div>
              <div className="text-xs text-[#7A6863]">
                Solo 0-to-1 project • Grew to ~150 users within 7 days of launch •{" "}
                <Link
                  href="/work/nhaminhbach"
                  className="text-[#5C4A45] hover:text-[#FF7A5C] underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors"
                >
                  notes
                </Link>
              </div>
              <p className="text-xs text-[#52413D] leading-snug">
                Spatial rental discovery platform aggregating social housing feeds across Hanoi & HCMC into structured map pins, direct contact triggers, and zero-state recovery.
              </p>
            </div>
          </div>
        </section>

        {/* Experience */}
        <section className="space-y-3.5">
          <h2 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-[#2D211E] pb-1.5 border-b border-[#E5CEC3]">
            experience
          </h2>
          <div className="space-y-3.5 text-sm pt-0.5">
            <div className="space-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[#3B2C27] font-semibold">
                  AI4LIFE | Institute for AI Innovation and Societal Impact | HUST
                </span>
                <span className="text-[11px] text-[#8C7671] font-mono flex-shrink-0">
                  Mar 2025 – Aug 2025
                </span>
              </div>
              <div className="text-xs text-[#7A6863]">
                Intern Research Student, AIoT Lab
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[#3B2C27] font-semibold">
                  BKAI | The International Research Center for Artificial Intelligence | HUST
                </span>
                <span className="text-[11px] text-[#8C7671] font-mono flex-shrink-0">
                  Oct 2024 – Aug 2025
                </span>
              </div>
              <div className="text-xs text-[#7A6863]">
                Research Student, Bio-informatics Lab
              </div>
              <p className="text-xs text-[#52413D] leading-snug">
                <a
                  href="https://doi.org/10.1016/j.bspc.2026.110651"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B2C27] hover:text-[#FF7A5C] font-semibold underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors"
                >
                  ECGFusion
                </a>
                : Multi-modal deep fusion of time-series and spectral representations for heart disease detection (BSPC Q1 Journal).
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <a
                  href="https://www.facebook.com/gdgoc.hust"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B2C27] hover:text-[#FF7A5C] font-semibold underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors"
                >
                  Google Developer Group on Campus – HUST
                </a>
                <span className="text-[11px] text-[#8C7671] font-mono flex-shrink-0 whitespace-nowrap">Nov 2022 – Aug 2025</span>
              </div>
              <div className="text-xs text-[#7A6863]">
                Sub-lead, Head of Operations
              </div>
            </div>
          </div>
        </section>

        {/* Achievements */}
        <section className="space-y-3.5">
          <h2 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-[#2D211E] pb-1.5 border-b border-[#E5CEC3]">
            achievements
          </h2>
          <div className="space-y-3.5 text-sm pt-0.5">
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <a
                  href="https://news.laodong.vn/ldt/thi-truong/diem-nhan-tu-cuoc-thi-kham-pha-khoa-hoc-du-lieu-asean-2025-1600914.ldo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B2C27] hover:text-[#FF7A5C] font-semibold underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors"
                >
                  National Champion — ASEAN Data Science Explorers
                </a>
                <span className="text-[11px] text-[#8C7671] font-mono flex-shrink-0 whitespace-nowrap">Oct 2025</span>
              </div>
              <div className="text-xs text-[#7A6863]">
                ASEAN Foundation & SAP • Regional Finalist
              </div>
              <p className="text-xs text-[#52413D] leading-snug">
                <strong>SeekWell</strong>: AI healthcare ecosystem democratizing early skin cancer screening for outdoor workers using Vision Transformers (ViT) and SAP Analytics Cloud UV/climate analytics.
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <a
                  href="https://dantri.com.vn/thoi-su/pgsts-nguyen-phi-le-sang-kien-an-toan-giao-thong-viet-nam-khong-chi-la-mot-cuoc-thi-20241213003519921.htm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B2C27] hover:text-[#FF7A5C] font-semibold underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors"
                >
                  Runner-up — Sáng kiến An toàn Giao thông Việt Nam
                </a>
                <span className="text-[11px] text-[#8C7671] font-mono flex-shrink-0 whitespace-nowrap">Nov 2024</span>
              </div>
              <div className="text-xs text-[#7A6863]">
                Dân trí Newspaper
              </div>
              <p className="text-xs text-[#52413D] leading-snug">
                <strong>eTraffic</strong>: Intelligent traffic data standardization platform featuring real-time risk heat maps, V2X coordination, and predictive accident prevention.
              </p>
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="space-y-3.5">
          <h2 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-[#2D211E] pb-1.5 border-b border-[#E5CEC3]">
            education
          </h2>
          <div className="space-y-3.5 text-sm pt-0.5">
            <div className="space-y-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[#3B2C27] font-semibold">
                  Hanoi University of Science and Technology
                </span>
                <span className="text-[11px] text-[#8C7671] font-mono flex-shrink-0 whitespace-nowrap">2022 – 2026</span>
              </div>
              <div className="text-xs text-[#7A6863]">
                B.S. in Data Science and AI
              </div>
              <p className="text-xs text-[#52413D] leading-snug">
                Graduation Thesis: <strong>coretext</strong> — file-native context routing and deterministic discovery protocols for autonomous coding agents.
              </p>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[#3B2C27] font-semibold">
                  Hanoi – Amsterdam High School for the Gifted
                </span>
                <span className="text-[11px] text-[#8C7671] font-mono flex-shrink-0 whitespace-nowrap">2019 – 2022</span>
              </div>
            </div>
          </div>
        </section>

        {/* Links */}
        <section className="space-y-3.5">
          <h2 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-[#2D211E] pb-1.5 border-b border-[#E5CEC3]">
            links
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium pt-0.5">
            <a
              href="https://github.com/bnmbanhmi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5C4A45] hover:text-[#FF7A5C] underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors"
            >
              github
            </a>
            <span className="text-[#D9C4BA]">•</span>
            <a
              href="https://linkedin.com/in/bachnhatminh"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#5C4A45] hover:text-[#FF7A5C] underline underline-offset-3 decoration-[#E5CEC3] hover:decoration-[#FF7A5C] transition-colors"
            >
              linkedin
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
