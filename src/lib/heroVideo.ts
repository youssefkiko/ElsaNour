import "server-only";
import fs from "node:fs";
import path from "node:path";

/**
 * Which video to show in the hero, if any.
 * - public/hero/hero.mp4 (+ hero.jpg poster): the store's own video, published with the site.
 * - public/hero/_local-test.mp4: a local preview only. It is git-ignored, so it never reaches
 *   GitHub or Vercel (used to preview third-party footage the store has no rights to publish).
 * Without a video, the hero shows the logo woman.
 */
export function getHeroVideo(): { src: string; poster?: string; wideSrc?: string; widePoster?: string } | null {
  const dir = path.join(process.cwd(), "public", "hero");
  for (const name of ["hero", "_local-test"]) {
    if (fs.existsSync(path.join(dir, `${name}.mp4`))) {
      const hasPoster = fs.existsSync(path.join(dir, `${name}.jpg`));
      // Optional landscape version for wide screens (computers): <name>-wide.mp4.
      const hasWide = fs.existsSync(path.join(dir, `${name}-wide.mp4`));
      return {
        src: `/hero/${name}.mp4`,
        poster: hasPoster ? `/hero/${name}.jpg` : undefined,
        wideSrc: hasWide ? `/hero/${name}-wide.mp4` : undefined,
        widePoster:
          hasWide && fs.existsSync(path.join(dir, `${name}-wide.jpg`)) ? `/hero/${name}-wide.jpg` : undefined,
      };
    }
  }
  return null;
}
