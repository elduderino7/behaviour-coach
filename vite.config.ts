/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import ui from './content/ui.json' with { type: 'json' };

// Must match the GitHub repository name (GitHub Pages serves the app at /<repo>/).
const REPO_BASE = '/behaviour-coach/';

// Rule 2 in CLAUDE.md: block all network access in the production build.
// Not applied in dev mode, because it would break Vite's hot reload.
const CSP =
  "default-src 'self'; connect-src 'none'; img-src 'self' data: blob:; " +
  "style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'";

function productionCsp(): Plugin {
  return {
    name: 'production-csp',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CSP },
          injectTo: 'head-prepend',
        },
      ];
    },
  };
}

export default defineConfig(({ command, isPreview }) => ({
  base: command === 'build' || isPreview ? REPO_BASE : '/',
  // Preact JSX without extra plugins (keeps dependencies minimal).
  oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
    },
  },
  plugins: [
    productionCsp(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script',
      includeAssets: ['icons/apple-touch-icon.png', 'icons/favicon.svg'],
      manifest: {
        name: ui.app_name,
        short_name: ui.app_short_name,
        description: ui.app_description,
        lang: 'en',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fbf8f3',
        theme_color: '#2f6f62',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
