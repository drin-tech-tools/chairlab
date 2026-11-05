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

## Camera presets

Defined in `src/components/chair-scene/camera-presets.ts`. Unit tests keep each one inside `CONTROL_LIMITS`.

| Preset | Position | Target | Use |
| --- | --- | --- | --- |
| Hero | (1.8, 1.3, 2.5) | (0, 0.66, 0) | default 3/4 view |
| Side | (3, 1.05, 0) | (0, 0.62, 0) | profile, RGB strip |
| Detail | (0.75, 1.2, 1.55) | (0, 0.92, -0.2) | backrest stitching, lumbar |
| Base | (1.1, 0.5, 1.3) | (0, 0.15, 0) | base and casters |

## Hotspots

World-space anchors in `hotspots-data.ts` (backrest points are pre-transformed by the backrest's
`position (0, 0.5, -0.24)` and `rotation.x -0.14`). Moving model parts means updating these.

| Option | Position | Preset |
| --- | --- | --- |
| frame | (0.33, 0.7, 0.12), right arm pad | Hero |
| color | (-0.12, 0.56, 0.14), seat | Hero |
| stitching | (0.1, 1, -0.22), backrest insert | Detail |
| lumbar | (0, 0.72, -0.1), lumbar pillow | Detail |
| rgb | (0.29, 1.33, -0.43), rear top edge | Side |
| base | (0, 0.1, 0.26), front leg | Base |

## RGB glow

Three emissive strips (`toneMapped: false`) plus one additive, depth-write-off halo plane each, textured with a
generated 64x64 soft falloff and tinted with the RGB color, plus a rear point light. Under no reduced motion the
emissive intensity and halo opacity breathe (2.2 s period). This avoids a bloom post-processing pass.
