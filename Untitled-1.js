// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/product');
const orderRoutes = require('./routes/order');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost/blinkit', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

app.listen(3000, () => console.log('Server started on port 3000'));

// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register route
router.post('/register', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = new User({
            email: req.body.email,
            password: hashedPassword,
        });
        await user.save();
        res.status(201).send('User created');
    } catch (error) {
        res.status(500).send(error);
    }
});

// Login route
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Email not found');
    
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.status(400).send('Invalid password');

    const token = jwt.sign({ _id: user._id }, 'secretKey');
    res.header('auth-token', token).send(token);
});

module.exports = router;

// routes/product.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Get all products
router.get('/', async (req, res) => {
    const products = await Product.find();
    res.send(products);
});

// Add a product
router.post('/', async (req, res) => {
    const product = new Product({
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
    });
    await product.save();
    res.send(product);
});

module.exports = router;

// routes/order.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Place an order
router.post('/', async (req, res) => {
    const order = new Order({
        user: req.body.user,
        products: req.body.products,
        total: req.body.total,
    });
    await order.save();
    res.send(order);
});

// Get orders by user
router.get('/:userId', async (req, res) => {
    const orders = await Order.find({ user: req.params.userId });
    res.send(orders);
});

module.exports = router;

// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
});

module.exports = mongoose.model('User', userSchema);

// models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
});

module.exports = mongoose.model('Product', productSchema);

// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }],
    total: { type: Number, required: true },
});

module.exports = mongoose.model('Order', orderSchema);

// App.js
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import ProductList from './components/ProductList';
import Cart from './components/Cart';

function App() {
    return (
        <Router>
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />
            <Route path="/products" component={ProductList} />
            <Route path="/cart" component={Cart} />
        </Router>
    );
}

export default App;