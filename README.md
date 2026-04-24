# TikTokShop Task Platform

Secure Next.js + TypeScript + MongoDB task-to-earn web app with JWT auth, user/admin dashboards, invitations, transactions, and support messaging.

## Setup

1. Copy `.env.example` to `.env.local` and fill values.
2. Install dependencies:
   - `npm install`
3. Start app:
   - `npm run dev`
4. Open setup page:
   - `http://localhost:3000/setup`
5. On `/setup` do:
   - Generate invite key
   - Bootstrap first admin
   - Seed starter tasks
6. Sign up first user using the admin invite key generated in setup.

## Included Features

- Black theme UI with palette `#49C2E3`, `#E34960`, `#49CCE3`
- Landing/home, login/signup, profile, user dashboard, admin dashboard
- Error/loading/not-found pages
- JWT session auth with role checks
- Invitation key chain and bonus logic (+$10 signup, +$10 inviter reward)
- 40-task / 24-hour limit and progress bar
- Deposit/withdraw/proof transaction flow and admin approval
- Support chat with 10 static auto-responses and SMTP email acknowledgment
- Admin notifications to users + SMTP alerts
- Receipt screenshot upload API that stores files under `public/uploads`
- Admin task creation/toggle API + seeded starter tasks
- DB-backed admin statistics chart (users, transaction count, total amount)
- Special-task completion gate requiring accepted proof transaction
- API hardening: basic rate limits, origin checks, validation helpers, audit logs

## Security Notes

- Passwords and withdrawal passwords are hashed with bcrypt
- JWT stored in secure httpOnly cookie
- Server-side role checks for admin actions
- Input sanitization and basic validation
