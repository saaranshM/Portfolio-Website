/**
 * Vendors detect-gpu's GPU benchmark database into public/fx-benchmarks/.
 *
 * detect-gpu's getGPUTier() fetches one or two of these JSON files at runtime
 * (picked by GPU vendor) and DEFAULTS to the unpkg.com CDN — a network
 * dependency the deployed site must not have. useEffectsTier points
 * `benchmarksURL` at /fx-benchmarks instead, so the data ships with the site
 * and tier detection works fully offline.
 *
 * Runs from `postinstall`, so the copy always matches the installed
 * detect-gpu version; public/fx-benchmarks/ is gitignored.
 */
import { cpSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'node_modules', 'detect-gpu', 'dist', 'benchmarks')
const dest = join(root, 'public', 'fx-benchmarks')

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })
cpSync(src, dest, { recursive: true })

console.log(`[fx-benchmarks] vendored detect-gpu benchmarks -> ${dest}`)
