# Fix API Errors + Add Registration

## Context
Dopo la migrazione da SQLite a Supabase PostgreSQL, alcune API restituiscono errori 500. Inoltre manca la pagina di registrazione utente.

## Tasks

### 1. Fix Orders API (500 error)
- Rimuovere `review: true` dalla query GET (tabella Review potrebbe non essere correttamente relazionata)
- File: `src/app/api/orders/route.ts`

### 2. Fix Reviews API (500 error)
- Verificare che la tabella Review esista su Supabase
- Verificare foreign key constraint
- File: `src/app/api/reviews/route.ts`

### 3. Fix Analytics API (500 error)
- Verificare query analytics
- File: `src/app/api/analytics/route.ts`

### 4. Fix Stripe Subscription API (400 error)
- Verificare che STRIPE_SECRET_KEY sia settata su Vercel
- File: `src/app/api/stripe/subscription/route.ts`

### 5. Add Registration Page
- Creare pagina `/register` con form email/password/name
- Creare API `/api/auth/register` per creare nuovo utente + ristorante
- File: `src/app/register/page.tsx`
- File: `src/app/api/auth/register/route.ts`

## Verification
- Tutte le API devono restituire 200/201
- Pagina di registrazione deve funzionare
- Login con nuovo utente deve funzionare
