# Marcadele UI Preview

A standalone, UI-only Next.js app for the Marcadele investor concept. It has no Supabase or Stripe dependencies, no API routes, and no real checkout. Products, options, images, and prices are illustrative. The preview bag and saved list are local to the browser; newsletter input is not sent or saved.

## Run locally

Requirements: Node.js 22 or newer.

```bash
npm ci
npm run dev
```

Open `http://localhost:3000`. For a production build:

```bash
npm run build
npm start
```

No `.env.local` file or service credentials are needed for this UI preview.
