# Daily Ledger

A Next.js 16 app for tracking daily income and expenses, backed by Firebase.

## Stack

- **Next.js 16** (App Router, TypeScript)
- **Firebase** — Auth (email/password) + Firestore
- **shadcn/ui** components (Radix UI + Tailwind CSS v4)

## Setup

### 1. Firebase project

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Authentication → Email/Password** provider.
3. Create a **Firestore Database** (test mode for dev).
4. In Project Settings → Your apps → Add a Web app — copy the config.

### 2. Environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Firebase config values in `.env.local`.

### 3. Run

```bash
npm run dev
```

Open http://localhost:3000

## Firestore security rules (recommended for production)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## Original Next.js docs

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
