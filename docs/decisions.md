# Decision log

Running log of product and design decisions for the Gunny portfolio. One entry per decision, newest at the bottom. Hard-to-reverse decisions with real trade-offs also get an ADR in `docs/adr/`.

## 2026-09-14 — Primary audience and visitor action

**Decision:** The primary visitor is a prospective client or collaborator for full-stack work. The primary action is to start a conversation (contact). Recruiters and hiring managers are the secondary path and must be able to scan experience quickly.

**Rejected:** Follower-first (trading and content audience). A follow CTA serves only that group; a contact CTA serves clients and recruiters alike.

**Consequences:**
- Trading and content creation appear as identity and credibility, not as the main funnel. They link out to the channels.
- The 3D studio is proof of craft and personality. It must never block reaching the contact action or the experience content.
- Content hierarchy, language, and how much screen the studio takes are decided downstream of this.

**References observed:** chanasoftware.com (client-acquisition structure: outcome headline, two CTAs, social proof, closing CTA) and wincheng.fyi (recruiter scan: tabs, dense text, machine-readable toggle).

## 2026-09-14 — Content hierarchy

**Decision:** Five sections in this order: Intro (with contact CTA), Work, Experience, About, Contact. Trading and content creation live inside About as two of three facets (developer, trader, creator), each with outbound links to the channels. Trading is discretionary, not software, so it is identity rather than portfolio work.

**The twist:** Studio objects act as links into the facets. The chart monitor leads to trading, the laptop and editor lead to work, the camera and mic lead to content. The room carries the trader and creator identity without adding navigation items.

**Rejected:**
- Trading and Content as top-level sections. Six nav items crowd mobile and make clients pass two non-hiring sections.
- Work with filters (software, trading tools, content). Only strong when trading output is software, which it is not.

**Consequences:** Navigation stays at four items plus the CTA. The studio's interactive objects need a small set of meaningful targets, not eleven controls.

## 2026-09-14 — Studio's role in navigation

**Decision:** Hero stage with the camera move borrowed from the pinned concept. See ADR 0001. Prototypes compared: https://claude.ai/code/artifact/91122ad2-f684-4042-85ef-6b6532bfb25c

## 2026-09-14 — Language

**Decision:** English primary. Thai appears where it earns trust with a Thai client: testimonials in the original with an English line beneath, a Thai line in the Contact section, Thai-capable fonts throughout. No language toggle. `lang` moves to `en`.

**Rejected:** Full bilingual toggle (doubles copy and testing, rarely used); Thai primary (recruiters and international clients bounce).

**Consequence:** If it later turns out most clients are Thai-only readers, a bilingual toggle is a retrofit, accepted knowingly.

## 2026-09-14 — Visual direction, round 1 rejected

**Rejected:** Warm paper, Night studio, Coral field (https://claude.ai/code/artifact/38b16235-d071-4376-8664-bba3e87ffd09). All three read as "designed" marketing pages. The wanted feel is very minimal, text-first, in the spirit of wincheng.fyi, while still reading as a tech nerd's page. Round 2 explores that with the coral palette kept as a small accent.

## 2026-09-14 — Naming, location, evidence

**Decision:** The brand is **GunnyTrader** everywhere (wordmark, titles, wall). Sila is the personal name, introduced once in the intro. Based in Bangkok, Thailand, shown in the intro and experience rows. No real projects, testimonials or channel links exist yet; everything is a labelled placeholder until replaced.

**Note:** Naming leans the identity toward the trader. Content hierarchy (Work first, trading as a facet) stands; the wordmark carries the trader identity, the sections carry the developer one.

## 2026-09-14 — Visual direction, round 2: Shell Transcript

**Decision:** The site reads as a light-theme shell session. Each section is the output of a command Sila typed (`cat intro.txt`, `ls work/`, `cat experience.log`, `cat about.md`, `open studio.glb`). The studio is the output of `open studio.glb`, with its three hotspots as list items. Coral is used only for the prompt glyph, links and the active hotspot. One character grid, hairline rules only, no cards, boxes or shadows. Chosen on the impeccable decision page (seed 18ab2a10, assigned direction, code-led).

**Alternates offered:** Editor Buffer (one markdown file in an editor with a line-number gutter), One-Bit Desktop (competitive), the minimal dev résumé as the standing exit.

**Disciplines borrowed from declined worlds:** visible provenance line on every entry; studio states named in text; one strict character grid; total commitment to the light ground; nothing labelled twice.

## 2026-09-14 — Visual direction, round 2 rejected

**Rejected:** Shell Transcript (https://claude.ai/code/artifact/2643e80e-d112-4fa3-a832-1b1d09d6e297). Read as cluttered: monospace everywhere, prompt lines, provenance captions and dense rows added elements rather than removing them.

**Sharpened brief:** minimal *and* premium. Generous whitespace, few words, refined small type, the studio given room as the one object on the page, hairline structure, coral used once or twice. Round 3 explores this.

## 2026-09-14 — Visual direction, round 3 offered

Three premium-minimal directions built on the same restrained lower page (small caps labels, hairline rows, no cards, coral once): **Gallery** (room leads like a hung work, Geist light), **Statement** (large light headline, room full width beneath, Hanken Grotesk), **Atelier** (asymmetric, Bodoni headline, tall room). Awaiting choice.

## 2026-09-14 — Visual direction: Gallery, split hero

**Decision:** Gallery direction with a split hero. Desktop: heading, one-line lede and the contact link on the left (5 columns), the studio on the right (7 columns), a small caption line under the room. Mobile: heading, lede, link, then the room. Below the fold: small tracked-caps section labels in a left column, hairline rows for Work and Experience, three short facets for About, the email set large for Contact. No cards, no shadows, no numbered anything. Coral appears as a dot before the CTA, on the hotspot rings, and on hover. Typeface: Geist, light weight for the heading. Ground #f6f5f2, ink #141311, muted #6f6b66, rule #e2dfda.

**Rejected on the way:** three marketing-style directions (round 1), Shell Transcript (round 2), Statement and Atelier (round 3).

**Why it holds:** the studio is the one object on the page, the contact link is above the fold on every device, and the lower page has almost nothing that can get cluttered as real content arrives.

## 2026-09-14 — Layout reference supplied

**Observed (user screenshot, a personal site at localhost:3000, "Aarav Y"):** near-black ground; stacked three-line monogram top-left; a single tracked-caps nav link top-right with an underline; a small tick-strip indicator top-centre; left column vertically centred with a tracked-caps location line, a bold condensed name, three tracked-caps role lines, and a two-line lede in a plain sans; right half filled by the graphic (a strip of vertical photo slices); footer with roles and location bottom-left and GITHUB / LINKEDIN / WOOZLIT bottom-right in tracked caps. Full-viewport composition, generous space.

**Applied:** the Gallery hero adopts this structure with the studio as the right-half graphic. Ground colour (dark as in the reference, or the light Gallery paper) is put to the user as a visual choice.

## 2026-09-14 — Visual direction locked: reference layout, light ground

**Decision:** The hero follows the supplied reference structure on the light Gallery ground. Full-viewport hero: stacked monogram (GU / NN / Y, Archivo condensed 800) top-left; tick strip top-centre; tracked-caps nav top-right (Work, Experience, About, Contact) with the active item underlined; left column vertically centred with location line, condensed name GUNNYTRADER, three role lines, two-line lede, and the Start a conversation link with a coral dot; the studio fills the right half, square, capped at 70svh; footer with Sila / role / location bottom-left and GitHub / X / YouTube bottom-right. Below the fold the Gallery lower page stands: caps labels in a left column, hairline rows, three facets, the email set large in condensed caps. Ground #f6f5f2, ink #141311, muted #6f6b66, rule #e2dfda, coral #ce4257. Prototype: https://claude.ai/code/artifact/df31bb99-ef7e-4b43-86e3-adb426257711 (r-light).

**Rejected:** dark ground (#121212), offered because the reference was dark.

**Mobile:** monogram and a single nav link in the header, then location, name, roles, lede, link, then the room; the footer block is hidden in the hero and its links live in Contact.

## 2026-09-14 — 3D feasibility measured

See `docs/3d-feasibility.md`. The real GLB works in the hero slot with hotspots and camera focus. Cold-load cost is dominated by the 2.4 MB PNG poster and the 4.5 MB uncompressed GLB; WebP (76 KB) and brotli on the wire (1.3 MB) fix most of it. Mobile frame rate is unmeasured on a real device.

## 2026-09-14 — Mobile and loading policy

**Decision:** Poster first everywhere, live scene as a progressive enhancement after first paint, held back on save-data or 2G/3G, lighter rendering on phones, GLB compressed on the wire, hero interactions limited to orbit, hotspots, focus and reset. See ADR 0002. Moods, light slider, ambient audio, snapshot, drawer, chair, the eleven object panels, localStorage state and the help dialog are removed.

## 2026-09-14 — Hosting and contact

**Decision:** Hosted on Vercel as static Vite output. The GLB is pre-compressed at build time (brotli, gzip fallback) and served with the correct `Content-Encoding` via Vercel headers config, since Vercel does not reliably compress `model/gltf-binary`. Contact is a plain `mailto:` link, no form, no backend.

**Rejected:** Cloudflare Pages (edge compression for free, but a second platform); a contact form (needs a backend or a third-party service for no gain at this scale).
