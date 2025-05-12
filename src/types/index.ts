export interface User {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
  password: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  images: Array<{
    id: string;
    name: string;
    url: string;
    uploadDate: string;
  }>;
}

export interface Order {
  id: string;
  productId: string;
  userId: string;
  status: "pending" | "completed" | "cancelled";
  amount: number;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved";
  priority: "low" | "medium" | "high";
  createdAt: string;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  activeProducts: number;
}
