# 3D feasibility: the real GLB in the hero slot

Measured 2026-09-14 with `prototypes/hero.html` (since deleted; see git history at commit `5b1bb16`), which places the existing `Studio` renderer inside the Gallery hero slot (square, 7 of 12 columns, capped at 70svh) on a light ground with the poster underneath and three projected hotspots.

## What works

- The live scene loads into the slot and renders on a transparent canvas, so the room sits directly on the page ground with no box.
- Hotspots project correctly from the three object positions; clicking one tweens the camera to the object (existing `focus`), `reset` returns to the hero framing.
- Steady state on an Apple Silicon Mac at devicePixelRatio 2: 120 fps, 189 draw calls, about 437k triangles per frame (shadow pass included), 6 textures, 101 geometries.
- Warm load (browser cache): 0.18 to 0.37 s to a ready scene.

## What costs

Cold load, production build, measured with the Vite preview server (no compression on the GLB):

| Resource | Bytes on the wire | Fast 4G (10 Mbps) | Slow 4G (1.6 Mbps) |
| --- | --- | --- | --- |
| three chunk (gzip) | 162 KB | 0.3 s | 2.3 s |
| studio-poster.png | 2,472 KB | 2.3 s | 24 s |
| studio.glb | 4,568 KB | 3.8 s | 33 s |
| Scene ready | | 6.6 s | 38 s |

Headless software GL adds several seconds of parse and shader time to these; real hardware was under 0.4 s once bytes arrive.

## Cheap wins (measured)

- **Poster to WebP.** 1400 px WebP at q82 is 76 KB, 1000 px is 46 KB. The PNG is 2,472 KB. This alone removes 24 s on slow 4G.
- **Compress the GLB on the wire.** Brotli q11 brings 4,568 KB to 1,311 KB; gzip to 1,660 KB. The host must serve `.glb` compressed, or the file is pre-compressed at build time. Slow 4G drops from 33 s to about 8 s; fast 4G from 3.8 s to about 1.1 s.
- **meshopt high.** Re-encoding at meshopt level high gives 3,840 KB raw (16 percent smaller); worth doing but secondary to compression.
- Geometry simplification with gltf-transform did not reduce the mesh meaningfully (already quantized); a lighter mobile model would need a Blender re-export with decimation.

## Not measured

- Frame rate on a real phone. Only a physical device test settles this. Mitigations available in the renderer: DPR cap (already 1.75), disabling shadows and the PMREM environment on small screens, pausing when the hero scrolls out of view.
- Memory on iOS Safari with 437k triangles and 6 textures. Expected fine; unverified.

## Implications for the architecture

- Poster first, always. The WebP poster is the first paint on every device and the permanent fallback.
- The GLB and three chunk load after first paint, never blocking content. When the scene is ready it fades in over the poster.
- The existing interaction surface (moods, light slider, ambient audio, snapshot, drawer, chair, eleven panels) is not needed by the hero; the hero needs orbit within limits, three hotspots, focus and reset.
