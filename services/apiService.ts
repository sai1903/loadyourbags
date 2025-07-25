
import { supabase } from '../utils/supabase';
import { Product, User, Category, Order, Address, Review } from '../types';
import config from '../utils/config';
import logger from '../utils/logger';
import { performanceMonitor } from '../utils/performance';

// Enhanced error handling
class ApiError extends Error {
  constructor(message: string, public statusCode?: number, public originalError?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Retry mechanism for failed requests
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw new ApiError(
          `Operation failed after ${maxRetries} attempts: ${lastError.message}`,
          500,
          lastError
        );
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

// Helper function to handle Supabase responses
function handleSupabaseResponse<T>(data: T, error: any): T {
  if (error) {
    logger.error('Supabase API Error', error);
    throw new ApiError(error.message, error.code, error);
  }
  return data;
}

// Performance monitoring wrapper for API calls
function withPerformanceMonitoring<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const startMark = `${operationName}-start`;
    const endMark = `${operationName}-end`;
    
    performanceMonitor.mark(startMark);
    
    try {
      const result = await operation();
      performanceMonitor.mark(endMark);
      const duration = performanceMonitor.measure(operationName, startMark, endMark);
      
      logger.debug(`API Operation: ${operationName} completed in ${duration}ms`);
      resolve(result);
    } catch (error) {
      performanceMonitor.mark(endMark);
      const duration = performanceMonitor.measure(operationName, startMark, endMark);
      
      logger.error(`API Operation: ${operationName} failed after ${duration}ms`, error);
      reject(error);
    }
  });
}
function handleSupabaseResponse<T>(data: T | null, error: any): T {
  if (error) {
    console.error('Supabase error:', error);
    throw new ApiError(
      error.message || 'Database operation failed',
      error.code || 500,
      error
    );
  }
  
  if (data === null) {
    throw new ApiError('No data returned from database', 404);
  }
  
  return data;
}

// --- PRODUCTS ---
export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        ...product,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as Product;
  });
}

export async function fetchProducts(filters?: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  limit?: number;
  offset?: number;
}): Promise<Product[]> {
  return withRetry(async () => {
    let query = supabase.from('products').select('*');
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    return handleSupabaseResponse(data, error) as Product[];
  });
}

export async function fetchProductById(id: string): Promise<Product | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return null; // Not found
    }
    
    return handleSupabaseResponse(data, error) as Product;
  });
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('products')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as Product;
  });
}

export async function deleteProduct(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new ApiError(error.message, error.code, error);
    }
  });
}

// --- CATEGORIES ---
export async function fetchCategories(): Promise<Category[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'APPROVED')
      .order('name');
    
    return handleSupabaseResponse(data, error) as Category[];
  });
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as Category;
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new ApiError(error.message, error.code, error);
    }
  });
}

// --- USERS ---
export async function fetchUsers(): Promise<User[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    return handleSupabaseResponse(data, error) as User[];
  });
}

export async function fetchUserById(id: string): Promise<User | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return null;
    }
    
    return handleSupabaseResponse(data, error) as User;
  });
}

export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        ...user,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as User;
  });
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as User;
  });
}

export async function deleteUser(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new ApiError(error.message, error.code, error);
    }
  });
}

// --- ORDERS ---
export async function fetchOrdersByUserId(userId: string, isTrial: boolean = false): Promise<Order[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .eq('is_trial_order', isTrial)
      .order('created_at', { ascending: false });
    
    return handleSupabaseResponse(data, error) as Order[];
  });
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error && error.code === 'PGRST116') {
      return null;
    }
    
    return handleSupabaseResponse(data, error) as Order;
  });
}

export async function addOrder(order: Omit<Order, 'id'>): Promise<Order> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...order,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as Order;
  });
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('orders')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as Order;
  });
}

export async function deleteOrder(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new ApiError(error.message, error.code, error);
    }
  });
}

// --- REVIEWS ---
export async function fetchReviewsByProductId(productId: string): Promise<Review[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    
    return handleSupabaseResponse(data, error) as Review[];
  });
}

export async function addReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        ...review,
        date: new Date().toISOString(),
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as Review;
  });
}

// --- ADDRESSES ---
export async function fetchAddresses(userId: string): Promise<Address[]> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });
    
    return handleSupabaseResponse(data, error) as Address[];
  });
}

export async function addAddress(address: Omit<Address, 'id'>): Promise<Address> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('addresses')
      .insert([{
        ...address,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as Address;
  });
}

export async function updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('addresses')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    return handleSupabaseResponse(data, error) as Address;
  });
}

export async function deleteAddress(id: string): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw new ApiError(error.message, error.code, error);
    }
  });
}

// --- ACTIVITY LOGGING ---
export async function logActivity(activity: { 
  user_id: string; 
  action: string; 
  details?: any;
  ip_address?: string;
  user_agent?: string;
}): Promise<void> {
  return withRetry(async () => {
    const { error } = await supabase
      .from('activity')
      .insert([{
        ...activity,
        timestamp: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Failed to log activity:', error);
      // Don't throw error for logging failures in production
      if (process.env.REACT_APP_ENV !== 'production') {
        throw new ApiError(error.message, error.code, error);
      }
    }
  });
}

// --- HEALTH CHECK ---
export async function healthCheck(): Promise<{ status: string; timestamp: string }> {
  return withRetry(async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('count')
      .limit(1);
    
    if (error) {
      throw new ApiError('Database connection failed', 500, error);
    }
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString()
    };
  });
}

// Export all functions as default
const apiService = {
  addProduct,
  fetchProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
  fetchCategories,
  addCategory,
  deleteCategory,
  fetchUsers,
  fetchUserById,
  addUser,
  updateUser,
  deleteUser,
  fetchOrdersByUserId,
  fetchOrderById,
  addOrder,
  updateOrder,
  deleteOrder,
  fetchReviewsByProductId,
  addReview,
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  logActivity,
  healthCheck
};

export default apiService;
