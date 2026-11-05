# Chair model

## Asset

ChairLab GT is a **procedural low-poly chair** built from R3F primitives (`RoundedBox`, boxes, cylinders, spheres) in
`src/components/chair-scene/chair-model.tsx`. No GLB, no third-party asset, nothing to credit or license.

Why not a GLB yet: we found no CC0 gaming chair with separable material slots, and the spec says not to block on assets.
The procedural model downloads nothing, is about 40 draw calls, and every part is addressable by slot.

**Swapping in a GLB later:** export with Draco compression, name the materials after the slots below, load with drei
`useGLTF` (+ `useGLTF.preload`), and assign `chairMaterials(config)` values by material name. The store, pricing and
fallback stay unchanged.

Coordinates: metres, floor at `y = 0`, chair faces `+z`, orbit target `(0, 0.66, 0)`.

## Material slots

All values come from `chairMaterials(config)` (`src/components/chair-scene/materials.ts`), which both the 3D model and
the flat SVG fallback use.

| Slot | Parts | Driven by | Material |
| --- | --- | --- | --- |
| `frame` | backrest shell, seat shell, arm posts + brackets, caster hubs | `frame` color | standard, roughness 0.45, metalness 0.3 |
| `upholstery` | backrest pad, side bolsters, center insert, seat pad + wings, lumbar pillow | `color` (hex) + `material` finish | physical: fabric r0.95 / leather r0.5 cc0.25 / premium r0.32 cc0.7 |
| `stitch` | backrest insert seam, headrest seam, seat seam, lumbar seam | `stitching` hex; tonal = upholstery × 0.65 | standard, roughness 0.8 |
| `base` | hub + 5 legs | `base`: star = nylon `#34363e` matte; racing = aluminium `#c9ced4` metal 1 r0.25, wider legs | standard |
| `rgb` | 3 strips on the backrest's rear edges + rear point light | `rgb` on/off, `rgbColor` hex | emissive ×3, not tone-mapped |
| fixed | arm pads `#2a2c33`, casters/gas sleeve/mechanism `#16171c`, gas lift chrome, headrest slots `#0b0c10` | n/a | standard |

## Rendering

- Lazy chunk: `chair-canvas.tsx` is loaded with `next/dynamic({ ssr: false })` only when WebGL is available.
- Lighting: hemisphere + key + cool rim light; a drei `<Environment>` built from local `<Lightformer>`s (no HDR download)
  for reflections; `<ContactShadows frames={1}>` re-baked when the base changes.
- `frameloop` is `always` only while auto-spinning, otherwise `demand`.
- Reduced motion: no auto-spin, no damping, no canvas fade.
- Fallback: the flat SVG (`flat-chair.tsx`) shows while the chunk loads, and permanently when WebGL is missing, the
  scene throws, or the GPU context is lost.
