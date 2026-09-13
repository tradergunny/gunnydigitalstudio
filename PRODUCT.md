# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a prospective client or collaborator evaluating Sila (GunnyTrader) for full-stack web work, usually arriving from a referral, a social profile or a search, deciding within a minute whether to start a conversation.

Secondary: a recruiter or hiring manager scanning experience and selected work quickly, often on a phone.

Tertiary (not designed for, but present): followers of the trading and content channels who want to see the person behind them.

## Product Purpose

A personal portfolio for Sila, publicly known as GunnyTrader: full-stack developer, discretionary trader, content creator, based in Bangkok, Thailand. The site exists to get a client or collaborator to start a conversation, and to let a recruiter read experience without friction. Success is a contact message or a booked call, with experience and work legible in under a minute on any device.

## Positioning

The one thing a neighbouring portfolio cannot copy is the studio: a Blender model of Sila's real workroom (the GunnyTrader wall, the chart monitor, the code display, the camera case) rendered live in the browser as the hero. It is proof of craft (3D on the web, built end to end) and the visual carrier of the three-facet identity. The room is a stage, never the navigation.

## Operating Context

Visitors read on desktop and phone. Some arrive on low-power devices or with WebGL blocked; the site must read fully without the 3D scene. English is the primary language; Thai appears where it earns trust with a Thai client (testimonials in the original, a Thai line in Contact). Trading is discretionary and lives on external channels; it is identity, not portfolio work. Content creation (video about building, trading and the studio) also lives on external channels.

## Capabilities and Constraints

- Sections, in order: Intro (with the contact CTA), Work, Experience, About (three facets: Developer, Trader, Creator), Contact. Four nav items plus the CTA.
- The studio hero shows three hotspots: chart monitor to the Trader facet, laptop to Work, camera to the Creator facet. Activating one moves the camera to the object, then scrolls to the section.
- The studio render (`public/studio-poster.png`, 1400×1400) is the fallback and first paint; the live scene (`public/models/studio.glb`, 4.5 MB, meshopt) enhances it.
- Stack is the existing Vite + TypeScript + Three.js codebase (no framework). Hosted on Vercel as static output; the GLB is pre-compressed at build and served with brotli via Vercel headers.
- Hero interactions are limited to orbit within limits, three hotspots, focus and reset. Moods, light slider, ambient audio, snapshot, drawer, chair and the object panels are removed.
- Mobile and loading policy: poster first everywhere, live scene as a progressive enhancement (ADR 0002).
- Contact is a plain mail link; no form, no backend.

## Brand Commitments

- Name: **GunnyTrader** everywhere (wordmark, wall, titles). Sila is the personal name, introduced in the intro line.
- Palette: coral #ce4257, #ff7f51, with a little #ff9b54, used as small accents only.
- Binding visual constraint from the user: very minimal, text-first, in the spirit of wincheng.fyi, while still reading as a tech nerd's page. Three polished marketing-style directions (warm paper with serif italic, dark studio, coral field) were rejected as too designed.
- Voice: first person, plain, specific. No hype.

## Evidence on Hand

- Studio render: `public/studio-poster.png`. Studio model: `public/models/studio.glb`.
- No real projects, testimonials or channel links are supplied yet. All Work entries, experience rows, testimonials and channel links are labelled placeholders until Sila replaces them. Do not fabricate clients, metrics or quotes presented as real.

## Product Principles

1. Contact is one click from anywhere; nothing depends on the 3D scene.
2. The room proves craft; it never hides content.
3. Dense and legible beats decorated: a recruiter scans, a client reads.
4. Three facets, one person: trading and content explain who Sila is, work shows what Sila builds.
5. Replace placeholders with truth before launch; never ship a fake claim.

## Accessibility & Inclusion

Keyboard-reachable hotspots and sections; reduced-motion honoured for camera moves; the render carries alt text describing the room; Thai text uses a Thai-capable font.
