import './style.css';
import {
  channels,
  experience,
  facets,
  hasPlaceholders,
  hotspotHref,
  hotspots,
  sections,
  site,
  work,
  type Channel,
} from './content';

const app = document.querySelector<HTMLDivElement>('#app')!;

const escape = (value: string) =>
  value.replace(/[&<>"]/g, character => `&#${character.charCodeAt(0)};`);

/** A channel is a link once it has somewhere to go, and quiet text until then. */
const channelMarkup = (channel: Channel) =>
  channel.href
    ? `<a href="${escape(channel.href)}" rel="me noreferrer" target="_blank">${escape(channel.label)}</a>`
    : `<span class="channel-pending">${escape(channel.label)}</span>`;

const TICKS = 22;

app.innerHTML = `
  <main>
    <section class="hero" id="top" aria-labelledby="name">
      <header class="masthead">
        <a class="monogram" href="#top" aria-label="${escape(site.wordmark)}, back to top">${site.monogram
          .map(line => `<span>${escape(line)}</span>`)
          .join('')}</a>
        <div class="ticks" aria-hidden="true">${'<i></i>'.repeat(TICKS)}</div>
        <nav class="nav caps" aria-label="Sections">${sections
          .map(
            section =>
              `<a href="#${section.id}" data-section="${section.id}"${
                section.id === 'contact' ? ' class="nav-primary"' : ''
              }>${escape(section.label)}</a>`,
          )
          .join('')}</nav>
      </header>

      <div class="hero-main">
        <div class="name-column">
          <p class="caps location">${escape(site.location)}</p>
          <h1 class="name" id="name">${escape(site.wordmark)}</h1>
          <ul class="roles caps">${site.roles.map(role => `<li>${escape(role)}</li>`).join('')}</ul>
          <p class="lede">${escape(site.lede)}</p>
          <a class="cta caps" href="mailto:${escape(site.email)}"><i class="dot" aria-hidden="true"></i>${escape(
            site.contactLabel,
          )}</a>
        </div>

        <div class="stage-column">
          <div class="stage">
            <img
              class="poster"
              src="studio-poster.webp"
              srcset="studio-poster-700.webp 700w, studio-poster.webp 1400w"
              sizes="(max-width: 820px) 100vw, 58vw"
              width="1400"
              height="1400"
              alt="${escape(site.poster.alt)}"
            />
            ${hotspots
              .map(
                hotspot =>
                  `<a class="hotspot" href="${hotspotHref(hotspot)}" style="left:${hotspot.poster.x}%;top:${
                    hotspot.poster.y
                  }%"><span class="hotspot-label caps">${escape(hotspot.label)}</span></a>`,
              )
              .join('')}
          </div>
          <p class="stage-caption caps">
            <span>${escape(site.poster.caption)}</span>
            <span>${escape(site.poster.state)}</span>
          </p>
        </div>
      </div>

      <div class="hero-footer caps">
        <ul>
          <li>${escape(site.person)}</li>
          <li>${escape(site.roles[0])}</li>
          <li>${escape(site.location)}</li>
        </ul>
        <ul class="hero-channels">${channels.map(channel => `<li>${channelMarkup(channel)}</li>`).join('')}</ul>
      </div>
    </section>

    <section class="section" id="work" aria-labelledby="work-label">
      <h2 class="caps section-label" id="work-label">Work</h2>
      <div class="section-body">
        <ol class="rows">${work
          .map(entry => {
            const title = entry.href
              ? `<a href="${escape(entry.href)}" rel="noreferrer" target="_blank">${escape(entry.title)}</a>`
              : escape(entry.title);
            return `<li class="row row-work">
              <span class="row-title">${title}</span>
              <span class="row-summary">${escape(entry.summary)}</span>
              <span class="row-meta caps">${escape(entry.year)}</span>
            </li>`;
          })
          .join('')}</ol>
      </div>
    </section>

    <section class="section" id="experience" aria-labelledby="experience-label">
      <h2 class="caps section-label" id="experience-label">Experience</h2>
      <div class="section-body">
        <ol class="rows">${experience
          .map(
            entry => `<li class="row row-experience">
              <span class="row-meta caps">${escape(entry.period)}</span>
              <span class="row-title">${escape(entry.role)}<small>${escape(entry.place)}</small></span>
              <span class="row-summary">${escape(entry.summary)}</span>
            </li>`,
          )
          .join('')}</ol>
      </div>
    </section>

    <section class="section" id="about" aria-labelledby="about-label">
      <h2 class="caps section-label" id="about-label">About</h2>
      <div class="section-body">
        <div class="facets">${facets
          .map(
            facet => `<article class="facet" id="facet-${facet.id}">
              <h3 class="caps facet-label">${escape(facet.label)}</h3>
              <div class="facet-body">
                <p>${escape(facet.body)}</p>
                ${
                  facet.link.href
                    ? `<a class="facet-link caps" href="${escape(facet.link.href)}"${
                        facet.link.href.startsWith('#') ? '' : ' rel="noreferrer" target="_blank"'
                      }>${escape(facet.link.label)}</a>`
                    : `<span class="facet-link caps channel-pending">${escape(facet.link.label)}</span>`
                }
              </div>
            </article>`,
          )
          .join('')}</div>
      </div>
    </section>

    <section class="section" id="contact" aria-labelledby="contact-label">
      <h2 class="caps section-label" id="contact-label">Contact</h2>
      <div class="section-body">
        <a class="email" href="mailto:${escape(site.email)}">${escape(site.email)}</a>
        <p class="thai" lang="th">${escape(site.thaiLine)}</p>
        <ul class="contact-channels caps">${channels
          .map(channel => `<li>${channelMarkup(channel)}</li>`)
          .join('')}</ul>
      </div>
    </section>
  </main>

  <footer class="colophon caps">
    ${hasPlaceholders ? `<p class="placeholder-note">${escape(site.placeholderNote)}</p>` : ''}
    <p class="colophon-mark">${escape(site.wordmark)} — ${escape(site.location)}</p>
  </footer>
`;

/** Underline the nav item for whatever section is crossing the middle of the viewport. */
const navLinks = [...app.querySelectorAll<HTMLAnchorElement>('.nav a[data-section]')];
const observed = [...app.querySelectorAll<HTMLElement>('main section[id]')];
let current = '';

const setCurrent = (id: string) => {
  if (id === current) return;
  current = id;
  for (const link of navLinks) {
    if (link.dataset.section === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
};

const spy = new IntersectionObserver(
  entries => {
    for (const entry of entries) if (entry.isIntersecting) setCurrent(entry.target.id);
  },
  { rootMargin: '-45% 0px -50% 0px' },
);
for (const section of observed) spy.observe(section);

/** Fill the tick strip to match how far down the page the visitor is. */
const ticks = [...app.querySelectorAll<HTMLElement>('.ticks i')];
let queued = false;

const paintTicks = () => {
  queued = false;
  const travel = document.documentElement.scrollHeight - innerHeight;
  const progress = travel > 0 ? Math.min(1, Math.max(0, scrollY / travel)) : 0;
  const lit = Math.round(progress * ticks.length);
  ticks.forEach((tick, index) => tick.classList.toggle('on', index < lit));
};

addEventListener(
  'scroll',
  () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(paintTicks);
  },
  { passive: true },
);
addEventListener('resize', paintTicks, { passive: true });
paintTicks();
