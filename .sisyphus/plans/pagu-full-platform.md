# Pagù - Full Platform Work Plan

## TL;DR

> **Obiettivo**: Trasformare Pagù da prototype a piattaforma SaaS multi-tenant production-ready per ristoranti italiani.
> 
> **Flusso Cliente**: Scan QR → Menu → Ordina → Paga (anche parziale) → Recensione
> **Flusso Ristorante**: Registrazione → Login → Connetti Stripe → Gestione Menu/Tavoli → Dashboard Real-time → Analytics
> 
> **Modello Business**: Ristorante paga abbonamento a Pagù (BASIC/PRO). Clienti pagano cibo direttamente al ristorante tramite Stripe Connect.
> 
> **Stima Lavoro**: XL (50+ tasks)
> **Esecuzione**: Wave-based, max parallelismo

---

## Context

### Problemi Attuali (Analisi Codice)

| # | Problema | File | Severità |
|---|----------|------|----------|
| 1 | Login usa credenziali hardcoded, non il DB | `login-v2/route.ts` | CRITICAL |
| 2 | Nessun filtro multi-tenant - API mostrano TUTTI i ristoranti | Tutte le API | CRITICAL |
| 3 | Pagamento parziale rotto - UI esiste, backend crea nuovo ordine | `webhook/route.ts`, `checkout/route.ts` | CRITICAL |
| 4 | Nessun campo `isPaid` su OrderItem | `schema.prisma` | CRITICAL |
| 5 | Pagina impostazioni hardcoded, nulla funziona | `impostazioni/page.tsx` | CRITICAL |
| 6 | No Stripe Connect onboarding | N/A | CRITICAL |
| 7 | Upload immagini su filesystem locale (non funziona su Vercel) | `upload/route.ts` | CRITICAL |
| 8 | Analytics non usa Stripe, solo DB locale | `analytics/route.ts` | HIGH |
| 9 | Success page usa sessionStorage (non esiste dopo redirect) | `success/page.tsx` | HIGH |
| 10 | Subscription POST non crea Stripe subscription reale | `subscription/route.ts` | HIGH |
| 11 | Dashboard usa polling invece di SSE | `dashboard/page.tsx` | MEDIUM |
| 12 | No Category CRUD nel menu | `menu/page.tsx` | MEDIUM |
| 13 | Reviews senza moderazione | `recensioni/page.tsx` | MEDIUM |

---

## Work Objectives

### Core Objective
Piattaforma SaaS production-ready dove:
- Ristoranti si registrano, configurano, gestiscono il menu
- Clienti scansionano QR, ordinano, pagano (intero o parziale)
- Dashboard mostra analytics reali da Stripe + DB

### Deliverables Concrete

**Autenticazione**:
- [ ] Login reale (query User table, non hardcoded)
- [ ] JWT contiene restaurantId dal DB
- [ ] Middleware protegge routes dashboard
- [ ] Logout funziona

**Multi-tenancy**:
- [ ] Tutte le API filtrano per restaurantId da JWT
- [ ] Menu API richiede restaurantId
- [ ] Dashboard mostra solo dati ristorante loggato

**Flusso Ordini**:
- [ ] Cliente crea ordine → status PENDING
- [ ] Ristorante vede ordini real-time (SSE)
- [ ] Ristorante cambia status (PENDING → PREPARING → READY → PAID)
- [ ] Cliente vede updates in tempo reale

**Pagamenti Parziali**:
- [ ] Schema: OrderItem.has campo `isPaid` o `paidAt`
- [ ] Checkout invia orderItemIds in metadata
- [ ] Webhook marca items specifici come pagati
- [ ] Cliente vede split pagato/non pagato in tempo reale
- [ ] Altri clienti allo stesso tavolo vedono aggiornamento

**Stripe Connect**:
- [ ] Onboarding flow: ristorante crea account Stripe Express
- [ ] Salvataggio `stripeAccountId` su Restaurant
- [ ] Checkout usa connected account (pagamenti → ristorante)
- [ ] Webhook gestisce `account.updated`

**Analytics Dashboard**:
- [ ] Incasso giornaliero/settimanale/mensile (da ordini PAID)
- [ ] Top piatti (quantità + revenue)
- [ ] Ordini attivi real-time (PENDING/PREPARING/READY)
- [ ] Tavoli occupati/liberi
- [ ] Recensioni + rating medio
- [ ] Metriche Stripe (pagamenti ok/falliti)
- [ ] Date range selector (7d, 30d, 90d)

**Gestione Ristorante**:
- [ ] Menu: CRUD categorie + CRUD items + upload immagini
- [ ] Tavoli: CRUD + generazione QR code
- [ ] Impostazioni: nome, indirizzo, telefono, orari
- [ ] Abbonamento: upgrade BASIC → PRO

**Upload Immagini**:
- [ ] Usa Supabase Storage o servizio esterno (Cloudinary)
- [ ] Non filesystem locale

---

## Verification Strategy

**Test Infrastructure**: Non presente → Agli agenti serve testare manualmente ogni scenario.

**QA Policy**: Ogni task include Agent-Executed QA Scenarios.

**Flussi da testare**:

| Flusso | Tool | Verifica |
|--------|------|----------|
| Registrazione nuovo ristorante | curl + UI | Crea User + Restaurant + Subscription + Menu + Tables |
| Login con nuove credenziali | curl | JWT con restaurantId corretto |
| Menu filtrato per ristorante | curl | Solo menu del ristorante loggato |
| Cliente ordina item | curl + UI | Ordine in DB con status PENDING |
| Ristorante vede ordine real-time | SSE | Ordine appare senza refresh |
| Ristorante cambia status | curl | Status aggiornato |
| Cliente paga parte del conto | Stripe test mode | Items selezionati marcati pagati |
| Cliente vede conto aggiornato | UI | Items pagati vs non pagati |
| Analytics mostra dati corretti | UI | Numeri corrispondono a ordini reali |
| Upload immagine menu | UI | Immagine visibile dopo deploy |
| Stripe Connect onboarding | UI | Account collegato correttamente |

---

## Execution Strategy

### Wave 1: Foundation (Multi-tenancy + Auth)
Tutti i task indipendenti che non dipendono da nulla.

```
T1.1: Modifica Prisma schema - Aggiungi isPaid/paidAt a OrderItem
T1.2: Fix login-v2 - Query User table invece hardcoded
T1.3: Aggiungi restaurantId a JWT payload
T1.4: Crea middleware auth per dashboard routes
T1.5: Fix Menu API - Aggiungi filtro restaurantId
T1.6: Fix Orders API - Aggiungi filtro restaurantId
T1.7: Fix Analytics API - Aggiungi filtro restaurantId
T1.8: Fix Reviews API - Aggiungi filtro restaurantId
T1.9: Fix Tables API - Aggiungi filtro restaurantId
T1.10: Fix Subscription API - Aggiungi filtro restaurantId
```

### Wave 2: Image Upload (Bloccante per menu)
```
T2.1: Configura Supabase Storage bucket per immagini
T2.2: Modifica upload API - Usa Supabase invece filesystem
T2.3: Aggiorna UI menu - Mostra immagini da Supabase
```

### Wave 3: Stripe Connect
```
T3.1: Crea Stripe Connect onboarding API
T3.2: Aggiungi bottone "Connetti Stripe" in settings
T3.3: Callback Stripe - salva stripeAccountId
T3.4: Modifica checkout - Usa connected account
T3.5: Aggiorna webhook - Gestisci account.updated
```

### Wave 4: Partial Payments
```
T4.1: Modifica checkout - Invia orderItemIds in metadata
T4.2: Modifica webhook - Marca items specifici come pagati
T4.3: Fix Customer page - Mostra paid/unpaid items real-time
T4.4: Fix Success page - Fetch ordine da DB, non sessionStorage
T4.5: Test flusso completo: ordina 4 items, paga 2, verifica stato
```

### Wave 5: Dashboard & Real-time
```
T5.1: Dashboard usa SSE invece di polling
T5.2: Aggiorna OrderCard - Mostra items e totale
T5.3: Fix Impostazioni page - Dati reali da DB + save
T5.4: Aggiungi Category CRUD nel menu page
```

### Wave 6: Analytics
```
T6.1: Analytics - Revenue giornaliero/settimanale/mensile
T6.2: Analytics - Top piatti per quantità e revenue
T6.3: Analytics - Table occupancy
T6.4: Analytics - Stripe conversion metrics
T6.5: UI - Date range selector
```

### Wave 7: Subscription (Ristorante → Pagù)
```
T7.1: Crea pricing page per abbonamenti
T7.2: Subscription checkout crea Stripe subscription reale
T7.3: Subscription webhook aggiorna status
T7.4: Settings mostra stato abbonamento
```

### Wave 8: Reviews Enhancement
```
T8.1: Reviews - Filtro per rating/date
T8.2: Reviews - Moderazione (hide/respond)
T8.3: Dashboard - Risposta alle recensioni
```

---

## TODOs

### Wave 1: Foundation

- [ ] 1.1 Modifica Prisma schema - Aggiungi `isPaid` (boolean) o `paidAt` (DateTime) a OrderItem

  **Cosa fare**:
  - Modifica `prisma/schema.prisma` - aggiungi campo `isPaid Boolean @default(false)` a OrderItem
  - Alternativa: `paidAt DateTime?` - più preciso (timestamp pagamento)
  - Genera migration o aggiorna DB manualmente

  **Riferimenti**:
  - `prisma/schema.prisma:120-133` - OrderItem model

  **QA**:
  - [ ] Ordine con items mostra nuovo campo
  - [ ] Valore default è false

- [ ] 1.2 Fix login-v2 - Query User table invece credenziali hardcoded

  **Cosa fare**:
  - Modifica `src/app/api/auth/login-v2/route.ts`
  - Rimuovi credenziali hardcoded (lines 5-11)
  - Query `prisma.user.findUnique({ where: { email } })`
  - Usa `bcrypt.compare()` per verificare password
  - Se utente esiste e password corretta → JWT con userId + restaurantId

  **Riferimenti**:
  - `src/app/api/auth/login-v2/route.ts:5-40`
  - `src/lib/auth.ts:31-43` - signJwt

  **QA**:
  - [ ] Login con owner@example.com/password123 funziona (utente esiste da registrazione)
  - [ ] Login con utente appena registrato funziona
  - [ ] Login con password sbagliata fallisce

- [ ] 1.3 Aggiungi restaurantId a JWT payload

  **Cosa fare**:
  - Modifica `src/app/api/auth/login-v2/route.ts` e `register/route.ts`
  - JWT deve contenere: `userId`, `restaurantId`, `role`
  - Leggi restaurantId dal record User dopo login/registrazione

  **Riferimenti**:
  - `src/lib/auth.ts:31-33` - signJwt payload

  **QA**:
  - [ ] JWT decodificato contiene restaurantId

- [ ] 1.4 Crea middleware auth per dashboard routes

  **Cosa fare**:
  - Crea o modifica `src/middleware.ts` (o `src/lib/middleware.ts`)
  - Proteggi `/dashboard/*` - richiede cookie `pagu_session` valido
  - Redirect a `/login` se non autenticato
  - Estrai restaurantId dal JWT per usare nelle API

  **Riferimenti**:
  - `src/lib/middleware.ts:21-55` - authenticateRequest, requireAuth

  **QA**:
  - [ ] Accesso /dashboard senza login → redirect /login
  - [ ] Accesso /dashboard con login valido → mostra dashboard

- [ ] 1.5 Fix Menu API - Filtro restaurantId

  **Cosa fare**:
  - Modifica `src/app/api/menu/route.ts` GET
  - Estrai restaurantId dal JWT (usa middleware o auth helper)
  - Filtra `where: { restaurantId }`
  - Stesso per POST (crea menu item per ristorante loggato)

  **Riferimenti**:
  - `src/app/api/menu/route.ts:4-36`
  - `src/lib/auth.ts:36-43` - verifyJwt

  **QA**:
  - [ ] GET /api/menu senza auth → 401
  - [ ] GET /api/menu con auth → solo menu del ristorante

- [ ] 1.6 Fix Orders API - Filtro restaurantId

  **Cosa fare**:
  - Modifica `src/app/api/orders/route.ts`
  - GET: filtra ordini per restaurantId
  - POST: associa ordine a restaurantId del table (estrai da Table)

  **Riferimenti**:
  - `src/app/api/orders/route.ts`
  - `src/app/api/orders/[id]/route.ts`

  **QA**:
  - [ ] Ordini mostrano solo quelli del ristorante

- [ ] 1.7 Fix Analytics API - Filtro restaurantId

  **Cosa fare**:
  - Modifica `src/app/api/analytics/route.ts`
  - Estrai restaurantId dal JWT
  - Filtra tutte le query per restaurantId

  **Riferimenti**:
  - `src/app/api/analytics/route.ts:10-70`

  **QA**:
  - [ ] Analytics mostra solo dati del ristorante loggato

- [ ] 1.8 Fix Reviews API - Filtro restaurantId

  **Cosa fare**:
  - Modifica `src/app/api/reviews/route.ts`
  - GET: filtra per restaurantId
  - POST: associa a restaurantId dell'ordine

  **Riferimenti**:
  - `src/app/api/reviews/route.ts`

  **QA**:
  - [ ] Reviews mostra solo recensioni del ristorante

- [ ] 1.9 Fix Tables API - Filtro restaurantId

  **Cosa fare**:
  - Modifica `src/app/api/tables/[id]/route.ts`
  - Filtra per restaurantId
  - POST (crea tavolo): associa a restaurantId

  **Riferimenti**:
  - `src/app/api/tables/[id]/route.ts`

  **QA**:
  - [ ] Tavoli mostrano solo quelli del ristorante

- [ ] 1.10 Fix Subscription API - Filtro restaurantId

  **Cosa fare**:
  - Modifica `src/app/api/stripe/subscription/route.ts`
  - GET/POST/DELETE: filtra per restaurantId dal JWT

  **Riferimenti**:
  - `src/app/api/stripe/subscription/route.ts`

  **QA**:
  - [ ] Subscription mostrata solo per ristorante loggato

---

### Wave 2: Image Upload

- [ ] 2.1 Configura Supabase Storage bucket per immagini

  **Cosa fare**:
  - Crea bucket `menu-images` in Supabase Dashboard
  - Policy: solo owner del ristorante può upload
  - Policy: tutti possono leggere (pubblico)

  **QA**:
  - [ ] Bucket esiste in Supabase
  - [ ] Upload tramite API funziona

- [ ] 2.2 Modifica upload API - Usa Supabase invece filesystem

  **Cosa fare**:
  - Modifica `src/app/api/upload/route.ts`
  - Rimuovi salvataggio filesystem (`fs.writeFile`)
  - Usa `@supabase/storage-js` per upload
  - Salva URL ritornato da Supabase

  **Riferimenti**:
  - `src/app/api/upload/route.ts`
  - Supabase Storage docs

  **QA**:
  - [ ] POST /api/upload con immagine → URL pubblico
  - [ ] Immagine accessibile da browser

- [ ] 2.3 Aggiorna UI menu - Mostra immagini da Supabase

  **Cosa fare**:
  - Modifica `src/app/(dashboard)/dashboard/menu/page.tsx`
  - Usa imageUrl del MenuItem per mostrare foto
  - Placeholder se null

  **Riferimenti**:
  - `src/app/(dashboard)/dashboard/menu/page.tsx`

  **QA**:
  - [ ] Menu items mostrano immagini se presenti

---

### Wave 3: Stripe Connect

- [ ] 3.1 Crea Stripe Connect onboarding API

  **Cosa fare**:
  - Crea `src/app/api/stripe/connect/onboarding/route.ts`
  - Usa Stripe API `accountLinks.create` con `type: 'account_onboarding'`
  - Redirect URL: `/api/stripe/connect/callback`
  - Salva accountId temporaneo o direttamente su Restaurant

  **Riferimenti**:
  - Stripe Connect Express onboarding docs

  **QA**:
  - [ ] Chiamata API → URL onboarding Stripe

- [ ] 3.2 Aggiungi bottone "Connetti Stripe" in settings

  **Cosa fare**:
  - Modifica `src/app/(dashboard)/dashboard/impostazioni/page.tsx`
  - Mostra bottone "Connetti a Stripe" se `stripeAccountId` null
  - Chiama API onboarding al click
  - Mostra stato "Collegato" se già collegato

  **Riferimenti**:
  - `src/app/(dashboard)/dashboard/impostazioni/page.tsx`

  **QA**:
  - [ ] Bottone visibile per ristorante senza Stripe
  - [ ] Click → redirect a Stripe

- [ ] 3.3 Callback Stripe - salva stripeAccountId

  **Cosa fare**:
  - Crea `src/app/api/stripe/connect/callback/route.ts`
  - Riceve `account` param da Stripe
  - Verifica con `account.retrieve(account)`
  - Salva `stripeAccountId` su Restaurant

  **Riferimenti**:
  - Stripe webhook docs

  **QA**:
  - [ ] Dopo onboarding, Restaurant.stripeAccountId valorizzato

- [ ] 3.4 Modifica checkout - Usa connected account

  **Cosa fare**:
  - Modifica `src/app/api/checkout/route.ts`
  - Recupera `stripeAccountId` del ristorante dal table
  - Passa `transfer_data: { destination: stripeAccountId }` a Stripe
  - Opzionale: `application_fee_amount` per commissione Pagù

  **Riferimenti**:
  - `src/app/api/checkout/route.ts:24-35`

  **QA**:
  - [ ] Pagamento → fondi vanno a connected account

- [ ] 3.5 Aggiorna webhook - Gestisci account.updated

  **Cosa fare**:
  - Modifica `src/app/api/stripe/webhook/route.ts`
  - Gestisci evento `account.updated` per aggiornare `stripeEnabled`
  - Verifica `charges_enabled` e `payouts_enabled`

  **Riferimenti**:
  - `src/app/api/stripe/webhook/route.ts:164-182`

  **QA**:
  - [ ] Webhook aggiorna status quando ristorante completa onboarding

---

### Wave 4: Partial Payments

- [ ] 4.1 Modifica checkout - Invia orderItemIds in metadata

  **Cosa fare**:
  - Modifica `src/app/api/checkout/route.ts`
  - Accetta array `orderItemIds` nel body (opzionale)
  - Includi in metadata: `{ tableId, orderItemIds: JSON.stringify(orderItemIds), ... }`
  - Se paymentMode === 'personal', passa orderItemIds

  **Riferimenti**:
  - `src/app/api/checkout/route.ts:24-35`
  - `src/app/(customer)/table/[tableId]/page.tsx:374-405`

  **QA**:
  - [ ] Metadata include orderItemIds per pagamenti parziali

- [ ] 4.2 Modifica webhook - Marca items specifici come pagati

  **Cosa fare**:
  - Modifica `src/app/api/stripe/webhook/route.ts`
  - Se metadata.orderItemIds esiste:
    - Parse array di orderItemIds
    - Update `prisma.orderItem.updateMany({ where: { id: { in: orderItemIds } }, data: { isPaid: true } })`
    - NON creare nuovo ordine
  - Se NESSUN orderItemIds: comportamento attuale (ordine intero)

  **Riferimenti**:
  - `src/app/api/stripe/webhook/route.ts:23-100`

  **QA**:
  - [ ] Pagamento parziale → items specifici marcati isPaid=true
  - [ ] Pagamento intero → tutto come prima

- [ ] 4.3 Fix Customer page - Mostra paid/unpaid real-time

  **Cosa fare**:
  - Modifica `src/app/(customer)/table/[tableId]/page.tsx`
  - BillView: mostra items con `isPaid: true` in verde
  - Calcola `paidTotal` e `unpaidTotal`
  - Only unpaid items selectable for payment
  - Poll/refresh più frequente dopo pagamento

  **Riferimenti**:
  - `src/app/(customer)/table/[tableId]/page.tsx:348-638`

  **QA**-:
  - [ ] Cliente vede items già pagati (verde)
  - [ ] Cliente vede items da pagare (selezionabili)
  - [ ] Totale aggiornato correttamente

- [ ] 4.4 Fix Success page - Fetch ordine da DB

  **Cosa fare**:
  - Modifica `src/app/(customer)/table/[tableId]/success/page.tsx`
  - Rimuovi dipendenza da sessionStorage
  - Estrai `session_id` da URL params
  - Chiama webhook per trovare ordine relativo (o cerca per stripePaymentId)
  - Mostra riepilogo ordine dal DB

  **Riferimenti**:
  - `src/app/(customer)/table/[tableId]/success/page.tsx`

  **QA**:
  - [ ] Pagamento → redirect → mostra ordine corretto
  - [ ] Nessuna dipendenza da sessionStorage

- [ ] 4.5 Test flusso completo: ordina 4 items, paga 2, verifica stato

  **QA Scenarios**:
  - Cliente ordina 4 pizze
  - Cliente seleziona 2 pizze e paga
  - Verifica: 2 isPaid=true, 2 isPaid=false
  - Verifica: altro cliente allo stesso tavolo vede stato aggiornato

---

### Wave 5: Dashboard & Real-time

- [ ] 5.1 Dashboard usa SSE invece di polling

  **Cosa fare**:
  - Modifica `src/app/(dashboard)/dashboard/page.tsx`
  - Usa `src/lib/events.ts` (se già implementato) o crea SSE connection
  - Endpoint `/api/events` per real-time updates
  - Rimuovi `setInterval` polling

  **Riferimenti**:
  - `src/lib/events.ts` (verifica se esiste)
  - `src/app/api/events/route.ts` (verifica se esiste)

  **QA**:
  - [ ] Nuovi ordini appaiono senza refresh
  - [ ] Status cambiamenti in tempo reale

- [ ] 5.2 Aggiorna OrderCard - Mostra items e totale

  **Cosa fare**:
  - Modifica `src/components/dashboard/OrderCard.tsx` (o simile)
  - Mostra lista items nell'ordine
  - Mostra note se presenti
  - Mostra totale

  **Riferimenti**:
  - `src/components/dashboard/OrderCard.tsx` (cerca)

  **QA**:
  - [ ] Dashboard mostra dettaglio completo ordini

- [ ] 5.3 Fix Impostazioni page - Dati reali + save

  **Cosa fare**:
  - Modifica `src/app/(dashboard)/dashboard/impostazioni/page.tsx`
  - Fetch dati ristorante da DB
  - Form con: nome, indirizzo, telefono, email, orari
  - POST a API dedicata per salvare
  - Mostra stato Stripe e abbonamento

  **Riferimenti**:
  - `src/app/(dashboard)/dashboard/impostazioni/page.tsx`

  **QA**:
  - [ ] Dati attuali mostrati nel form
  - [ ] Save aggiorna DB

- [ ] 5.4 Aggiungi Category CRUD nel menu page

  **Cosa fare**:
  - Modifica `src/app/(dashboard)/dashboard/menu/page.tsx`
  - Aggiungi: Crea categoria, Modifica categoria, Elimina categoria
  - API: `src/app/api/menu/categories/route.ts` o simile

  **Riferimenti**:
  - `src/app/api/menu/route.ts` (estendi)

  **QA**:
  - [ ] CRUD categorie funziona
  - [ ] Items associati correttamente

---

### Wave 6: Analytics

- [ ] 6.1 Analytics - Revenue giornaliero/settimanale/mensile

  **Cosa fare**:
  - Modifica `src/app/api/analytics/route.ts`
  - Accetta parametro `period`: 'day', 'week', 'month', '7d', '30d', '90d'
  - Calcola revenue da ordini con status='PAID'
  - Filtra per restaurantId

  **Riferimenti**:
  - `src/app/api/analytics/route.ts`

  **QA**:
  - [ ] API ritorna revenue per periodo corretto

- [ ] 6.2 Analytics - Top piatti

  **Cosa fare**:
  - Estendi analytics API
  - Aggrega OrderItem per menuItemId
  - Calcola: quantità vendute + revenue (price * quantity)
  - Ordina per totale decrescente

  **Riferimenti**:
  - `src/app/api/analytics/route.ts`

  **QA**:
  - [ ] Top 5 piatti corretti per periodo

- [ ] 6.3 Analytics - Table occupancy

  **Cosa fare**:
  - Aggiungi a analytics:
  - `totalTables`: count tavoli del ristorante
  - `occupiedTables`: tavoli con ordini attivi (non PAID/CANCELLED)
  - Calcola percentuale occupazione

  **Riferimenti**:
  - `src/app/api/analytics/route.ts`

  **QA**:
  - [ ] Percentuale occupazione corretta

- [ ] 6.4 Analytics - Stripe conversion metrics

  **Cosa fare**:
  - Query Stripe API (se disponibile) o
  - Traccia in DB: PaymentAttempt (success/fail)
  - Webhook traccia: `checkout.session.completed` → success
  - Webhook traccia: `payment_intent.payment_failed` → fail

  **Riferimenti**:
  - `src/app/api/stripe/webhook/route.ts`

  **QA**:
  - [ ] Metriche conversion mostrate

- [ ] 6.5 UI - Date range selector

  **Cosa fare**:
  - Modifica `src/app/(dashboard)/dashboard/analytics/page.tsx`
  - Aggiungi select/input per periodo (7d, 30d, 90d, custom)
  - Passa param a API
  - Aggiorna grafici al cambio

  **Riferimenti**:
  - `src/app/(dashboard)/dashboard/analytics/page.tsx`

  **QA**:
  - [ ] Cambio periodo aggiorna dati

---

### Wave 7: Subscription (Ristorante → Pagù)

- [ ] 7.1 Crea pricing page per abbonamenti

  **Cosa fare**:
  - Crea `src/app/(dashboard)/dashboard/abbonamento/page.tsx` o similar
  - Mostra piani: BASIC (€X/mese), PRO (€Y/mese)
  - Funzionalità incluse per piano
  - Bottone "Acquista" per upgrade

  **Riferimenti**:
  - `src/app/(dashboard)/dashboard/impostazioni/page.tsx`

  **QA**:
  - [ ] Pricing visibile e chiaro

- [ ] 7.2 Subscription checkout crea Stripe subscription reale

  **Cosa fare**:
  - Modifica `src/app/api/stripe/subscription/checkout/route.ts`
  - USA Stripe API (NON solo DB)
  - Crea `stripe.subscriptions.create` con priceId
  - Pagamento: carta cliente (non connected)
  - Customer: Pagù (non ristorante)

  **Riferimenti**:
  - `src/app/api/stripe/subscription/checkout/route.ts`

  **QA**:
  - [ ] Checkout → subscription Stripe reale creata

- [ ] 7.3 Subscription webhook aggiorna status

  **Cosa fare**:
  - Estendi `src/app/api/stripe/webhook/route.ts`
  - Gestisci `customer.subscription.created`, `updated`, `deleted`
  - Aggiorna DB con status, period dates

  **Riferimenti**:
  - `src/app/api/stripe/webhook/route.ts:103-142`

  **QA**:
  - [ ] Webhook aggiorna subscription in DB

- [ ] 7.4 Settings mostra stato abbonamento

  **Cosa fare**:
  - Modifica `src/app/(dashboard)/dashboard/impostazioni/page.tsx`
  - Mostra piano attuale (BASIC/PRO)
  - Mostra stato (TRIALING, ACTIVE, PAST_DUE, CANCELLED)
  - Mostra data rinnovo
  - Link a billing portal

  **Riferimenti**:
  - `src/app/(dashboard)/dashboard/impostazioni/page.tsx`

  **QA**:
  - [ ] Stato abbonamento visibile

---

### Wave 8: Reviews Enhancement

- [ ] 8.1 Reviews - Filtro per rating/date

  **Cosa fare**:
  - Modifica `src/app/(dashboard)/dashboard/recensioni/page.tsx`
  - Aggiungi filter dropdown (1-5 stelle)
  - Aggiungi date range picker
  - Filtra risultati client-side o server-side

  **Riferimenti**:
  - `src/app/(dashboard)/dashboard/recensioni/page.tsx`

  **QA**:
  - [ ] Filtro funziona correttamente

- [ ] 8.2 Reviews - Moderazione (hide/respond)

  **Cosa fare**:
  - Aggiungi campo `hidden` o `visible` a Review model
  - API: PATCH per hide/show
  - API: POST per aggiungi risposta
  - UI: bottone nascondi, form rispondi

  **Riferimenti**:
  - `prisma/schema.prisma` - Review model

  **QA**:
  - [ ] Review hidden non visibile pubblicamente
  - [ ] Risposta salvata e mostrata

- [ ] 8.3 Dashboard - Risposta alle recensioni

  **Cosa fare**:
  - Estendi `src/app/api/reviews/route.ts` POST
  - Accetta `response` field
  - Estendi UI per mostrare/aggiungi risposta

  **Riferimenti**:
  - `src/app/api/reviews/route.ts`

  **QA**:
  - [ ] Ristorante può rispondere a recensioni
  - [ ] Risposta visibile al pubblico

---

## Final Verification Wave

- [ ] F1. **Plan Compliance Audit**

  Verifica che tutti i "Must Have" siano implementati:
  - Login reale (no hardcoded)
  - Multi-tenancy funziona
  - Pagamenti parziali funzionano
  - Stripe Connect funziona
  - Analytics mostra dati reali

- [ ] F2. **Code Quality Review**

  - `npm run build` passa
  - `npm run lint` passa (se configurato)
  - Nessun `as any` o `@ts-ignore`
  - Nessun console.log in produzione

- [ ] F3. **Integration Test**

  Flusso completo testato:
  1. Registrazione ristorante
  2. Login
  3. Connessione Stripe
  4. Creazione menu + categorie
  5. Creazione tavoli + QR
  6. Cliente ordina (4 items)
  7. Cliente paga parziale (2 items)
  8. Verifica stato items
  9. Ristorante vede ordine
  10. Ristorante cambia status
  11. Analytics aggiornate

- [ ] F4. **Production Readiness**

  - Environment variables configurate su Vercel
  - Database migrations applicate
  - Supabase Storage configurato
  - Stripe webhook configurato
  - SSL/HTTPS attivo

---

## Success Criteria

### Verification Commands
```bash
# Build
npm run build  # Expected: success

# API Tests
curl -X POST /api/auth/login -d '{"email":"test@test.com","password":"test"}'  # Expected: JWT
curl /api/menu -H "Cookie: pagu_session=..."  # Expected: filtered menu
curl /api/analytics -H "Cookie: pagu_session=..."  # Expected: restaurant data

# Payment Test (Stripe test mode)
# 1. Create order with 4 items
# 2. Select 2 items, pay
# 3. Verify: 2 items isPaid=true, 2 items isPaid=false
```

### Final Checklist
- [ ] Multi-tenancy: ogni ristorante vede solo i propri dati
- [ ] Login: registrazione → login funziona
- [ ] Ordini: cliente ordina, ristorante vede, status updates funzionano
- [ ] Pagamenti: intero funziona, parziale funziona
- [ ] Stripe Connect: onboarding, pagamenti, webhook funzionano
- [ ] Analytics: revenue, top items, tabelle occupancy mostrano dati reali
- [ ] Menu: CRUD categorie + items + immagini
- [ ] Impostazioni: save funziona, Stripe status mostrato
- [ ] Build passa, deployment Vercel funziona
