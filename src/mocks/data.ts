import { Product, Order, SupportTicket, User, DashboardStats } from '../types';
import { generateMockId } from '../lib/utils';

export const mockProducts: Product[] = [
  {
    id: generateMockId(),
    name: 'Premium CRM Suite',
    description: 'Enterprise-grade CRM solution with advanced analytics',
    price: 299.99,
    category: 'Enterprise',
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-01T15:30:00Z',
  },
  {
    id: generateMockId(),
    name: 'Email Marketing Pro',
    description: 'Professional email marketing platform',
    price: 49.99,
    category: 'Marketing',
    status: 'active',
    createdAt: '2024-01-20T09:00:00Z',
    updatedAt: '2024-02-05T11:20:00Z',
  },
  {
    id: generateMockId(),
    name: 'Project Management Tool',
    description: 'Comprehensive project management solution',
    price: 149.99,
    category: 'Productivity',
    status: 'active',
    createdAt: '2024-01-25T14:00:00Z',
    updatedAt: '2024-02-10T16:45:00Z',
  },
];

export const mockOrders: Order[] = [
  {
    id: generateMockId(),
    productId: mockProducts[0].id,
    userId: 'user1',
    status: 'completed',
    amount: 299.99,
    createdAt: '2024-02-01T10:30:00Z',
  },
  {
    id: generateMockId(),
    productId: mockProducts[1].id,
    userId: 'user2',
    status: 'pending',
    amount: 49.99,
    createdAt: '2024-02-05T15:45:00Z',
  },
  {
    id: generateMockId(),
    productId: mockProducts[2].id,
    userId: 'user3',
    status: 'completed',
    amount: 149.99,
    createdAt: '2024-02-10T09:15:00Z',
  },
];

export const mockSupportTickets: SupportTicket[] = [
  {
    id: generateMockId(),
    userId: 'user1',
    subject: 'Integration Issue',
    message: 'Having trouble integrating with Salesforce',
    status: 'open',
    priority: 'high',
    createdAt: '2024-02-10T08:00:00Z',
  },
  {
    id: generateMockId(),
    userId: 'user2',
    subject: 'Billing Question',
    message: 'Need clarification on recent charges',
    status: 'in_progress',
    priority: 'medium',
    createdAt: '2024-02-09T14:30:00Z',
  },
  {
    id: generateMockId(),
    userId: 'user3',
    subject: 'Feature Request',
    message: 'Suggesting new reporting capabilities',
    status: 'resolved',
    priority: 'low',
    createdAt: '2024-02-08T11:15:00Z',
  },
];

export const mockDashboardStats: DashboardStats = {
  totalSales: 25000,
  totalOrders: 150,
  averageOrderValue: 166.67,
  activeProducts: 3,
};