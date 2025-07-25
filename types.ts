

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
  PENDING_SELLER = 'PENDING_SELLER',
}

export enum ApprovalStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault?: boolean;
}

export interface SellerInfo {
  companyName: string;
  gstNumber: string;
  cidNumber: string;
  panNumber: string;
  phoneNumber: string;
  address: Omit<Address, 'id' | 'isDefault'>;
  productList: string;
  documents: {
    companyPan: string;
    other: string;
  };
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  phone?: string;
  password?: string; // Should always be hashed on a real backend
  wishlist?: string[]; // array of product IDs
  addresses?: Address[];
  sellerInfo?: SellerInfo;
  purchasedProductIds?: string[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number; // 1 to 5
  comment: string;
  date: string; // ISO string
}

export interface FaqItem {
    question: string;
    answer: string;
}

export interface Product {
  id: string;
  name:string;
  category: string;
  retailPrice: number;
  mrp?: number;
  wholesalePrice: number;
  description: string;
  imageUrl: string;
  sellerId: string;
  reviews: Review[];
  onSale?: boolean;
  specifications?: Record<string, string>;
  colors: string[];
  isTrialAvailable?: boolean;
  pickupAddress?: Omit<Address, 'id' | 'isDefault'>;
  faq?: FaqItem[];
  // Approval System Fields
  status: ApprovalStatus;
  proposerId?: string; // ID of the user (seller) who proposed it
  rejectionReason?: string;
}

export interface CartItem extends Product {
  quantity: number;
  purchaseType: 'buy' | 'trial';
}

export interface Category {
  name: string;
  imageUrl: string;
  // Approval System Fields
  status: ApprovalStatus;
  proposerId?: string;
  rejectionReason?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Returned';

export interface DeliveryInfo {
  deliveryPersonName: string;
  phone: string;
  vehicleNumber: string;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  date: string; // ISO string
  status: OrderStatus;
  shippingAddress: Address;
  isTrialOrder?: boolean;
  deliveryInfo?: DeliveryInfo;
}

export interface AdminAnalyticsData {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalSellers: number;
  salesByMonth: { month: string; sales: number }[];
  userRoleDistribution: { role: UserRole | string; count: number }[];
}

export interface Slide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  link: string;
  // Approval System Fields
  status: ApprovalStatus;
  proposerId?: string;
  rejectionReason?: string;
}