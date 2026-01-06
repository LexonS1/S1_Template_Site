# Next.js Boilerplate

A minimal boilerplate with Next.js 16, Clerk, Supabase, Mantine, and Sentry.

## Stack

- **Next.js 16** - React framework
- **Clerk** - Authentication
- **Supabase** - Database
- **Mantine** - UI components
- **Sentry** - Error tracking
- **Vitest** - Unit testing
- **Playwright** - E2E testing

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

## Build

**Note:** The build compiles successfully but fails at static generation because Clerk requires environment variables. You must have valid Clerk keys set up before running `npm run build`.

```bash
npm run build
```

## Testing

### Unit Tests (Vitest)

```bash
npm test              # Run once
npm run test:watch    # Watch mode
```

### E2E Tests (Playwright)

```bash
npm run test:e2e      # Run all browsers
npm run test:e2e:ui   # Interactive UI mode
```

To run a specific browser:

```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
```

**Note:** E2E tests bypass Clerk authentication in CI environments. See `src/middleware.ts` for details.

## CI/CD Setup

This project includes GitHub Actions for CI. To enable builds in CI, you need to add secrets to your GitHub repository:

1. Go to your repo on GitHub
2. Navigate to **Settings > Secrets and variables > Actions**
3. Add the following repository secrets:

| Secret Name | Description |
|-------------|-------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (optional) |

The CI pipeline runs:
- `npm ci` - Install dependencies
- `npx biome ci .` - Lint and format check
- `npx tsc --noEmit` - Type check
- `npm test` - Run unit tests
- `npm run test:e2e` - Run Playwright e2e tests
- `npm run build` - Build the app

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
├── lib/
│   └── supabase.ts         # Supabase client
└── middleware.ts           # Clerk auth middleware
tests/                      # Unit tests (Vitest)
e2e/                        # E2E tests (Playwright)
```

## Clerk + Supabase Integration

To use Supabase with Clerk authentication, configure a JWT template in Clerk:

1. Go to Clerk Dashboard > JWT Templates
2. Create a new Supabase template
3. Use `createSupabaseClient(token)` from `@/lib/supabase` with the Clerk token
