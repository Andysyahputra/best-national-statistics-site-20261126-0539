// Nusantara Numbers — hand-in program (Node 22, standard library only).
//
// The site is plain static files in app/ (HTML, one stylesheet, small ES
// modules, data files and two hand-drawn SVGs; no build step, no network).
// This program copies app/ and screenshots/ beside this file into the output
// directory and writes dossier.json there, using buildDossier from the kit's
// vendored library. vendor/makefun-frontend.ts is the kit's copy, unchanged:
// the scorer rebuilds the dossier with its own copy and compares byte for byte.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
//
// The output is deterministic: nothing written here depends on the clock, on
// random values, or on the order the filesystem happens to list entries, so
// two runs produce byte-identical files.

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const appDir = join(repoRoot, "app");
const shotsDir = join(repoRoot, "screenshots");

// Start from a clean output directory so stale files from an earlier run can
// never leak into the hand-in.
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

cpSync(appDir, join(outputDir, "app"), { recursive: true });

const outShots = join(outputDir, "screenshots");
mkdirSync(outShots, { recursive: true });
if (existsSync(shotsDir)) {
  cpSync(shotsDir, outShots, { recursive: true });
}

// The gate's caps, from the kit's RULES.txt: the dossier text cap is the only
// one that shapes bytes; the others refuse an entry the scorer would refuse
// (more than 4 screenshots or one over 256 KiB; more than 993 files and
// directories in app/ or 16 MiB of app files).
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(outputDir, "dossier.json"), dossier);
