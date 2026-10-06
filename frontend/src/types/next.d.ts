// Ambient Next.js types (static image imports etc.) so `tsc` works on a fresh clone.
// next-env.d.ts carries the same references, but Next 16 regenerates it on every
// `next dev` / `next build` with imports of files under .next/, so it stays untracked.
/// <reference types="next" />
/// <reference types="next/image-types/global" />
