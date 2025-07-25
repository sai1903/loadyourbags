// server/index.js
// This file is a blueprint/example of what a Node.js/Express backend could look like.
// It is NOT connected to the frontend and does not run in this environment.
// A backend developer would use this as a starting point.

const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

// In a real app, you'd use a .env file for secrets
const JWT_SECRET = 'your-super-secret-key-for-jwt-change-this';

const app = express();
const PORT = process.env.PORT || 3001;

// --- DATABASE SIMULATION ---
// In a real application, you would connect to a database like PostgreSQL or MongoDB.
// For this example, we'll load our data from the JSON files.
const loadDbData = (fileName) => {
    const filePath = path.join(__dirname, '..', 'db', fileName);
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

let users = loadDbData('users.json');
let products = loadDbData('products.json');
let orders = loadDbData('orders.json');
let categories = loadDbData('categories.json');

// --- MIDDLEWARE ---
app.use(cors()); // Allows cross-origin requests from your frontend
app.use(bodyParser.json()); // Parses incoming JSON request bodies

// --- AUTHENTICATION MIDDLEWARE ---
// This middleware verifies the JWT and attaches the user payload to the request.
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }

    jwt.verify(token, JWT_SECRET, (err, userPayload) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token.' });
        }
        req.user = userPayload;
        next();
    });
};

// --- AUTHORIZATION MIDDLEWARE ---
// This middleware checks if the authenticated user has the required role.
// It should be used *after* authenticateToken.
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied. You do not have the required role.' });
        }
        next();
    };
};


// --- API ROUTES ---

// [Protected] Get current user profile based on token for session persistence.
app.get('/api/auth/me', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({ message: "User from token not found." });
    }
    res.json(user);
});


// [Public] Authentication
app.post('/api/auth/login', (req, res) => {
    const { role } = req.body;
    if (!role) {
        return res.status(400).json({ message: 'Role is required for login.' });
    }

    const user = users.find(u => u.role === role);
    if (!user) {
        return res.status(401).json({ message: 'User with that role not found.' });
    }

    const payload = { id: user.id, name: user.name, role: user.role };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
    
    res.json({ accessToken, user });
});

// [Public] Fetch products and categories
app.get('/api/products', (req, res) => res.json(products));
app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id);
    product ? res.json(product) : res.status(404).json({ message: 'Product not found' });
});
app.get('/api/categories', (req, res) => res.json(categories));

// --- CUSTOMER PORTAL ROUTES (Protected) ---

app.get('/api/orders', authenticateToken, authorizeRole(['CUSTOMER']), (req, res) => {
    const userOrders = orders.filter(o => o.userId === req.user.id);
    res.json(userOrders);
});

app.get('/api/addresses', authenticateToken, authorizeRole(['CUSTOMER']), (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    res.json(user?.addresses || []);
});

app.put('/api/addresses', authenticateToken, authorizeRole(['CUSTOMER']), (req, res) => {
    const updatedAddresses = req.body;
    if (!Array.isArray(updatedAddresses)) {
        return res.status(400).json({ message: 'Request body must be an array of addresses.'});
    }
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex > -1) {
        users[userIndex].addresses = updatedAddresses;
        res.json(users[userIndex].addresses);
    } else {
        res.status(404).json({ message: 'User not found.' });
    }
});


app.post('/api/wishlist/:productId', authenticateToken, authorizeRole(['CUSTOMER']), (req, res) => {
    const { productId } = req.params;
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex > -1) {
        const user = users[userIndex];
        const wishlist = user.wishlist || [];
        const productIndex = wishlist.indexOf(productId);

        if (productIndex > -1) {
            wishlist.splice(productIndex, 1);
        } else {
            wishlist.push(productId);
        }
        user.wishlist = wishlist;
        res.json(user); // Return the updated user object
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});


// --- SELLER PORTAL ROUTES (Protected) ---
app.post('/api/seller/products', authenticateToken, authorizeRole(['SELLER']), (req, res) => {
    const { name, category, price, description, imageUrl } = req.body;
    if (!name || !category || !price || !description) {
        return res.status(400).json({ message: 'Missing required product fields.' });
    }

    const newProduct = {
        id: `prod_${Date.now()}`,
        name,
        category,
        price: parseFloat(price),
        description,
        imageUrl: imageUrl || `https://picsum.photos/seed/${name.replace(/\s+/g, '-')}/600/400`,
        sellerId: req.user.id,
        rating: 0,
        reviewCount: 0,
        colors: ['Black'],
        isTrialAvailable: true,
    };

    products.unshift(newProduct);
    res.status(201).json(newProduct);
});

// --- ADMIN PORTAL ROUTES (Protected) ---
app.get('/api/admin/users', authenticateToken, authorizeRole(['ADMIN']), (req, res) => {
    const allUsers = users.map(({ id, name, email, role }) => ({ id, name, email, role }));
    res.json(allUsers);
});

app.put('/api/admin/users/:id/role', authenticateToken, authorizeRole(['ADMIN']), (req, res) => {
    const { role } = req.body;
    const { id } = req.params;
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
        users[userIndex].role = role;
        res.json(users[userIndex]);
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});


// --- SERVER START ---
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`
        =====================================================================
        ChromaCart Mock Backend Server is running on http://localhost:${PORT}
        
        This is an *example* server file. It is NOT connected to the frontend.
        It demonstrates how the API endpoints, authentication, and authorization
        would be implemented by a backend developer.
        
        To run this server:
        1. cd server
        2. npm install
        3. npm start
        =====================================================================
        `);
    });
}

module.exports = app;