# ADR 0002: Poster first, live studio as a progressive enhancement on every device

**Status:** Accepted, 2026-09-14

## Context

The studio model is 4.5 MB uncompressed (1.3 MB brotli) and the current poster is a 2.4 MB PNG. Measured cold loads on slow 4G reach 38 seconds before the scene is ready (`docs/3d-feasibility.md`). Runtime cost on a desktop GPU is small (189 draw calls, 120 fps). Frame rate on a real phone is unmeasured. Most visitors are expected to arrive on phones.

## Decision

1. **The poster is the first paint on every device** and the permanent fallback. It ships as a WebP of about 76 KB at 1400 px (a smaller variant for phones), with alt text describing the room. Content, navigation and the contact link never wait for the scene.
2. **The live scene loads after first paint** on every device: the three chunk and the GLB are fetched lazily once the hero is visible, and the scene fades in over the poster when ready. The hotspots work on the poster before the scene loads and re-anchor to projected positions once it is live.
3. **Held back on constrained connections.** If the browser reports save-data, or an effective connection type of 2G or 3G, the page stays on the poster and offers a "Load the 3D studio" action instead.
4. **Phones render lighter.** On small screens or coarse pointers: no shadow map, no environment map, pixel ratio capped at 1.5, and the render loop pauses when the hero leaves the viewport.
5. **The model is served compressed.** Brotli or gzip on the wire for `.glb` is a hosting requirement; if the host cannot, the build pre-compresses and the loader fetches the compressed variant.
6. **The hero keeps four interactions only:** orbit within the existing angle limits, three hotspots, focus on an object, reset. Moods, the light slider, ambient audio, snapshot, the drawer, chair rotation, the eleven object panels, localStorage state and the help dialog are removed from the product.

## Consequences

- A visitor on a slow connection sees a finished page in about 3 seconds instead of 38, and the room appears when it can.
- A real-device frame-rate check on at least one mid-range Android phone and one iPhone is a launch gate, not optional.
- The existing renderer is reused, trimmed. Removing the state store and panels simplifies the codebase substantially.
- The poster and the live scene must match framing so the fade-in does not jump; the poster is re-rendered from the same camera the scene opens on, or the scene opens on the poster's angle.

## Alternatives rejected

- **Desktop only, poster on phones.** No mobile risk, but most visitors never see the studio.
- **Lighter mobile model.** Needs a decimated Blender re-export and a second asset; gltf-transform simplification gave no meaningful reduction. Can be revisited if the device check fails.
