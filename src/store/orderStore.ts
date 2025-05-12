import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const ORDER_API_BASE_URL = "/api/v1/subscriptions";

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token found");
  return {
    Authorization: `Bearer ${token}`,
  };
};

// Define the Order interface based on the API response
export interface Order {
  id: number;
  subscriptionId: string;
  customerId: string;
  productId: number;
  orderNumber: string;
  status: string;
  quantity: number;
  amount: number;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  productName?: string; // Derived field
}

// Fetch all orders
export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await fetch(`${ORDER_API_BASE_URL}/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Error fetching orders");
    }
  }
);

// Fetch order details
export const fetchOrderDetails = createAsyncThunk(
  "orders/fetchOrderDetails",
  async (orderId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(`${ORDER_API_BASE_URL}/${orderId}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch order details (${response.status})`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Error fetching order details");
    }
  }
);

// Cancel subscription
export const cancelSubscription = createAsyncThunk(
  "orders/cancelSubscription",
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${ORDER_API_BASE_URL}/subscription/cancel`, {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to cancel subscription");
      }
      
      return customerId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Error cancelling subscription");
    }
  }
);

// Define the state interface
interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: OrderState = {
  orders: [],
  selectedOrder: null,
  loading: false,
  error: null,
};

// Create the slice
const orderSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearSelectedOrder: (state) => {
      state.selectedOrder = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        // Update order status after cancellation
        const customerId = action.payload;
        state.orders = state.orders.map(order => 
          order.customerId === customerId 
            ? { ...order, canceled: true, status: 'CANCELED' } 
            : order
        );
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedOrder } = orderSlice.actions;
export default orderSlice.reducer;
