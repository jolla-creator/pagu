type OrderEventType = 'NEW_ORDER' | 'STATUS_CHANGE'

interface OrderEvent {
  type: OrderEventType
  restaurantId: string
  data: {
    orderId: string
    order?: any
    status?: string
    timestamp: string
  }
}

type OrderEventListener = (event: OrderEvent) => void

class OrderEventBus {
  private listeners: Map<string, Set<OrderEventListener>> = new Map()

  emit(restaurantId: string, event: OrderEvent) {
    const listeners = this.listeners.get(restaurantId)
    if (listeners) {
      listeners.forEach(listener => listener(event))
    }
  }

  subscribe(restaurantId: string, listener: OrderEventListener): () => void {
    if (!this.listeners.has(restaurantId)) {
      this.listeners.set(restaurantId, new Set())
    }
    this.listeners.get(restaurantId)!.add(listener)

    return () => {
      this.listeners.get(restaurantId)?.delete(listener)
    }
  }
}

const orderEventBus = new OrderEventBus()

export function emitOrderEvent(restaurantId: string, type: OrderEventType, data: OrderEvent['data']) {
  orderEventBus.emit(restaurantId, { type, restaurantId, data })
}

export function subscribeToOrders(restaurantId: string, listener: OrderEventListener): () => void {
  return orderEventBus.subscribe(restaurantId, listener)
}
