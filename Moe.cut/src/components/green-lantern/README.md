# Green Lantern experience

Place your narration at **`src/assets/green-lantern-oath.mp3`**. This is the preferred
filename. The existing `src/assets/green lantern.mp3` is supported as a fallback.
No audio asset is generated or downloaded. The Vite asset glob only includes files
present at build time, so adding or replacing audio requires a rebuild for production.
Both files may be absent; the visual experience continues silently.

Audio is prepared during the availability dot's click, then starts once at the
GSAP first-oath-line cue (2.1 seconds into a normal activation; immediately with
reduced motion). Closing, scrolling into the floating state, reactivating, and
unmounting all stop and rewind playback. Browser playback rejections are caught;
visitors whose browsers deny playback still get the complete visual experience.

The experience owns one `PowerRing` canvas outside the fullscreen energy layer.
Wheel, vertical touch gesture, scroll, and keyboard scrolling collapse the energy
and animate that same canvas wrapper using translation and scale. The website is
unlocked as flight begins. The floating artifact ignores pointer events so links
and controls underneath stay usable. Reclicking the availability dot reuses the
canvas for a new activation. Escape, outside click, and the icon close control
fully dismiss the experience. Resizing while flying smoothly retargets the artifact
to the new corner. Reduced motion skips the flight and uses a short fade.

Ring rotation uses a separate Three.js quaternion around the artifact's local
axis. Flight adds a full turn with decelerating easing; translation and scale
remain on the existing wrapper. Docking freezes the portal presentation and
steady emerald illumination. Real page scroll displacement then drives a
critically damped angular target, reversing with scroll direction. Rendering
sleeps once that target settles, and wakes only for scroll, resize, activation,
or visibility changes. Reduced motion disables axial travel and scroll rotation.

The ring is the user-supplied `src/assets/3D ring/green_lantern_ring.glb`.
`ringModel.js` loads it with the installed Three.js GLTFLoader. No procedural
ring or old ring-shaped fallback is retained. The GLB contains two meshes
(17,856 triangles), two original PBR materials, seven embedded 1024px PNGs,
and no animation clips. Exported raw bounds are approximately 0.3987 × 0.1914 ×
0.4235 units. Its Sketchfab/FBX transform wrappers are normalized to a 2.75-unit
height and a bounds-centered origin, with the luminous face oriented upward
for the existing presentation pose. Mesh geometry, UVs, normals, and texture
maps are unchanged. The authored emissive intensity is retained, with only the
existing subtle activation breathing applied as a multiplier.

`alignRingFocus` compensates for the rotated luminous face anchor in all three
axes so it projects onto the exact center of the canvas and portal circle.
The one loaded scene stays mounted through flight and docking. Loading is
abortable; a late decode is disposed after cancellation, and failed loading
or a lost WebGL context presents a retry control rather than an old ring.
Shared textures and their ImageBitmaps are released along with materials,
geometry, environment maps, shadows, and renderer resources on unmount.

The GLB metadata credits **BatCat** under **CC BY 4.0**. Full attribution and
runtime modifications ship in `public/third-party-notices.txt` and are linked
from the project notice. All model and texture requests remain local.
