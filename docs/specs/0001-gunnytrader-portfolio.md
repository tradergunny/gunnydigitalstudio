## Problem Statement

Sila, publicly known as GunnyTrader, needs a personal site that gets a prospective client or collaborator to start a conversation, and lets a recruiter read experience quickly. Today the repo is an interactive 3D room with Thai UI, eleven object control panels, and no portfolio content at all: no work, no experience, no contact, and nothing readable if WebGL is slow or missing. The Blender studio Sila built is the one thing no other portfolio can copy, but right now it is the whole site instead of a part of it.

## Solution

A one-page portfolio in the Gallery direction: premium, minimal, text-light. A full-viewport Hero with the stacked Monogram top-left, tracked-caps navigation top-right, the name column on the left (location, GUNNYTRADER, three roles, one sentence, the Start a conversation link), and the Studio filling the right half. Below it, four quiet Sections: Work, Experience, About with three Facets (Developer, Trader, Creator), and Contact with the email set large. English primary, Thai where it earns trust.

The Studio is a hero stage, never navigation. The Poster (a WebP still) paints first on every device and stays as the fallback; the Live scene loads after first paint, fades in over the Poster, and is held back on constrained connections. Three Hotspots (chart monitor to the Trader facet, laptop to Work, camera to the Creator facet) move the camera to the object and then scroll the page to the Section. Everything else the old room did (moods, light slider, ambient audio, snapshot, drawer, chair, object panels, saved state, help dialog) is removed.

## User Stories

1. As a prospective client, I want to understand within a few seconds who Sila is and what Sila does, so that I can decide whether to keep reading.
2. As a prospective client, I want a Start a conversation link above the fold on every device, so that I can act without hunting.
3. As a prospective client, I want the contact link to open my mail app with Sila's address, so that I do not have to fill in a form.
4. As a prospective client who reads Thai, I want to see a Thai line in Contact and Thai testimonials in the original, so that I trust Sila works with Thai businesses.
5. As a prospective client, I want to see selected work as short rows with a name, one line and a year, so that I can judge relevance without opening case studies.
6. As a prospective client, I want to open a work entry, so that I can see more when there is more to see.
7. As a recruiter, I want an Experience section as dated rows, so that I can scan it in under a minute.
8. As a recruiter on a phone, I want the whole page to read top to bottom with nothing hidden behind the 3D scene, so that I can evaluate Sila on the train.
9. As a recruiter, I want links to GitHub, X, YouTube and a résumé, so that I can verify and follow up.
10. As a visitor, I want the four navigation links (Work, Experience, About, Contact) to scroll me to the matching Section, so that I can jump around the page.
11. As a visitor, I want the active navigation item underlined as I scroll, so that I know where I am.
12. As a visitor, I want the tick strip at the top centre to reflect my scroll progress, so that the page feels precise rather than decorated.
13. As a visitor, I want to see the Poster of the studio immediately, so that the Hero is complete before any model downloads.
14. As a visitor, I want the Live scene to fade in over the Poster without the room jumping, so that the upgrade feels seamless.
15. As a visitor, I want to drag the Live scene to look around within limits, so that I can explore the room without losing the framing.
16. As a visitor, I want a caption under the Studio telling me it is live 3D and that I can drag, so that I know it is interactive.
17. As a visitor, I want three Hotspots on the room (chart monitor, laptop, camera) with labels on hover or focus, so that I can see what each object leads to.
18. As a visitor, I want clicking a Hotspot to move the camera to that object and then scroll me to the matching Section, so that the room introduces the content.
19. As a visitor, I want the Hotspots to work on the Poster before the Live scene loads, so that the room is useful from the first paint.
20. As a visitor, I want a way to reset the camera to the opening view, so that I can recover after exploring.
21. As a visitor with WebGL blocked or an old device, I want the page to stay on the Poster with no error and no broken layout, so that I never see a failed 3D box.
22. As a visitor whose model download fails, I want the page to keep the Poster silently, so that a network error never becomes my problem.
23. As a visitor on a metered or slow connection (save-data, 2G, 3G), I want the page to keep the Poster and offer a Load the 3D studio action, so that I control the download.
24. As a visitor on a phone, I want the Live scene to render without shadows and at a capped pixel ratio, so that it stays smooth and does not drain my battery.
25. As a visitor, I want the Live scene to pause when the Hero scrolls out of view, so that the rest of the page is not competing with a render loop.
26. As a visitor who prefers reduced motion, I want camera moves and fades to be instant, so that the page respects my setting.
27. As a keyboard user, I want Hotspots, navigation and links to be reachable in order with a visible focus ring, so that I can use the site without a mouse.
28. As a screen reader user, I want the Poster and canvas to carry a description of the room and the Hotspots to be named links, so that the Studio is not a silent image.
29. As a visitor, I want the About section to present Developer, Trader and Creator as three short Facets, so that I understand the whole person without a long biography.
30. As a follower of the trading channel, I want the Trader facet to link to X, so that I can follow.
31. As a follower of the content channel, I want the Creator facet to link to YouTube, so that I can subscribe.
32. As a visitor, I want the Trader facet to say plainly that trading is discretionary and not advice, so that there is no ambiguity.
33. As Sila, I want every placeholder entry replaced in one content file, so that I can ship real projects without touching layout code.
34. As Sila, I want a single Sample entries shown note in the footer while placeholders remain, so that I am reminded and visitors are not misled.
35. As Sila, I want the site to deploy as static output on Vercel, so that hosting is free and simple.
36. As Sila, I want the model served compressed on the wire, so that a phone on 4G gets the Live scene in about a second rather than four.
37. As Sila, I want the page to pass a real-device check on an Android phone and an iPhone before launch, so that the Live scene never embarrasses the site.
38. As Sila, I want the page title, description and social preview image to describe the portfolio in English, so that shared links look right.
39. As a visitor, I want the site to work in the browser's dark and light preference, so that it never renders unreadable.
40. As a visitor, I want text selection, focus rings and the caret to match the palette, so that the page feels built rather than assembled.

## Implementation Decisions

- **One page, existing stack.** Vite, TypeScript and Three.js with no framework. The current interactive-room entry is replaced by the portfolio page; the renderer module is kept and trimmed.
- **Structure follows the direction contract.** Hero (header row: Monogram, tick strip, nav; middle row: name column and Studio; footer row: roles and links), then Work, Experience, About, Contact, page footer. Section order and names are fixed vocabulary from the glossary.
- **Visual system.** Ground #f6f5f2, ink #141311, muted #6f6b66, hairline #e2dfda, coral #ce4257 used only as the dot before the contact link, the Hotspot rings, and hover. Archivo (condensed axis, weight 800) for the Monogram, the name and the email; Geist for everything else; 11px tracked caps for labels and navigation; hairline rows; no cards, shadows or radii. Both fonts from Google Fonts with system fallbacks. Thai text uses a Thai-capable face.
- **Content lives in one typed content module** with entries for work, experience, facets, testimonials, channel links and the three Hotspots (id, label, target Section, object position). Placeholder entries are marked with a flag that drives the footer note; no per-entry provenance captions.
- **Language.** Page language is English. Thai appears in the Contact line and testimonials, marked with the correct language attribute.
- **Studio states.** The Studio component owns a small state machine: poster → (held | loading) → live | failed. Poster is the initial render on every device. Loading starts after first paint when the Hero is in view and the connection is not constrained. Held is entered when save-data is on or the effective connection type is 2G or 3G, and exposes a Load the 3D studio action that moves to loading. Failed is entered on WebGL absence, context loss or a load error, and looks identical to poster. Live fades the canvas in over the Poster. From the prototype, the shape the tests read:

  ```
  type StudioState = 'poster' | 'held' | 'loading' | 'live' | 'failed'
  window.__gunny = { state(): StudioState, target(): ObjectId | null, stats(): { drawCalls, triangles } }
  ```

- **Poster and framing.** The Poster is re-rendered as WebP (about 1400 px, with a smaller phone variant) from the same camera the Live scene opens on, so the fade-in does not jump. The PNG is removed from the shipped bundle.
- **Hotspots.** Three, defined in content. On the Poster they sit at fixed percentage positions; once live they re-anchor every frame to the projected object positions using the renderer's existing projection. Activation calls the renderer's focus for the object, waits for the tween, then scrolls to the Section. With reduced motion, focus and scroll are immediate.
- **Renderer trimmed.** Keep: orthographic camera, orbit within the existing azimuth and polar limits, focus, reset, hover cursor, projection, context-loss handling, dispose. Remove: moods, light slider, ambient audio, snapshot, drawer, chair pivot, fan blades, per-object material toggles, the state store, localStorage, panels, markers system, help dialog and all Thai UI strings. Lighting is fixed to the daylight setup.
- **Phone budget.** On coarse pointer or viewport under 820px: shadow map off, environment map off, pixel ratio capped at 1.5. On every device the render loop pauses when the Hero is not intersecting the viewport and when the tab is hidden.
- **Lazy loading.** The Three.js chunk and the model are not part of the initial script; they are imported when loading begins. The model is fetched with a progress callback; the caption shows loading progress as text.
- **Compression.** The build emits a brotli and a gzip variant of the model beside the original. Vercel headers config serves the compressed variant with the correct Content-Encoding and Content-Type for the model path. The model is also re-encoded with meshopt at level high.
- **Navigation and scroll.** Anchor links to Section ids with smooth scroll unless reduced motion; the active nav item is set from an intersection observer; the tick strip is driven by scroll progress; both are read-only decorations with no interaction.
- **Contact.** A mailto link with the address as the visible text. Social links in the Hero footer and Contact are the same list from content.
- **Metadata.** English title, description, Open Graph image derived from the Poster, favicon kept, theme colour set to the ground.
- **Themes.** Light is the design. A dark preference gets a legible dark variant of the same tokens, not a second design.
- **Deployment.** Static output to Vercel from the main branch; preview deployments on pull requests.

## Testing Decisions

- **What a good test is here:** it drives the built site in a real browser and asserts what a visitor sees or can do. It never reaches into the renderer's internals beyond the read-only diagnostics object, and it never asserts on pixel colours of the 3D canvas.
- **One seam:** Playwright end-to-end against the production build served by Vite preview, at a desktop viewport (1440 wide) and a phone viewport (390 wide, touch, device pixel ratio 2). Playwright is already a devDependency; a Playwright config and a test script are added.
- **Test handle:** the read-only diagnostics object on window described above, replacing the current `__studio` object.
- **Covered through the seam:**
  - The Poster is visible and content and the mail link work with the model request blocked, and with WebGL disabled; the diagnostics report failed or poster and no error is shown.
  - With a normal connection the state reaches live within a timeout and the canvas becomes visible.
  - With the connection API overridden to save-data or 3G, the state stays held, the Load the 3D studio action appears, and activating it leads to live.
  - Clicking each Hotspot changes the reported camera target to that object and scrolls the matching Section into view; Hotspots are focusable and named.
  - Navigation links scroll to their Sections and the active item updates.
  - On the phone viewport the Hero stacks name column then Studio, the header shows the Monogram, and the contact link is above the fold.
  - On the phone viewport the diagnostics report shadows off and pixel ratio at most 1.5.
  - The page has no console errors on load in either viewport.
  - Reduced motion: Hotspot activation scrolls without a delay.
- **Prior art:** none in the repo. The current app's `__studio` diagnostics object and the feasibility prototype's `__hero` object are the pattern for the test handle.
- **Manual gate, not automated:** frame rate on a real Android phone and iPhone before launch.

## Out of Scope

- Real project content, testimonials, résumé file and channel links; all remain labelled placeholders in the content module.
- A contact form, analytics, a blog, a CMS, or a Thai language toggle.
- Case-study pages for work entries; work rows link to external URLs or nowhere.
- A lighter mobile model (Blender re-export); revisit only if the real-device check fails.
- Any of the removed room interactions (moods, audio, snapshot, drawer, chair, object panels).
- A dark design; only a legible dark fallback of the light tokens.

## Further Notes

- Decisions and their reasoning: `docs/decisions.md`, ADR 0001 (studio as hero stage), ADR 0002 (poster first, progressive live scene), `docs/3d-feasibility.md` (measurements), `CONTEXT.md` (glossary), `PRODUCT.md`.
- Visual reference: the light variant of https://claude.ai/code/artifact/df31bb99-ef7e-4b43-86e3-adb426257711 and the feasibility prototype in `prototypes/hero.html`, which already places the renderer in the slot with projected Hotspots and camera focus. The prototype and its launch configs can be deleted once the real Hero exists.
- The wall in the model reads GunnyTrader; the brand decision matches it.
