# The Lantern Path — narrated art experience

A five-scene, image-led story with server-generated narration. The artwork is
served as static images and narration is requested only when a scene begins.

## Run locally

```bash
npm install
npm run dev
```

When running only Vite locally, `/api/tts` is not present, so the experience
uses the browser's built-in speech as a development fallback. Deploying to
Vercel enables the server endpoint and streams a consistent MP3 voice.

## Deploy to Vercel

Import this repository into Vercel and use its detected Vite settings:

- Build command: `npm run build`
- Output directory: `dist`

Vercel automatically deploys `api/tts.js` as `/api/tts`. It proxies the
no-key Google Translate TTS endpoint, validates narration, and caches audio at
the CDN for one day. No API key or paid service is needed for this short-form
assignment experience.

## Customise the story

Edit `src/data/defaultStory.ts` to change the title, text, durations, and image
paths. Place new stills in `public/scenes/` and reference them with `/scenes/...`.

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
