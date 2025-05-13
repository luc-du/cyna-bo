import reducer, {
  fetchOrders,
  fetchOrderDetails,
  cancelSubscription
} from './orderStore';
import type { Order } from './orderStore';

describe('orderStore reducer', () => {
  const initialState = {
    orders: [],
    selectedOrder: null,
    loading: false,
    error: null,
  };

  const makeOrder = (overrides: Partial<Order> = {}): Order => ({
    id: 1,
    productId: 1,
    customerId: '1',
    status: 'pending',
    amount: 100,
    createdAt: '',
    subscriptionId: 'sub1',
    orderNumber: 'ord1',
    quantity: 1,
    updatedAt: '',
    ...overrides,
  });

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle fetchOrders.pending', () => {
    const state = reducer(initialState, { type: fetchOrders.pending.type });
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle fetchOrders.fulfilled', () => {
    const orders = [makeOrder()];
    const state = reducer(initialState, { type: fetchOrders.fulfilled.type, payload: orders });
    expect(state.loading).toBe(false);
    expect(state.orders).toEqual(orders);
  });

  it('should handle fetchOrders.rejected', () => {
    const state = reducer(initialState, { type: fetchOrders.rejected.type, payload: 'err' });
    expect(state.loading).toBe(false);
    expect(state.error).toBe('err');
  });

  it('should handle fetchOrderDetails.fulfilled', () => {
    const order = makeOrder({ id: 2 });
    const state = reducer(initialState, { type: fetchOrderDetails.fulfilled.type, payload: order });
    expect(state.selectedOrder).toEqual(order);
  });

  it('should handle cancelSubscription.fulfilled', () => {
    const prevState = { ...initialState, orders: [makeOrder({ customerId: 'a' }), makeOrder({ customerId: 'b' })] };
    const state = reducer(prevState, { type: cancelSubscription.fulfilled.type, payload: 'a' });
    expect(state.orders.find(o => o.customerId === 'a')?.status).toBe('CANCELED');
  });
});
