# Add Registration Page

## Context
Aggiungere pagina di registrazione con email, password e nome ristorante.

## Tasks

### 1. Create Registration API
- File: `src/app/api/auth/register/route.ts`
- Accetta: email, password, name (nome utente), restaurantName
- Crea ristorante + utente OWNER
- Ritorna JWT token

### 2. Create Registration Page
- File: `src/app/register/page.tsx`
- Form con: email, password, nome utente, nome ristorante
- Redirect a /dashboard dopo registrazione

### 3. Update Login Page
- File: `src/app/login/page.tsx`
- Aggiungere link "Non hai un account? Registrati"

## Verification
- POST /api/auth/register crea utente + ristorante
- Pagina /register mostra form
- Dopo registrazione, redirect a /dashboard
- Login con nuove credenziali funziona
