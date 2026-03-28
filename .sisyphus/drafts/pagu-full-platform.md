# Draft: Pagù Full Platform Plan

## Business Model
- Restaurant pays Pagù monthly subscription (BASIC/PRO)
- Customer payments go DIRECTLY to restaurant via Stripe Connect
- Pagù may take a small fee per transaction

## MVP Scope (Tutto Completo)

### Customer Journey (Il Cliente)
1. Scan QR → Opens `/table/{tableId}`
2. View menu by category (with images)
3. Add items to cart, customize with notes
4. Place order → goes to kitchen dashboard
5. View "Il Conto" → see all orders with paid/unpaid status
6. Select specific items to pay (partial payment)
7. Pay via Stripe → items marked as paid
8. Other diners see updated bill (paid items vs remaining)
9. Leave review after payment

### Restaurant Journey (Il Ristorante)
1. Register → email, password, name, restaurant name
2. Login with registered credentials (not hardcoded!)
3. Onboarding: connect Stripe account (Stripe Connect)
4. Manage menu: categories CRUD, items CRUD, images
5. Manage tables: create, QR codes
6. Real-time order dashboard: see orders, change status
7. Analytics: revenue charts, top dishes, table occupancy
8. Reviews: see and respond to reviews
9. Settings: restaurant info, Stripe status, subscription

## Critical Fixes Required

### Auth
- [ ] Login queries User table instead of hardcoded creds
- [ ] Middleware protects dashboard routes
- [ ] JWT includes restaurantId from DB

### Multi-tenancy
- [ ] All APIs filter by restaurantId from JWT
- [ ] Menu API requires restaurantId
- [ ] Analytics filtered by restaurant
- [ ] Orders filtered by restaurant
- [ ] Reviews filtered by restaurant

### Partial Payments
- [ ] Add `isPaid` boolean to OrderItem
- [ ] Checkout sends orderItemIds in metadata
- [ ] Webhook marks specific OrderItems as paid
- [ ] Customer sees paid/unpaid split in real-time

### Stripe Connect
- [ ] Onboarding flow: create Express account
- [ ] Save stripeAccountId on Restaurant
- [ ] Checkout uses connected account
- [ ] Subscription payments work

### Analytics
- [ ] Pull real revenue from paid orders
- [ ] Top dishes by quantity AND revenue
- [ ] Real-time order status counts
- [ ] Table occupancy (orders per table)
- [ ] Stripe conversion metrics (success/fail)
- [ ] Date range selector (7d, 30d, 90d)

### Settings
- [ ] Save restaurant name, address, phone
- [ ] Stripe Connect onboarding button
- [ ] Subscription status and upgrade
- [ ] User management (invite staff)

### Image Upload
- [ ] Use Supabase Storage or external CDN
- [ ] Not local filesystem (serverless)

### Other
- [ ] Success page fetches actual order from DB
- [ ] Dashboard uses SSE instead of polling
- [ ] Category CRUD in menu page
- [ ] Review moderation (hide, respond)
