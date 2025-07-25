
import { supabase } from '../utils/supabase';
import { Product, User, Category, Order, Address, Review } from '../types';

// --- PRODUCTS ---
export async function addProduct(product: Omit<Product, 'id'>): Promise<Product> {
  const { data, error } = await supabase.from('products').insert([product]).select().single();
  if (error) throw error;
  return data as Product;
}
export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data as Product[];
}
export async function fetchProductById(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Product;
}
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase.from('products').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Product;
}
export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// --- CATEGORIES ---
export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from('categories').select('*').eq('status', 'APPROVED');
  if (error) throw error;
  return data as Category[];
}
export async function addCategory(category: Omit<Category, 'id'>): Promise<Category> {
  const { data, error } = await supabase.from('categories').insert([category]).select().single();
  if (error) throw error;
  return data as Category;
}
export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// --- USERS ---
export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data as User[];
}
export async function fetchUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
  if (error) throw error;
  return data as User;
}
export async function addUser(user: Omit<User, 'id'>): Promise<User> {
  const { data, error } = await supabase.from('users').insert([user]).select().single();
  if (error) throw error;
  return data as User;
}
export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as User;
}
export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from('users').delete().eq('id', id);
  if (error) throw error;
}

// --- ORDERS ---
export async function fetchOrdersByUserId(userId: string, isTrial: boolean): Promise<Order[]> {
  const { data, error } = await supabase.from('orders').select('*').eq('user_id', userId).eq('is_trial_order', isTrial);
  if (error) throw error;
  return data as Order[];
}
export async function fetchOrderById(id: string): Promise<Order | null> {
  const { data, error } = await supabase.from('orders').select('*').eq('id', id).single();
  if (error) throw error;
  return data as Order;
}
export async function addOrder(order: Omit<Order, 'id'>): Promise<Order> {
  const { data, error } = await supabase.from('orders').insert([order]).select().single();
  if (error) throw error;
  return data as Order;
}
export async function updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
  const { data, error } = await supabase.from('orders').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Order;
}
export async function deleteOrder(id: string): Promise<void> {
  const { error } = await supabase.from('orders').delete().eq('id', id);
  if (error) throw error;
}

// --- REVIEWS ---
export async function fetchReviewsByProductId(productId: string): Promise<Review[]> {
  const { data, error } = await supabase.from('reviews').select('*').eq('product_id', productId);
  if (error) throw error;
  return data as Review[];
}
export async function addReview(review: Omit<Review, 'id' | 'date'>): Promise<Review> {
  const { data, error } = await supabase.from('reviews').insert([review]).select().single();
  if (error) throw error;
  return data as Review;
}

// --- ADDRESSES ---
export async function fetchAddresses(userId: string): Promise<Address[]> {
  const { data, error } = await supabase.from('addresses').select('*').eq('user_id', userId);
  if (error) throw error;
  return data as Address[];
}
export async function addAddress(address: Omit<Address, 'id'>): Promise<Address> {
  const { data, error } = await supabase.from('addresses').insert([address]).select().single();
  if (error) throw error;
  return data as Address;
}
export async function updateAddress(id: string, updates: Partial<Address>): Promise<Address> {
  const { data, error } = await supabase.from('addresses').update(updates).eq('id', id).select().single();
  if (error) throw error;
  return data as Address;
}
export async function deleteAddress(id: string): Promise<void> {
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  if (error) throw error;
}

// --- ACTIVITY ---
export async function logActivity(activity: { user_id: string; action: string; details?: any }): Promise<void> {
  const { error } = await supabase.from('activity').insert([activity]);
  if (error) throw error;
}
