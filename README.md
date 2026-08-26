# bachnhatminh.id.vn

Personal Portfolio & Product Design Systems Hub for **Bach Nhat Minh** ([@bnmbanhmi](https://github.com/bnmbanhmi)).

- **Live Domain**: [https://bachnhatminh.id.vn](https://bachnhatminh.id.vn)
- **Deployment**: Static Export on Cloudflare Pages / Cloudflare Worker Assets
- **Stack**: Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Lucide Icons

---

## Features

- **Interactive Signature Handwriting Card**: Recreated using multi-stroke SVG path animations with responsive touch/hover triggers.
- **Nhaminhbach Flagship Case Study**: Deep-dive interactive teardowns on Norman's Gulf of Execution (10% $\rightarrow$ 73% CTA lift), Edward Tufte Data-Ink optimization, and Poka-Yoke ZeroState recovery.
- **Telemetry-Driven UX**: PostHog HogQL query demonstrations proving funnel deltas.
- **AI-Legible Design Tokens**: Declarative `DESIGN.md` specification for zero-drift AI component authoring.

---

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build static export for Cloudflare
npm run build
```

---

## Cloudflare Deployment

Build output is generated statically into `./out` via `next.config.ts` (`output: 'export'`).
Deploy to Cloudflare via:

```bash
npx wrangler pages deploy out/ --project-name=bachnhatminh-id-vn
```
