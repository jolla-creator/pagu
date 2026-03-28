// ============================================
// Pagù — Type Definitions
// ============================================

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'PAID' | 'CANCELLED'

export interface Restaurant {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  stripeAccountId: string | null
  createdAt: string
  updatedAt: string
}

export interface Table {
  id: string
  number: number
  restaurantId: string
  qrCode: string | null
  active: boolean
  createdAt: string
}

export interface MenuCategory {
  id: string
  name: string
  description: string | null
  sortOrder: number
  restaurantId: string
  items?: MenuItem[]
}

export interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number // in cents
  imageUrl: string | null
  allergens: string[] // parsed from JSON
  available: boolean
  sortOrder: number
  categoryId: string
  restaurantId: string
  category?: MenuCategory
}

export interface Order {
  id: string
  tableId: string
  restaurantId: string
  status: OrderStatus
  total: number // in cents
  stripePaymentId: string | null
  customerName: string | null
  customerPhone: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  table?: Table
  items?: OrderItem[]
  review?: Review | null
}

export interface OrderItem {
  id: string
  orderId: string
  restaurantId: string
  menuItemId: string
  quantity: number
  price: number // price at time of order (cents)
  notes: string | null
  menuItem?: MenuItem
}

export interface Review {
  id: string
  orderId: string
  restaurantId: string
  rating: number // 1-5
  comment: string | null
  createdAt: string
}

export interface MenuPackage {
  id: string
  name: string
  description: string | null
  price: number
  imageUrl: string | null
  available: boolean
  sortOrder: number
  restaurantId: string
  createdAt: string
  updatedAt: string

  restaurant?: Restaurant
  items?: PackageItem[]
}

export interface PackageItem {
  id: string
  packageId: string
  menuItemId: string
  quantity: number
  restaurantId: string

  package?: MenuPackage
  menuItem?: MenuItem
}

// ============================================
// Multi-tenant / Auth Types (restaurant-scoped)
// ============================================

export type UserRole = 'OWNER' | 'STAFF'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  restaurantId: string
  createdAt: string
}

export interface Session {
  userId: string
  restaurantId: string
  role: UserRole
}

export interface MultiTenantResponse<T> {
  data: T
  restaurantId: string
}


// ============================================
// API Response Types
// ============================================

export interface MenuResponse {
  categories: (MenuCategory & { items: MenuItem[] })[]
  restaurant: Pick<Restaurant, 'id' | 'name'>
}

export interface OrderResponse {
  order: Order
}

export interface OrdersResponse {
  orders: Order[]
}

export interface DashboardStats {
  todayOrders: number
  todayRevenue: number // in cents
  activeTables: number
  avgPerTable: number // in cents
  topItems: { name: string; count: number }[]
  ordersByDay: { date: string; count: number; revenue: number }[]
}

// ============================================
// Cart Types (Client-side only)
// ============================================

export interface CartItem {
  menuItemId: string
  name: string
  price: number // in cents
  quantity: number
  notes: string
  imageUrl?: string | null
}

// ============================================
// Stripe Types
// ============================================

export interface CheckoutRequest {
  items: CartItem[]
  tableId: string
  customerName?: string
}

export interface CheckoutResponse {
  url: string
  sessionId: string
}

// ============================================
// Fiscal Types (SDI Stub)
// ============================================

export interface FiscalConfig {
  restaurantId: string
  piva: string
  codiceDestinatario: string
  ragioneSociale: string
  indirizzo: string
  cap: string
  citta: string
  provincia: string
}

export interface InvoiceData {
  orderId: string
  items: OrderItem[]
  total: number
  fiscalConfig: FiscalConfig
}

// ============================================
// Utility Types
// ============================================

export function formatPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}

export function parseAllergens(allergensJson: string): string[] {
  try {
    return JSON.parse(allergensJson)
  } catch {
    return []
  }
}

export function allergensToString(allergens: string[]): string {
  return JSON.stringify(allergens)
}
