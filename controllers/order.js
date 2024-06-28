const Order = require('../models/order');
const Cart = require('../models/cart');
const Product = require('../models/products');

const createOrder = async (req, res) => {
    try {
        const { user, address, paymentMethod, deliveryCharges, notes } = req.body;

        // Find the user's cart  and  replace the product field in each item of the cart with the actual product document from the Product collection. 
        const cart = await Cart.findOne({ user }).populate('item.product');
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found for this user' });
        }

        console.log("item",cart.item)

       

        console.log("total price from cart",cart.totalPrice)
       

        // Calculate the final price
        const finalTotal = cart.totalPrice + deliveryCharges;

        // Create a new order
        const newOrder = new Order({
            user: cart.user,
            item: cart.item,
            address,
            paymentMethod,
            deliveryCharges,
            finalTotal,
            notes
        });

        // Save the order
        await newOrder.save();

        // Clear the user's cart
        // cart.item = [];
        // cart.totalPrice = 0;
        await cart.save();

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ msg: 'Server error' });
    }
};

module.exports = { createOrder };
