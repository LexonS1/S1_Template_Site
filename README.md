# Next.js Boilerplate

A minimal boilerplate with Next.js 16, Clerk, Supabase, Mantine, and Sentry.

## Stack

- **Next.js 16** - React framework
- **Clerk** - Authentication
- **Supabase** - Database
- **Mantine** - UI components
- **Sentry** - Error tracking

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

3. Configure your services:

   - **Clerk**: Get keys from [clerk.com/dashboard](https://clerk.com/dashboard)
   - **Supabase**: Get keys from [supabase.com/dashboard](https://supabase.com/dashboard)
   - **Sentry**: Get DSN from [sentry.io](https://sentry.io)

4. Run the development server:

```bash
npm run dev
```

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers
│   ├── page.tsx            # Landing page
│   ├── dashboard/          # Protected dashboard
│   ├── sign-in/            # Clerk sign-in
│   └── sign-up/            # Clerk sign-up
├── components/
│   └── providers.tsx       # Mantine + Clerk providers
└── lib/
    └── supabase.ts         # Supabase client
```

## Clerk + Supabase Integration

To use Supabase with Clerk authentication, configure a JWT template in Clerk:

1. Go to Clerk Dashboard > JWT Templates
2. Create a new Supabase template
3. Use `createSupabaseClient(token)` from `@/lib/supabase` with the Clerk token
