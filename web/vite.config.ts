import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// For GitHub Pages:
// - Custom domains should use "/" (set VITE_BASE_PATH=/ in CI).
// - Project sites can use "/repo/" (derived from GITHUB_REPOSITORY by default).
const basePathOverride = process.env.VITE_BASE_PATH
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
const resolvedBase = basePathOverride ?? (repo ? `/${repo}/` : '/')

/** Root-absolute href for `public/` files so favicons work on deep links (e.g. /apps/foo/privacy). */
function publicAssetHref(file: string, base: string): string {
  if (base === '/' || base === '') return `/${file}`
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}${file}`
}

export default defineConfig({
  base: resolvedBase,
  plugins: [
    {
      name: 'html-public-asset-hrefs',
      transformIndexHtml(html) {
        const files = [
          'favicon-32x32.png',
          'favicon-16x16.png',
          'favicon.ico',
          'apple-touch-icon.png',
          'site.webmanifest',
        ]
        let out = html
        for (const file of files) {
          out = out.replace(
            new RegExp(`href="\\.\\/${file.replace(/\./g, '\\.')}"`, 'g'),
            `href="${publicAssetHref(file, resolvedBase)}"`,
          )
        }
        return out
      },
    },
    react(),
    tailwindcss(),
  ],
})
