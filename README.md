# SafarPro admin panel + website — setup

## 1. Extract and copy

Extract this zip. It contains only these folders: `app`, `components`, `lib`, `prisma`.
Copy them into your project root (where your `package.json` is), and **replace**
any files with the same name/path when asked.

Do NOT touch: `app/layout.tsx` (root layout), `next.config.*`, `tsconfig.json`,
`.env`, `.gitignore`, `package.json` — this bundle does not include or change them.

If your project previously had any of these, DELETE them first (old design, now replaced):
- app/admin/bookings/
- app/admin/services/
- app/(site)/packages/
- lib/packages.ts
- components/site/PackageCard.tsx
- any old prisma models for Booking/Traveler/UmrahPackage/FlightPackage/VisaPackage

## 2. tsconfig.json check

Make sure this exists in `tsconfig.json` under `compilerOptions`:
```json
"paths": { "@/*": ["./*"] }
```

## 3. .env check

Your `.env` must have:
```
DATABASE_URL=postgresql://...?sslmode=verify-full
SESSION_SECRET=<a long random string>
```
Generate the secret with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 4. .gitignore

Add this line if it is not already there:
```
/generated
```

## 5. Terminal commands (run in order)

```bash
npm i lucide-react bcryptjs @prisma/adapter-pg pg dotenv
npx prisma db push
npx prisma generate
npm run dev
```

If `db push` warns about data loss on old tables, and that data is only test data, accept it
(or run `npx prisma db push --accept-data-loss`).

## 6. First run

1. Open `http://localhost:3000/login` — no admin exists yet, so it shows
   "Create the first super admin". Fill it in; you're logged in and redirected to `/admin`.
2. Open `http://localhost:3000/request?type=umrah` in another tab and submit a test request.
3. Back in `/admin/umrah`, the request appears. Save a quotation (price), then Confirm,
   then set the payment status.
4. `/admin/admins` lets the super admin create Admin/Staff accounts with different rights.

## File map

```
prisma/schema.prisma            Admin, User, UmrahRequest, VisaRequest, FlightBooking, BlogPost, AuditLog
lib/prisma.ts                   Prisma client singleton (Prisma 7 + pg adapter)
lib/permissions.ts              Role -> permission map
lib/session.ts                  Cookie session + requireAdmin guard
lib/whatsapp.ts                 wa.me link builder
lib/public-actions.ts           Customer-facing form actions (no login required)
lib/actions.ts                  Admin actions (login, quotes, status, payments, users, admins, blog)

components/Logo.tsx
components/admin/ui.tsx         Card, Btn, Badge, DataTable, Field, PageTitle...
components/admin/NavLinks.tsx   Sidebar links, filtered by role
components/admin/RequestControls.tsx   Quote form, status buttons, payment control, tabs
components/site/Header.tsx
components/site/Footer.tsx

app/globals.css                 Navy/gold theme tokens
app/login/page.tsx
app/admin/layout.tsx            Sidebar + topbar shell
app/admin/page.tsx              Dashboard
app/admin/umrah/page.tsx
app/admin/visa/page.tsx
app/admin/flights/page.tsx
app/admin/users/page.tsx
app/admin/admins/page.tsx
app/admin/blog/page.tsx
app/admin/audit/page.tsx
app/(site)/layout.tsx           Public header/footer wrapper
app/(site)/page.tsx             Public home
app/(site)/request/page.tsx     Customer request form (umrah/visa/flight)
app/(site)/blog/page.tsx
app/(site)/blog/[slug]/page.tsx
```

## Roles

| Right | Super admin | Admin | Staff |
|---|---|---|---|
| Requests (Umrah/Visa/Flights, quotes, payments) | Yes | Yes | Yes |
| Users | Yes | Yes | Yes |
| Blog | Yes | Yes | No |
| Admins | Yes | No | No |
| Audit | Yes | Yes | No |
