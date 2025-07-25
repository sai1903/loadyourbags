

import { Product, User, UserRole, Category, Order, Address, SellerInfo, Review, Slide, ApprovalStatus, AdminAnalyticsData, CartItem, OrderItem } from '../types';

// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// This mock service simulates a backend API by fetching static JSON files
// and persisting state in localStorage to simulate a database across reloads.

// We use a simple cache to avoid re-fetching the data on every call within a single page lifecycle.
const dataCache: {
    users?: User[];
    products?: Product[];
    categories?: Category[];
    orders?: Order[];
    slides?: Slide[];
    gstRates?: { category: string; rate: number }[];
} = {};

// --- LocalStorage Persistence Helpers ---
const loadFromStorage = (key: string) => {
    const data = localStorage.getItem(`loadyourbags_db_${key}`);
    return data ? JSON.parse(data) : null;
};

const saveToStorage = (key: string, data: any) => {
    try {
        localStorage.setItem(`loadyourbags_db_${key}`, JSON.stringify(data));
    } catch (e) {
        console.error(`Failed to save to localStorage: ${key}`, e);
    }
};

// Helper to fetch and cache data from localStorage or initial JSON files
const initializeData = async () => {
    if (dataCache.products) {
        return;
    }
    try {
        // Try loading from localStorage first
        let users = loadFromStorage('users');
        let products = loadFromStorage('products');
        let categories = loadFromStorage('categories');
        let orders = loadFromStorage('orders');
        let slides = loadFromStorage('slides');
        let gstRates = loadFromStorage('gstRates');

        // If any part is missing, fetch all from JSON files as a fallback/initial seed
        if (!users || !products || !categories || !orders || !slides || !gstRates) {
            console.log("Seeding mock database from JSON files into localStorage...");
            const [usersRes, productsRes, categoriesRes, ordersRes, slidesRes, gstRatesRes] = await Promise.all([
                fetch('/db/users.json'),
                fetch('/db/products.json'),
                fetch('/db/categories.json'),
                fetch('/db/orders.json'),
                fetch('/db/slider.json'),
                fetch('/db/gst_rates.json'),
            ]);
            users = await usersRes.json();
            products = await productsRes.json();
            categories = await categoriesRes.json();
            orders = await ordersRes.json();
            slides = await slidesRes.json();
            gstRates = await gstRatesRes.json();

            saveToStorage('users', users);
            saveToStorage('products', products);
            saveToStorage('categories', categories);
            saveToStorage('orders', orders);
            saveToStorage('slides', slides);
            saveToStorage('gstRates', gstRates);
        }

        // Populate the in-memory cache for the current session
        dataCache.users = users;
        dataCache.products = products;
        dataCache.categories = categories;
        dataCache.orders = orders;
        dataCache.slides = slides;
        dataCache.gstRates = gstRates;

    } catch (error) {
        console.error("Fatal: Could not load initial mock data.", error);
        throw new Error("Application data could not be loaded. Please check the `db` folder and JSON files.");
    }
};


// Simulate a JWT. In a real app, this would be a proper encrypted token.
const FAKE_JWT_PREFIX = 'fake_jwt_for_';

const getCurrentUserFromToken = async (): Promise<User> => {
    await initializeData();
    const token = localStorage.getItem('authToken');
    if (!token) throw new Error("Not authenticated");
    const userId = token.replace(FAKE_JWT_PREFIX, '');
    const user = dataCache.users?.find(u => u.id === userId);
    if (!user) throw new Error("User from token not found.");
    return user;
}

const api = {
  // Auth
  login: async (email: string, password?: string): Promise<{ accessToken: string; user: User }> => {
    await initializeData();
    await delay(500);

    // Find by role for legacy simulation (only if no password is provided)
    if (!password) {
        const userByRole = dataCache.users?.find(u => u.role === email.toUpperCase());
        if (userByRole) {
          const accessToken = `${FAKE_JWT_PREFIX}${userByRole.id}`;
          return { accessToken, user: JSON.parse(JSON.stringify(userByRole)) };
        }
    }

    // Email/password login
    const user = dataCache.users?.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
        throw new Error('Invalid email or password.');
    }
    const accessToken = `${FAKE_JWT_PREFIX}${user.id}`;
    return { accessToken, user: JSON.parse(JSON.stringify(user)) };
  },

  signUp: async (signUpData: Omit<User, 'id' | 'role' | 'avatar' >): Promise<{ accessToken: string, user: User }> => {
    await initializeData();
    await delay(700);

    if (dataCache.users?.some(u => u.email.toLowerCase() === signUpData.email.toLowerCase())) {
        throw new Error('A user with this email already exists.');
    }

    const newUser: User = {
        id: `usr_${Date.now()}`,
        name: signUpData.name,
        email: signUpData.email,
        phone: signUpData.phone,
        password: signUpData.password,
        role: UserRole.CUSTOMER,
        avatar: `https://i.pravatar.cc/150?u=${signUpData.email}`,
        wishlist: [],
        addresses: [],
        purchasedProductIds: [],
    };
    
    dataCache.users?.push(newUser);
    saveToStorage('users', dataCache.users);
    const accessToken = `${FAKE_JWT_PREFIX}${newUser.id}`;
    return { accessToken, user: JSON.parse(JSON.stringify(newUser)) };
  },


  getMe: async (): Promise<User> => {
    await initializeData();
    await delay(100);
    const token = localStorage.getItem('authToken');
    if (!token || !token.startsWith(FAKE_JWT_PREFIX)) {
        throw new Error('No valid session found.');
    }
    const userId = token.replace(FAKE_JWT_PREFIX, '');
    const user = dataCache.users?.find(u => u.id === userId);
    if (!user) {
        throw new Error('User from token not found.');
    }
    return JSON.parse(JSON.stringify(user));
  },

  registerSeller: async (data: { name: string; email: string; sellerInfo: SellerInfo }): Promise<User> => {
    await initializeData();
    await delay(1000);
    
    if(dataCache.users?.some(u => u.email === data.email)) {
        throw new Error("A user with this email already exists.");
    }

    const newUser: User = {
        id: `usr_${Date.now()}`,
        name: data.name,
        email: data.email,
        role: UserRole.PENDING_SELLER,
        avatar: `https://i.pravatar.cc/150?u=${data.email}`,
        sellerInfo: data.sellerInfo,
    };

    dataCache.users?.push(newUser);
    saveToStorage('users', dataCache.users);
    return JSON.parse(JSON.stringify(newUser));
  },

  // Products
  fetchProducts: async (): Promise<Product[]> => {
    await initializeData();
    await delay(300);
    const approvedProducts = dataCache.products?.filter(p => p.status === ApprovalStatus.APPROVED) || [];
    // For public consumption, always strip sensitive data
    const publicProducts = JSON.parse(JSON.stringify(approvedProducts));
    publicProducts.forEach((p: Product) => {
        delete (p as any).pickupAddress;
        delete (p as any).wholesalePrice;
    });
    return publicProducts;
  },
  
  fetchAllProducts: async (): Promise<Product[]> => {
    await initializeData();
    await delay(300);
    return JSON.parse(JSON.stringify(dataCache.products || []));
  },
  
  fetchProductById: async (id: string): Promise<Product | undefined> => {
    await initializeData();
    await delay(50);
    const product = dataCache.products?.find(p => p.id === id);
    if (!product) return undefined;

    let isAuthorizedViewer = false;
    try {
        const currentUser = await getCurrentUserFromToken();
        if (currentUser.role === UserRole.ADMIN || currentUser.id === product.sellerId) {
            isAuthorizedViewer = true;
        }
    } catch (e) { /* not logged in, treat as customer */ }

    if (isAuthorizedViewer) {
        return JSON.parse(JSON.stringify(product));
    }

    // Customer can only see approved products
    if (product.status !== ApprovalStatus.APPROVED) {
        return undefined;
    }

    // For customers, strip sensitive data
    const publicProduct = JSON.parse(JSON.stringify(product));
    delete publicProduct.pickupAddress;
    delete publicProduct.wholesalePrice;
    return publicProduct;
  },

  fetchProductsByIds: async (ids: string[]): Promise<Product[]> => {
    await initializeData();
    await delay(150);
    const products = dataCache.products?.filter(p => ids.includes(p.id)) || [];
    // This function can be called for internal purposes (like invoice generation)
    // so we return the full product data. The caller is responsible for what they show.
    return JSON.parse(JSON.stringify(products));
  },

  addReview: async(productId: string, reviewData: Omit<Review, 'id' | 'date'>): Promise<Product> => {
    await initializeData();
    await delay(400);

    const productIndex = dataCache.products?.findIndex(p => p.id === productId);
    if (productIndex === -1 || !dataCache.products) {
        throw new Error('Product not found.');
    }

    const newReview: Review = {
        ...reviewData,
        id: `rev_${Date.now()}`,
        date: new Date().toISOString(),
    };

    dataCache.products[productIndex].reviews.unshift(newReview);
    saveToStorage('products', dataCache.products);

    // Also update the user's purchasedProductIds to prevent multiple reviews (in this mock setup)
    const userIndex = dataCache.users?.findIndex(u => u.id === reviewData.userId);
    if(userIndex !== -1 && dataCache.users) {
        const user = dataCache.users[userIndex];
        if (!user.purchasedProductIds?.includes(productId)) {
            user.purchasedProductIds = [...(user.purchasedProductIds || []), productId];
            saveToStorage('users', dataCache.users);
        }
    }

    return JSON.parse(JSON.stringify(dataCache.products[productIndex]));
  },

  // Categories
  fetchCategories: async (): Promise<Category[]> => {
      await initializeData();
      await delay(100);
      const approvedCategories = dataCache.categories?.filter(c => c.status === ApprovalStatus.APPROVED) || [];
      return JSON.parse(JSON.stringify(approvedCategories));
  },

  fetchAllCategories: async(): Promise<Category[]> => {
    await initializeData();
    await delay(100);
    return JSON.parse(JSON.stringify(dataCache.categories || []));
  },

  proposeCategory: async (categoryData: Omit<Category, 'status'>): Promise<Category> => {
    const user = await getCurrentUserFromToken();
    await delay(300);
     if (dataCache.categories?.some(c => c.name.toLowerCase() === categoryData.name.toLowerCase())) {
        throw new Error('Category with this name already exists or is pending approval.');
    }
    const newCategory: Category = {
      ...categoryData,
      status: ApprovalStatus.PENDING_APPROVAL,
      proposerId: user.id
    };
    dataCache.categories?.push(newCategory);
    saveToStorage('categories', dataCache.categories);
    return JSON.parse(JSON.stringify(newCategory));
  },
  
  // Orders (Customer)
  fetchOrdersByUserId: async (userId: string, isTrial: boolean): Promise<Order[]> => {
      await initializeData();
      await delay(400);
      const userOrders = dataCache.orders?.filter(o => o.userId === userId && !!o.isTrialOrder === isTrial) || [];
      return JSON.parse(JSON.stringify(userOrders));
  },

  fetchOrderById: async (orderId: string): Promise<Order | undefined> => {
      await initializeData();
      await delay(200);
      const order = dataCache.orders?.find(o => o.id === orderId);
      return order ? JSON.parse(JSON.stringify(order)) : undefined;
  },

  fetchAllOrders: async (): Promise<Order[]> => {
      await initializeData();
      await delay(200);
      return JSON.parse(JSON.stringify(dataCache.orders || []));
  },
  
  createOrder: async (orderData: {
    userId: string;
    items: CartItem[];
    total: number;
    shippingAddress: Address;
    isTrialOrder?: boolean;
  }): Promise<Order> => {
    await initializeData();
    await delay(500);

    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      userId: orderData.userId,
      items: orderData.items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.purchaseType === 'buy' ? item.retailPrice : 0,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
      })),
      total: orderData.total,
      date: new Date().toISOString(),
      status: 'Processing',
      shippingAddress: orderData.shippingAddress,
      isTrialOrder: !!orderData.isTrialOrder,
      deliveryInfo: undefined,
    };
    
    const userIndex = dataCache.users?.findIndex(u => u.id === orderData.userId);
    if(userIndex !== -1 && dataCache.users) {
        const purchasedIds = orderData.items.filter(i => i.purchaseType === 'buy').map(i => i.id);
        if (purchasedIds.length > 0) {
            const user = dataCache.users[userIndex];
            user.purchasedProductIds = Array.from(new Set([...(user.purchasedProductIds || []), ...purchasedIds]));
            saveToStorage('users', dataCache.users);
        }
    }

    dataCache.orders?.unshift(newOrder);
    saveToStorage('orders', dataCache.orders);

    return JSON.parse(JSON.stringify(newOrder));
  },

  // Wishlist (Customer)
  toggleWishlist: async (productId: string): Promise<User> => {
      await initializeData();
      await delay(200);
      const user = await getCurrentUserFromToken();
      const userIndex = dataCache.users?.findIndex(u => u.id === user.id) ?? -1;

      if (userIndex > -1 && dataCache.users) {
          const userFromCache = dataCache.users[userIndex];
          const wishlist = userFromCache.wishlist || [];
          const productIndex = wishlist.indexOf(productId);

          if (productIndex > -1) {
              wishlist.splice(productIndex, 1);
          } else {
              wishlist.push(productId);
          }
          userFromCache.wishlist = wishlist;
          saveToStorage('users', dataCache.users);
          return JSON.parse(JSON.stringify(userFromCache));
      }
      throw new Error('User not found');
  },

  // Addresses (Customer)
  updateUserAddresses: async (addresses: Address[]): Promise<Address[]> => {
       await initializeData();
       await delay(300);
       const user = await getCurrentUserFromToken();
       const userIndex = dataCache.users?.findIndex(u => u.id === user.id) ?? -1;

       if (userIndex > -1 && dataCache.users) {
           dataCache.users[userIndex].addresses = addresses;
           saveToStorage('users', dataCache.users);
           return JSON.parse(JSON.stringify(addresses));
       }
       throw new Error('User not found');
  },
  
  // Admin Management
  fetchAdminAnalytics: async (): Promise<AdminAnalyticsData> => {
    await initializeData();
    await delay(500);

    const deliveredOrders = dataCache.orders?.filter(o => o.status === 'Delivered') || [];

    const totalSales = deliveredOrders.reduce((sum, order) => sum + order.total, 0);

    const salesByMonth = deliveredOrders.reduce((acc, order) => {
        const month = new Date(order.date).toLocaleString('default', { month: 'short', year: 'numeric' });
        const existing = acc.find(item => item.month === month);
        if (existing) {
            existing.sales += order.total;
        } else {
            acc.push({ month, sales: order.total });
        }
        return acc;
    }, [] as { month: string; sales: number }[]).sort((a,b) => new Date(a.month) < new Date(b.month) ? -1 : 1);
    
    const users = dataCache.users || [];
    const totalCustomers = users.filter(u => u.role === UserRole.CUSTOMER).length;
    const totalSellers = users.filter(u => u.role === UserRole.SELLER).length;
    
    const userRoleDistribution = users.reduce((acc, user) => {
        const existing = acc.find(item => item.role === user.role);
        if(existing) {
            existing.count++;
        } else {
            acc.push({ role: user.role, count: 1 });
        }
        return acc;
    }, [] as { role: UserRole, count: number }[]);


    return {
        totalSales,
        totalOrders: dataCache.orders?.length || 0,
        totalCustomers,
        totalSellers,
        salesByMonth,
        userRoleDistribution
    };
  },

  fetchUsers: async (): Promise<User[]> => {
    await initializeData();
    await delay(200);
    return JSON.parse(JSON.stringify(dataCache.users || []));
  },
  
   fetchUserById: async (userId: string): Promise<User | undefined> => {
    await initializeData();
    await delay(50);
    const user = dataCache.users?.find(u => u.id === userId);
    return user ? JSON.parse(JSON.stringify(user)) : undefined;
  },

  deleteUser: async (userId: string): Promise<void> => {
      await initializeData();
      await delay(300);
      const user = dataCache.users?.find(u => u.id === userId);
      if(!user) throw new Error("User not found.");
      if(user.role === UserRole.ADMIN) throw new Error("Cannot delete an admin user.");
      
      dataCache.users = dataCache.users?.filter(u => u.id !== userId);
      saveToStorage('users', dataCache.users);
  },

  updateUserRole: async(userId: string, role: UserRole): Promise<User> => {
      await initializeData();
      await delay(300);
      const userIndex = dataCache.users?.findIndex(u => u.id === userId) ?? -1;
      if(userIndex === -1 || !dataCache.users) throw new Error("User not found.");
      if(dataCache.users[userIndex].role === UserRole.ADMIN) throw new Error("Cannot change an admin's role.");
      
      dataCache.users[userIndex].role = role;
      saveToStorage('users', dataCache.users);
      return JSON.parse(JSON.stringify(dataCache.users[userIndex]));
  },

  approveSeller: async (userId: string): Promise<User> => {
      await initializeData();
      await delay(300);
      const userIndex = dataCache.users?.findIndex(u => u.id === userId) ?? -1;
      
      if (userIndex > -1 && dataCache.users) {
          const user = dataCache.users[userIndex];
          if (user.role === UserRole.PENDING_SELLER) {
              user.role = UserRole.SELLER;
              dataCache.users[userIndex] = user;
              saveToStorage('users', dataCache.users);
              return JSON.parse(JSON.stringify(user));
          }
          throw new Error('User is not a pending seller.');
      }
      throw new Error('User not found.');
  },

  updateProductStatus: async(productId: string, status: ApprovalStatus, rejectionReason?: string): Promise<Product> => {
      await initializeData();
      await delay(200);
      const productIndex = dataCache.products?.findIndex(p => p.id === productId) ?? -1;
      if (productIndex === -1 || !dataCache.products) {
          throw new Error('Product not found.');
      }
      dataCache.products[productIndex].status = status;
      dataCache.products[productIndex].rejectionReason = rejectionReason;
      saveToStorage('products', dataCache.products);
      return JSON.parse(JSON.stringify(dataCache.products[productIndex]));
  },

  updateCategoryStatus: async(categoryName: string, status: ApprovalStatus, rejectionReason?: string): Promise<Category> => {
      await initializeData();
      await delay(200);
      const catIndex = dataCache.categories?.findIndex(c => c.name === categoryName) ?? -1;
      if (catIndex === -1 || !dataCache.categories) {
          throw new Error('Category not found.');
      }
      dataCache.categories[catIndex].status = status;
      dataCache.categories[catIndex].rejectionReason = rejectionReason;
      saveToStorage('categories', dataCache.categories);
      return JSON.parse(JSON.stringify(dataCache.categories[catIndex]));
  },

  updateSlideStatus: async(slideId: string, status: ApprovalStatus, rejectionReason?: string): Promise<Slide> => {
      await initializeData();
      await delay(200);
      const slideIndex = dataCache.slides?.findIndex(s => s.id === slideId) ?? -1;
      if (slideIndex === -1 || !dataCache.slides) {
          throw new Error('Slide not found.');
      }
      dataCache.slides[slideIndex].status = status;
      dataCache.slides[slideIndex].rejectionReason = rejectionReason;
      saveToStorage('slides', dataCache.slides);
      return JSON.parse(JSON.stringify(dataCache.slides[slideIndex]));
  },

  addCategory: async (categoryData: Omit<Category, 'status' | 'proposerId' | 'rejectionReason'>): Promise<Category> => {
    const user = await getCurrentUserFromToken();
    if(user.role !== UserRole.ADMIN) throw new Error("Unauthorized");
    await delay(300);
     if (dataCache.categories?.some(c => c.name.toLowerCase() === categoryData.name.toLowerCase())) {
        throw new Error('Category with this name already exists.');
    }
    const newCategory: Category = {
      ...categoryData,
      status: ApprovalStatus.APPROVED,
    };
    dataCache.categories?.unshift(newCategory);
    saveToStorage('categories', dataCache.categories);
    return JSON.parse(JSON.stringify(newCategory));
  },
  
  deleteCategory: async(categoryName: string): Promise<void> => {
      await initializeData();
      await delay(300);
      
      const isUsed = dataCache.products?.some(p => p.category === categoryName);
      if(isUsed) {
          throw new Error("Cannot delete category. It is currently being used by one or more products.");
      }
      
      dataCache.categories = dataCache.categories?.filter(c => c.name !== categoryName);
      saveToStorage('categories', dataCache.categories);
  },

  // Product Management (Admin/Seller)
  addProduct: async (productData: Omit<Product, 'id' | 'sellerId' | 'reviews' | 'status'>): Promise<Product> => {
    const user = await getCurrentUserFromToken();
    await delay(500);

    const newProduct: Product = {
        id: `prod_${Date.now()}`,
        ...productData,
        sellerId: user.id,
        proposerId: user.id,
        reviews: [],
        faq: productData.faq || [],
        status: user.role === UserRole.ADMIN ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING_APPROVAL,
    };

    dataCache.products?.unshift(newProduct);
    saveToStorage('products', dataCache.products);
    return JSON.parse(JSON.stringify(newProduct));
  },
  
  updateProduct: async (productId: string, productData: Omit<Product, 'id' | 'sellerId' | 'reviews' | 'status' | 'imageUrl'> & { imageUrl?: string }): Promise<Product> => {
    const user = await getCurrentUserFromToken();
    await delay(500);
    
    const productIndex = dataCache.products?.findIndex(p => p.id === productId) ?? -1;
    if (productIndex === -1 || !dataCache.products) {
        throw new Error('Product not found.');
    }

    const originalProduct = dataCache.products[productIndex];
    // Retain original id, sellerId, and reviews when updating
    const updatedProduct = { ...originalProduct, ...productData };

    if (!updatedProduct.imageUrl) {
        updatedProduct.imageUrl = originalProduct.imageUrl;
    }

    // If a seller edits, it goes back to pending. Admin edits are auto-approved.
    updatedProduct.status = user.role === UserRole.ADMIN ? ApprovalStatus.APPROVED : ApprovalStatus.PENDING_APPROVAL;
    updatedProduct.rejectionReason = ''; // Clear rejection reason on re-submission

    dataCache.products[productIndex] = updatedProduct;
    saveToStorage('products', dataCache.products);

    return JSON.parse(JSON.stringify(updatedProduct));
  },

  deleteProduct: async (productId: string): Promise<void> => {
    await initializeData();
    await delay(300);
    const initialLength = dataCache.products?.length;
    dataCache.products = dataCache.products?.filter(p => p.id !== productId);
    if(dataCache.products?.length === initialLength) {
        throw new Error('Product not found for deletion.');
    }
    saveToStorage('products', dataCache.products);
  },
  
  toggleProductSaleStatus: async (productId: string): Promise<Product> => {
    await initializeData();
    await delay(200);
    const productIndex = dataCache.products?.findIndex(p => p.id === productId) ?? -1;
    if(productIndex === -1 || !dataCache.products) {
        throw new Error('Product not found.');
    }
    const product = dataCache.products[productIndex];
    product.onSale = !product.onSale;
    saveToStorage('products', dataCache.products);
    return JSON.parse(JSON.stringify(product));
  },

  fetchProductsBySellerId: async (sellerId: string): Promise<Product[]> => {
    await initializeData();
    await delay(300);
    const sellerProducts = dataCache.products?.filter(p => p.sellerId === sellerId) || [];
    return JSON.parse(JSON.stringify(sellerProducts));
  },

  // Slider Management
  fetchSlides: async(): Promise<Slide[]> => {
      await initializeData();
      await delay(200);
      const approvedSlides = dataCache.slides?.filter(s => s.status === ApprovalStatus.APPROVED) || [];
      return JSON.parse(JSON.stringify(approvedSlides));
  },

  fetchAllSlides: async(): Promise<Slide[]> => {
      await initializeData();
      await delay(200);
      return JSON.parse(JSON.stringify(dataCache.slides || []));
  },
  
  proposeSlide: async(slideData: Omit<Slide, 'id' | 'status' | 'proposerId'>): Promise<Slide> => {
      const user = await getCurrentUserFromToken();
      await delay(300);
      const newSlide: Slide = {
          ...slideData,
          id: `slide_${Date.now()}`,
          status: ApprovalStatus.PENDING_APPROVAL,
          proposerId: user.id
      };
      dataCache.slides?.push(newSlide);
      saveToStorage('slides', dataCache.slides);
      return JSON.parse(JSON.stringify(newSlide));
  },

  deleteSlide: async(slideId: string): Promise<void> => {
      await initializeData();
      await delay(300);
      dataCache.slides = dataCache.slides?.filter(s => s.id !== slideId);
      saveToStorage('slides', dataCache.slides);
  },

  calculateShipping: async (fromPincode: string, toPincode: string): Promise<{ fee: number; standardDeliveryDate: string; expressDeliveryDate: string; expressFee: number; }> => {
    await delay(400); // simulate network latency
    if (!fromPincode || !toPincode) {
        throw new Error("Both 'from' and 'to' pincodes are required.");
    }

    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (!pincodeRegex.test(fromPincode) || !pincodeRegex.test(toPincode)) {
        throw new Error("Invalid pincode format.");
    }
    
    // Mock distance calculation based on pincode prefixes for some consistency
    const fromVal = parseInt(fromPincode.substring(0, 3));
    const toVal = parseInt(toPincode.substring(0, 3));
    const randomFactor = parseInt(fromPincode.slice(-3)) + parseInt(toPincode.slice(-3));
    const distance = Math.abs(fromVal - toVal) * 2.5 + (randomFactor % 50);

    let standardFee = 40; // Base fee
    if (distance > 50) {
        standardFee += (Math.min(distance, 500) - 50) * 0.5; // 0.5/km for next 450km
    }
    if (distance > 500) {
        standardFee += (distance - 500) * 0.3; // 0.3/km thereafter
    }
    standardFee = Math.round(standardFee);

    const expressFee = Math.round(standardFee * 1.5 + 50); // Express is more expensive

    const getDeliveryDate = (addDays: number): string => {
        const date = new Date();
        date.setDate(date.getDate() + addDays);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const standardDeliveryDays = 2 + Math.floor(distance / 250);
    const expressDeliveryDays = 1 + Math.floor(distance / 500);

    const standardDeliveryDate = getDeliveryDate(standardDeliveryDays);
    const expressDeliveryDate = getDeliveryDate(expressDeliveryDays);

    return {
        fee: standardFee,
        expressFee,
        standardDeliveryDate,
        expressDeliveryDate
    };
},
  fetchGstRates: async (): Promise<{ category: string; rate: number }[]> => {
      await initializeData();
      await delay(50);
      return JSON.parse(JSON.stringify(dataCache.gstRates || []));
  },

  // External API - Unchanged
  reverseGeocode: async (lat: number, lon: number): Promise<Partial<Address>> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
      if (!response.ok) {
        throw new Error('Failed to fetch address');
      }
      const data = await response.json();
      const address = data.address;
      
      return {
        street: `${address.road || ''} ${address.house_number || ''}`.trim(),
        city: address.city || address.town || address.village || '',
        state: address.state || '',
        zip: address.postcode || '',
        country: address.country || '',
      };
    } catch (error) {
      console.error("Geocoding API error:", error);
      return {
        city: 'Cupertino',
        state: 'CA',
        street: '1 Infinite Loop',
        zip: '95014',
        country: 'USA'
      };
    }
  },
};

export default api;