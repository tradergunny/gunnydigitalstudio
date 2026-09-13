/**
 * Every word, link and entry on the page. Layout code reads this module and nothing else,
 * so real projects, roles and channels replace the samples here without touching markup.
 *
 * Anything synthetic carries `placeholder: true`. One footer note appears while any entry
 * is still flagged; entries are never labelled individually.
 */

/** The four sections below the hero, in page order. Also the four nav items. */
export type SectionId = 'work' | 'experience' | 'about' | 'contact';

/** The three sides of the identity presented in About. */
export type FacetId = 'developer' | 'trader' | 'creator';

/** The studio objects a hotspot can sit on. A subset of the renderer's object ids. */
export type HotspotId = 'workstation' | 'laptop' | 'camera';

export interface Placeholder {
  /** True while the entry is synthetic and waiting to be replaced. */
  placeholder: boolean;
}

export interface WorkEntry extends Placeholder {
  title: string;
  summary: string;
  year: string;
  /** External URL, or null while there is nothing to open. */
  href: string | null;
}

export interface ExperienceEntry extends Placeholder {
  period: string;
  role: string;
  place: string;
  summary: string;
}

export interface Facet {
  id: FacetId;
  label: string;
  body: string;
  /** Where the facet leads: a section on this page, or an outbound channel. */
  link: { label: string; href: string | null };
}

export interface Testimonial extends Placeholder {
  /** The quote in the language it was given in. */
  quote: string;
  /** BCP 47 tag for `quote`, so Thai is marked and rendered with a Thai face. */
  lang: string;
  /** English rendering, shown beneath a Thai quote. Null when the quote is already English. */
  english: string | null;
  attribution: string;
}

export interface Channel extends Placeholder {
  label: string;
  /** Null renders as plain text rather than a dead link. */
  href: string | null;
}

export interface Hotspot {
  id: HotspotId;
  label: string;
  /** The section the hotspot leads to. */
  section: SectionId;
  /** The facet within that section, when the hotspot points at one. */
  facet?: FacetId;
  /** Position on the poster, in per cent of its width and height. */
  poster: { x: number; y: number };
  /** Object position in the studio model, for the live scene's camera focus. */
  position: [number, number, number];
}

export const site = {
  /** The stacked monogram, one line per element. */
  monogram: ['GU', 'NN', 'Y'],
  wordmark: 'GunnyTrader',
  person: 'Sila',
  location: 'Bangkok / Thailand',
  roles: ['Full-stack developer', 'Discretionary trader', 'Content creator'],
  lede: 'I build software for small businesses, trade the morning session, and film both from the room you are looking at.',
  /** The primary action. Shown as visible text wherever it is linked. */
  email: 'tradergunny@gmail.com',
  contactLabel: 'Start a conversation',
  thaiLine: 'คุยงานเป็นภาษาไทยได้ครับ — อยู่กรุงเทพฯ',
  poster: {
    alt: 'A 3D render of the GunnyTrader studio in Bangkok: a corner desk with a chart monitor, a code display and a laptop, a camera in a glass case, and the GunnyTrader wall behind.',
    caption: 'The studio — Bangkok',
    /** Names what the slot is currently showing. Becomes "Live 3D" once the scene loads. */
    state: 'Still render',
  },
  /** Shown once, in the page footer, while any entry is flagged placeholder. */
  placeholderNote: 'Sample entries shown — work, experience and links are placeholders.',
} as const;

export const sections: { id: SectionId; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
];

export const work: WorkEntry[] = [
  {
    title: 'GunnyTrader studio',
    summary: 'This page, and the Blender model of my workroom that opens it.',
    year: '2026',
    href: 'https://github.com/tradergunny/gunnydigitalstudio',
    placeholder: false,
  },
  {
    title: 'Trading journal',
    summary: 'A private log for reviewing setups, sizing and outcomes.',
    year: '2025',
    href: null,
    placeholder: true,
  },
  {
    title: 'Operations dashboard',
    summary: 'A daily view that replaced a shared spreadsheet.',
    year: '2025',
    href: null,
    placeholder: true,
  },
  {
    title: 'Inventory tracker',
    summary: 'Stock levels and reorder points for a small shop.',
    year: '2024',
    href: null,
    placeholder: true,
  },
];

export const experience: ExperienceEntry[] = [
  {
    period: '2021 —',
    role: 'Freelance full-stack developer',
    place: 'Bangkok, Thailand',
    summary: 'Web and product work for small businesses, end to end.',
    placeholder: true,
  },
  {
    period: '2019 — 2021',
    role: 'Developer, product team',
    place: 'Bangkok, Thailand',
    summary: 'Front-end and API work on a customer-facing product.',
    placeholder: true,
  },
  {
    period: '2018 — 2019',
    role: 'Junior developer',
    place: 'Bangkok, Thailand',
    summary: 'Internal tools, maintenance and a lot of reading.',
    placeholder: true,
  },
];

export const facets: Facet[] = [
  {
    id: 'developer',
    label: 'Developer',
    body: 'I build full-stack web software — interface, API and deployment — usually as the one person carrying the whole thing. TypeScript most days, whatever the job needs otherwise.',
    link: { label: 'Selected work', href: '#work' },
  },
  {
    id: 'trader',
    label: 'Trader',
    body: 'I trade the morning session discretionarily. My own money, my own judgement, and nothing I write or post is financial advice.',
    link: { label: 'Follow on X', href: 'https://x.com/GunnyTrader' },
  },
  {
    id: 'creator',
    label: 'Creator',
    body: 'I film what I build and what I trade, from the same room at the top of this page. Long takes, few edits.',
    link: { label: 'Watch on YouTube', href: null },
  },
];

export const testimonials: Testimonial[] = [
  {
    quote: 'ตัวอย่างคำรับรอง จะแทนที่ด้วยข้อความจริงก่อนเปิดเว็บไซต์',
    lang: 'th',
    english: 'Sample testimonial, replaced with a real one before launch.',
    attribution: 'Placeholder',
    placeholder: true,
  },
  {
    quote: 'Sample testimonial, replaced with a real one before launch.',
    lang: 'en',
    english: null,
    attribution: 'Placeholder',
    placeholder: true,
  },
];

export const channels: Channel[] = [
  { label: 'GitHub', href: 'https://github.com/tradergunny', placeholder: false },
  { label: 'X', href: 'https://x.com/GunnyTrader', placeholder: false },
  { label: 'YouTube', href: null, placeholder: true },
  { label: 'Résumé', href: null, placeholder: true },
];

export const hotspots: Hotspot[] = [
  {
    id: 'workstation',
    label: 'Trading',
    section: 'about',
    facet: 'trader',
    poster: { x: 27.5, y: 41.5 },
    position: [-1.05, 2.22, -2.27],
  },
  {
    id: 'laptop',
    label: 'Work',
    section: 'work',
    poster: { x: 44.5, y: 40.5 },
    position: [0.71, 1.72, -1.77],
  },
  {
    id: 'camera',
    label: 'Content',
    section: 'about',
    facet: 'creator',
    poster: { x: 78, y: 50.5 },
    position: [2.35, 1.48, 2.08],
  },
];

/** Where a hotspot sends the visitor: the facet if it has one, otherwise the section. */
export const hotspotHref = (hotspot: Hotspot) =>
  hotspot.facet ? `#facet-${hotspot.facet}` : `#${hotspot.section}`;

/** Drives the single footer note. True while anything on the page is still synthetic. */
export const hasPlaceholders = [...work, ...experience, ...testimonials, ...channels].some(
  entry => entry.placeholder,
);
