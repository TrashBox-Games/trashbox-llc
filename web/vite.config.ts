import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// For GitHub Pages:
// - Custom domains should use "/" (set VITE_BASE_PATH=/ in CI).
// - Project sites can use "/repo/" (derived from GITHUB_REPOSITORY by default).
const basePathOverride = process.env.VITE_BASE_PATH
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  base: basePathOverride ?? (repo ? `/${repo}/` : '/'),
  plugins: [react(), tailwindcss()],
})
