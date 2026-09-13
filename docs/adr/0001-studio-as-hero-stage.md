# ADR 0001: The 3D studio is a hero stage, not the site's navigation

**Status:** Accepted, 2026-09-14

## Context

The repo started as a full-viewport "interactive room" app: the Blender studio fills the screen, eleven objects open control panels, and there is no portfolio content outside the 3D scene. The portfolio's primary visitor is a prospective client or collaborator for full-stack work, with recruiters as the secondary path (see `docs/decisions.md`). Both need to reach work, experience and contact quickly, on any device, including when WebGL is slow or unavailable.

Three roles for the room were prototyped with the studio render and compared on desktop and mobile:

- **Hero stage.** Room in the hero beside the headline and CTA; a normal scrolling page below.
- **Pinned stage.** Room pinned beside scrolling content, camera follows the sections.
- **Room hub.** Full-viewport room as the navigation, sections open in overlay panels (the repo's current model).

## Decision

The studio is a **hero stage**. It sits in the hero next to the headline and the primary CTA. Three hotspots on the room (chart monitor, laptop, camera) link into the Trading facet, Work and the Content facet. Clicking a hotspot first moves the camera to that object, then scrolls the page to the section. Below the hero the site is a conventional scrolling page with a four-item nav plus CTA.

## Consequences

- Content, navigation and the contact action never depend on the 3D scene. If the model is loading or fails, the hero shows the studio render in the same slot and everything else works.
- The room appears only above the fold. It is a first impression and a proof of craft, not the spine of the page.
- The camera focus tween already in the renderer is reused; scroll-linked choreography from the pinned concept is not built.
- Most of the current object controls (moods, light slider, ambient audio, snapshot, drawer, chair) are candidates for removal; the room needs a few meaningful targets, not eleven.

## Alternatives rejected

- **Room hub.** Most immersive, but it hides content behind WebGL, cannot be scanned by a recruiter, and a failed load hides the whole site. Contradicts the audience decision.
- **Pinned stage.** Strongest storytelling, but it gives half the desktop to 3D for the entire visit, degrades to a sticky strip on mobile, and costs the most engineering. Only worth it if the room should be remembered more than the work.
